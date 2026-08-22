create or replace function public.list_code_vote_history(
  input_query text default null,
  input_category text default null,
  input_status text default null
)
returns table (
  voting_code_id uuid,
  code text,
  category text,
  status text,
  vote_id uuid,
  voted_at timestamptz,
  project_id text,
  project_title text
)
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
    select codes.id, codes.code, codes.category, codes.status,
      votes.id, votes.created_at, projects.id, projects.title
    from public.voting_codes codes
    left join public.votes votes on votes.voting_code_id = codes.id
    left join public.projects projects on projects.id = votes.project_id
    where (input_category is null or codes.category = input_category)
      and (input_status is null or codes.status = input_status)
      and (nullif(btrim(input_query), '') is null
        or codes.code ilike '%' || btrim(input_query) || '%'
        or projects.title ilike '%' || btrim(input_query) || '%')
    order by coalesce(votes.created_at, codes.created_at) desc
    limit 500;
end
$$;

revoke all on function public.list_code_vote_history(text, text, text) from public, anon, authenticated;
grant execute on function public.list_code_vote_history(text, text, text) to authenticated;
