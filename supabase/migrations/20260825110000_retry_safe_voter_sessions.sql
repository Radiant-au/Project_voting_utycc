-- Schedule `select public.cleanup_voter_rate_limit_data()` separately (for example, every 5 minutes with Supabase Cron).
-- It is deliberately not called by request-time RPCs.
create table if not exists public.voter_vote_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  voting_code_id uuid not null unique references public.voting_codes(id) on delete cascade,
  category text not null check (category in ('student', 'teacher', 'visitor')),
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null
);

create index if not exists voter_vote_sessions_expires_at_idx on public.voter_vote_sessions (expires_at);

create table if not exists public.voter_vote_idempotency (
  idempotency_key uuid primary key,
  voting_session_id uuid not null references public.voter_vote_sessions(id) on delete cascade,
  project_id text not null check (project_id ~ '^p[0-9]+$'),
  vote_id uuid references public.votes(id),
  created_at timestamptz not null default clock_timestamp()
);

create index if not exists voter_vote_idempotency_session_idx on public.voter_vote_idempotency (voting_session_id);

alter table public.voter_vote_sessions enable row level security;
alter table public.voter_vote_idempotency enable row level security;
revoke all on public.voter_vote_sessions, public.voter_vote_idempotency from public, anon, authenticated;

create or replace function public.check_voter_rate_limit(input_action text, input_fingerprint text)
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  duration_seconds integer := case input_action when 'verify' then 600 when 'vote' then 300 else 0 end;
  maximum_attempts integer := case input_action when 'verify' then 20 when 'vote' then 10 else 0 end;
  bucket timestamptz;
  current_attempts integer;
begin
  if duration_seconds = 0 or input_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'invalid rate limit input'; end if;
  bucket := to_timestamp(floor(extract(epoch from clock_timestamp()) / duration_seconds) * duration_seconds);
  insert into public.voter_rate_limits (action, fingerprint, window_started_at, expires_at)
  values (input_action, input_fingerprint, bucket, bucket + make_interval(secs => duration_seconds))
  on conflict (action, fingerprint, window_started_at) do update set attempts = public.voter_rate_limits.attempts + 1
  returning attempts into current_attempts;
  return query select current_attempts <= maximum_attempts,
    greatest(1, ceil(extract(epoch from bucket + make_interval(secs => duration_seconds) - clock_timestamp()))::integer);
end
$$;

create or replace function public.start_voter_vote_session(input_code text)
returns table (result text, category text, voting_session_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_code public.voting_codes%rowtype;
  found_session public.voter_vote_sessions%rowtype;
  normalized_code text := upper(btrim(input_code));
begin
  if normalized_code !~ '^[A-Z0-9]{7}$' then return query select 'invalid'::text, null::text, null::uuid; return; end if;
  select * into found_code from public.voting_codes where code = normalized_code for update;
  if not found or found_code.status = 'disabled' then return query select 'invalid'::text, null::text, null::uuid; return; end if;
  if found_code.status = 'used' then return query select 'used'::text, found_code.category, null::uuid; return; end if;
  select * into found_session from public.voter_vote_sessions where voting_code_id = found_code.id for update;
  if not found or found_session.expires_at <= clock_timestamp() then
    insert into public.voter_vote_sessions (voting_code_id, category, expires_at)
    values (found_code.id, found_code.category, clock_timestamp() + interval '15 minutes')
    on conflict (voting_code_id) do update set id = extensions.gen_random_uuid(), category = excluded.category, created_at = clock_timestamp(), expires_at = excluded.expires_at
    returning * into found_session;
  end if;
  return query select 'valid'::text, found_code.category, found_session.id;
end
$$;

drop function if exists public.submit_voter_vote(uuid, text);
create function public.submit_voter_vote(input_voting_session_id uuid, input_project_id text, input_idempotency_key uuid)
returns table (result text, vote_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_session public.voter_vote_sessions%rowtype;
  found_code public.voting_codes%rowtype;
  previous_request public.voter_vote_idempotency%rowtype;
  current_settings public.voting_settings%rowtype;
  created_vote_id uuid;
  normalized_project_id text := btrim(input_project_id);
  trusted_points integer;
begin
  if normalized_project_id !~ '^p[0-9]+$' then return query select 'invalid_project'::text, null::uuid; return; end if;
  select * into found_session from public.voter_vote_sessions where id = input_voting_session_id for update;
  if not found then return query select 'invalid_session'::text, null::uuid; return; end if;
  select * into previous_request from public.voter_vote_idempotency where idempotency_key = input_idempotency_key for update;
  if found then
    if previous_request.voting_session_id <> found_session.id or previous_request.project_id <> normalized_project_id then return query select 'idempotency_conflict'::text, null::uuid; return; end if;
    if previous_request.vote_id is not null then return query select 'submitted'::text, previous_request.vote_id; return; end if;
  end if;
  if found_session.expires_at <= clock_timestamp() then return query select 'expired'::text, null::uuid; return; end if;
  select * into found_code from public.voting_codes where id = found_session.voting_code_id for update;
  if not found or found_code.status <> 'unused' or found_code.category <> found_session.category then return query select 'invalid'::text, null::uuid; return; end if;
  select * into current_settings from public.voting_settings where id for key share;
  if not found or not current_settings.is_open then return query select 'closed'::text, null::uuid; return; end if;
  if not exists (select 1 from public.projects where id = normalized_project_id and is_active) then return query select 'invalid_project'::text, null::uuid; return; end if;
  trusted_points := case found_code.category when 'student' then current_settings.student_points when 'teacher' then current_settings.teacher_points when 'visitor' then current_settings.visitor_points end;
  insert into public.voter_vote_idempotency (idempotency_key, voting_session_id, project_id) values (input_idempotency_key, found_session.id, normalized_project_id);
  insert into public.votes (voting_code_id, project_id, category, points) values (found_code.id, normalized_project_id, found_code.category, trusted_points) returning id into created_vote_id;
  update public.voter_vote_idempotency set vote_id = created_vote_id where idempotency_key = input_idempotency_key;
  update public.voting_codes set status = 'used', used_at = clock_timestamp() where id = found_code.id;
  return query select 'submitted'::text, created_vote_id;
exception when unique_violation then
  return query select 'invalid'::text, null::uuid;
end
$$;

create or replace function public.cleanup_voter_rate_limit_data()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare deleted_count integer;
begin
  delete from public.voter_rate_limits where ctid in (select ctid from public.voter_rate_limits where expires_at < clock_timestamp() - interval '1 hour' order by expires_at limit 10000);
  get diagnostics deleted_count = row_count;
  delete from public.voter_vote_sessions where ctid in (select ctid from public.voter_vote_sessions where expires_at < clock_timestamp() - interval '1 day' order by expires_at limit 10000);
  return deleted_count;
end
$$;

revoke all on function public.check_voter_rate_limit(text, text) from public, anon, authenticated;
revoke all on function public.start_voter_vote_session(text) from public, anon, authenticated;
revoke all on function public.submit_voter_vote(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.cleanup_voter_rate_limit_data() from public, anon, authenticated;
grant execute on function public.check_voter_rate_limit(text, text) to service_role;
grant execute on function public.start_voter_vote_session(text) to service_role;
grant execute on function public.submit_voter_vote(uuid, text, uuid) to service_role;
grant execute on function public.cleanup_voter_rate_limit_data() to service_role;
