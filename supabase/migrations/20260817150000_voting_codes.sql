create extension if not exists pgcrypto with schema extensions;

create table public.voting_codes (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{7}$'),
  category text not null check (category in ('student', 'teacher', 'visitor')),
  status text not null default 'unused' check (status in ('unused', 'used', 'disabled')),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  constraint voting_codes_used_at_check check (
    (status = 'used' and used_at is not null) or
    (status <> 'used' and used_at is null)
  )
);

create table public.votes (
  id uuid primary key default extensions.gen_random_uuid(),
  voting_code_id uuid not null unique references public.voting_codes(id),
  project_id text not null check (project_id ~ '^p[0-9]+$'),
  category text not null check (category in ('student', 'teacher', 'visitor')),
  created_at timestamptz not null default now()
);

alter table public.voting_codes enable row level security;
alter table public.votes enable row level security;
revoke all on public.voting_codes, public.votes from anon, authenticated;

create or replace function public.is_voting_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create or replace function public.verify_voting_code(input_code text)
returns table (result text, category text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_code text := upper(btrim(input_code));
  found_code public.voting_codes%rowtype;
begin
  if normalized_code !~ '^[A-Z0-9]{7}$' then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select * into found_code
  from public.voting_codes
  where code = normalized_code;

  if not found then
    return query select 'invalid'::text, null::text;
  elsif found_code.status = 'used' then
    return query select 'used'::text, null::text;
  elsif found_code.status = 'disabled' then
    return query select 'disabled'::text, null::text;
  else
    return query select 'valid'::text, found_code.category;
  end if;
end
$$;

create or replace function public.submit_vote(input_code text, input_project_id text)
returns table (result text, vote_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_code text := upper(btrim(input_code));
  found_code public.voting_codes%rowtype;
  created_vote_id uuid;
begin
  if normalized_code !~ '^[A-Z0-9]{7}$' or length(btrim(input_project_id)) = 0 then
    return query select 'invalid'::text, null::uuid;
    return;
  end if;

  select * into found_code
  from public.voting_codes
  where code = normalized_code
  for update;

  if not found then
    return query select 'invalid'::text, null::uuid;
  elsif found_code.status = 'used' then
    return query select 'used'::text, null::uuid;
  elsif found_code.status = 'disabled' then
    return query select 'disabled'::text, null::uuid;
  else
    insert into public.votes (voting_code_id, project_id, category)
    values (found_code.id, btrim(input_project_id), found_code.category)
    returning id into created_vote_id;

    update public.voting_codes
    set status = 'used', used_at = now()
    where id = found_code.id;

    return query select 'submitted'::text, created_vote_id;
  end if;
end
$$;

create or replace function public.generate_voting_codes(input_category text, input_count integer)
returns setof public.voting_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  new_code text;
  generated integer := 0;
  random_bytes bytea;
begin
  if not public.is_voting_admin() then
    raise exception 'admin role required' using errcode = '42501';
  end if;
  if input_category not in ('student', 'teacher', 'visitor') or input_count not between 1 and 100 then
    raise exception 'invalid category or count';
  end if;

  while generated < input_count loop
    random_bytes := extensions.gen_random_bytes(7);
    new_code := '';
    for position in 0..6 loop
      new_code := new_code || substr(alphabet, get_byte(random_bytes, position) % 36 + 1, 1);
    end loop;
    begin
      return query
        insert into public.voting_codes (code, category)
        values (new_code, input_category)
        returning *;
      generated := generated + 1;
    exception when unique_violation then
      null;
    end;
  end loop;
end
$$;

create or replace function public.list_voting_codes(input_category text default null, input_status text default null)
returns setof public.voting_codes
language plpgsql
security definer
set search_path = ''
as $$
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
  return query
    select codes.* from public.voting_codes codes
    where (input_category is null or codes.category = input_category)
      and (input_status is null or codes.status = input_status)
    order by codes.created_at desc;
end
$$;

create or replace function public.disable_voting_code(input_code text)
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
  set status = 'disabled'
  where code = upper(btrim(input_code)) and status = 'unused';
  return found;
end
$$;

revoke all on function public.is_voting_admin() from public, anon, authenticated;
revoke all on function public.verify_voting_code(text) from public, anon, authenticated;
revoke all on function public.submit_vote(text, text) from public, anon, authenticated;
revoke all on function public.generate_voting_codes(text, integer) from public, anon, authenticated;
revoke all on function public.list_voting_codes(text, text) from public, anon, authenticated;
revoke all on function public.disable_voting_code(text) from public, anon, authenticated;

grant execute on function public.verify_voting_code(text) to anon, authenticated;
grant execute on function public.submit_vote(text, text) to anon, authenticated;
grant execute on function public.generate_voting_codes(text, integer) to authenticated;
grant execute on function public.list_voting_codes(text, text) to authenticated;
grant execute on function public.disable_voting_code(text) to authenticated;
