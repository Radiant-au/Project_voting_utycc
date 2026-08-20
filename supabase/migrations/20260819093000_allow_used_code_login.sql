drop function if exists public.verify_voter_code(text);
create function public.verify_voter_code(input_code text)
returns table (voting_code_id uuid, category text, has_voted boolean)
language sql
security definer
set search_path = ''
as $$
  select id, voting_codes.category, status = 'used'
  from public.voting_codes
  where code = upper(btrim(input_code)) and status in ('unused', 'used')
  limit 1
$$;

revoke all on function public.verify_voter_code(text) from public, anon, authenticated;
grant execute on function public.verify_voter_code(text) to service_role;
