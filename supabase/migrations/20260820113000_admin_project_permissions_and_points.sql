grant usage on schema public to authenticated;
grant select, insert, update on public.projects, public.voting_settings to authenticated;

drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects"
on public.projects for all to authenticated
using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

drop policy if exists "admins manage voting settings" on public.voting_settings;
create policy "admins manage voting settings"
on public.voting_settings for all to authenticated
using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

alter table public.voting_settings
  add column if not exists student_points integer not null default 1 check (student_points between 1 and 100),
  add column if not exists teacher_points integer not null default 2 check (teacher_points between 1 and 100),
  add column if not exists visitor_points integer not null default 3 check (visitor_points between 1 and 100);

alter table public.votes drop constraint if exists votes_points_check;
alter table public.votes add constraint votes_points_check check (points between 1 and 100);

create or replace function public.submit_voter_vote(input_voting_code_id uuid, input_project_id text)
returns table (result text, vote_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_code public.voting_codes%rowtype;
  current_settings public.voting_settings%rowtype;
  created_vote_id uuid;
  trusted_points integer;
begin
  select * into found_code from public.voting_codes where id = input_voting_code_id for update;
  if not found or found_code.status <> 'unused' then return query select 'invalid'::text, null::uuid; return; end if;
  select * into current_settings from public.voting_settings where id for key share;
  if not found or not current_settings.is_open then return query select 'closed'::text, null::uuid; return; end if;
  if not exists (select 1 from public.projects where id = btrim(input_project_id) and is_active) then return query select 'invalid_project'::text, null::uuid; return; end if;
  trusted_points := case found_code.category when 'student' then current_settings.student_points when 'teacher' then current_settings.teacher_points when 'visitor' then current_settings.visitor_points end;
  insert into public.votes (voting_code_id, project_id, category, points)
  values (found_code.id, btrim(input_project_id), found_code.category, trusted_points)
  returning id into created_vote_id;
  update public.voting_codes set status = 'used', used_at = now() where id = found_code.id;
  return query select 'submitted'::text, created_vote_id;
exception when unique_violation then
  return query select 'invalid'::text, null::uuid;
end
$$;
