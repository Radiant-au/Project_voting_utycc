alter table public.voting_codes
add column if not exists is_printed boolean not null default false;

drop function if exists public.list_voting_codes(text, text);

create function public.list_voting_codes(
  input_category text default null,
  input_status text default null,
  input_query text default null,
  input_is_printed boolean default null
)
returns setof public.voting_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_query text := upper(btrim(coalesce(input_query, '')));
begin
  if not public.is_voting_admin() then
    raise exception 'admin role required' using errcode = '42501';
  end if;
  if input_category is not null and input_category not in ('student', 'teacher', 'visitor') then
    raise exception 'invalid category';
  end if;
  if input_status is not null and input_status not in ('unused', 'used', 'disabled') then
    raise exception 'invalid status';
  end if;
  if normalized_query <> '' and normalized_query !~ '^[A-Z0-9]+$' then
    raise exception 'invalid code search';
  end if;
  return query
    select codes.* from public.voting_codes codes
    where (input_category is null or codes.category = input_category)
      and (input_status is null or codes.status = input_status)
      and (input_is_printed is null or codes.is_printed = input_is_printed)
      and (normalized_query = '' or codes.code like '%' || normalized_query || '%')
    order by codes.created_at desc;
end
$$;

create or replace function public.set_voting_code_printed(input_code text, input_is_printed boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_voting_admin() then
    raise exception 'admin role required' using errcode = '42501';
  end if;
  update public.voting_codes
  set is_printed = input_is_printed
  where code = upper(btrim(input_code));
  return found;
end
$$;

create or replace function public.replace_printed_voting_codes(
  input_student_codes text[],
  input_visitor_codes text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' and not public.is_voting_admin() then
    raise exception 'admin role required' using errcode = '42501';
  end if;
  if coalesce(cardinality(input_student_codes), 0) <> 1000 or coalesce(cardinality(input_visitor_codes), 0) <> 100 then
    raise exception 'unexpected printed code count';
  end if;
  if exists (
    select 1 from unnest(input_student_codes || input_visitor_codes) as source(code)
    where source.code !~ '^[A-Z0-9]{7}$'
  ) then
    raise exception 'invalid printed code';
  end if;
  if (select count(*) from (select distinct code from unnest(input_student_codes || input_visitor_codes) as source(code)) unique_codes) <> 1100 then
    raise exception 'duplicate printed code';
  end if;
  if exists (
    select 1 from public.voting_codes codes
    where codes.category = 'teacher'
      and codes.code = any(input_student_codes || input_visitor_codes)
  ) then
    raise exception 'printed code collides with teacher code';
  end if;

  delete from public.voter_vote_idempotency idempotency
  where idempotency.voting_session_id in (
    select sessions.id
    from public.voter_vote_sessions sessions
    join public.voting_codes codes on codes.id = sessions.voting_code_id
    where codes.category in ('student', 'visitor')
  ) or idempotency.vote_id in (
    select votes.id
    from public.votes votes
    join public.voting_codes codes on codes.id = votes.voting_code_id
    where codes.category in ('student', 'visitor')
  );

  delete from public.voter_vote_sessions sessions
  using public.voting_codes codes
  where codes.id = sessions.voting_code_id
    and codes.category in ('student', 'visitor');

  delete from public.votes votes
  using public.voting_codes codes
  where codes.id = votes.voting_code_id
    and codes.category in ('student', 'visitor');

  delete from public.voting_codes
  where category in ('student', 'visitor');

  insert into public.voting_codes (code, category, is_printed)
  select code, 'student', true
  from unnest(input_student_codes) as source(code);

  insert into public.voting_codes (code, category, is_printed)
  select code, 'visitor', true
  from unnest(input_visitor_codes) as source(code);
end
$$;

revoke all on function public.list_voting_codes(text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.set_voting_code_printed(text, boolean) from public, anon, authenticated;
revoke all on function public.replace_printed_voting_codes(text[], text[]) from public, anon, authenticated;

grant execute on function public.list_voting_codes(text, text, text, boolean) to authenticated;
grant execute on function public.set_voting_code_printed(text, boolean) to authenticated;
grant execute on function public.replace_printed_voting_codes(text[], text[]) to authenticated, service_role;
