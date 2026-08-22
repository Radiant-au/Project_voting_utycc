alter table public.voting_settings
  add column if not exists results_revealed boolean not null default false;

drop function if exists public.admin_live_top_projects();
create function public.admin_live_top_projects()
returns table (
  rank integer,
  hidden_project_code text,
  category text,
  title text,
  team_name text,
  image_url text,
  total_points integer
)
language sql
security definer
set search_path = ''
as $$
  select row_number() over (order by coalesce(sum(v.points), 0) desc, p.hidden_project_code)::integer,
    p.hidden_project_code,
    p.category,
    p.title,
    p.team_name,
    p.image_url,
    coalesce(sum(v.points), 0)::integer
  from public.projects p
  left join public.votes v on v.project_id = p.id
  where p.is_active
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
  group by p.id, p.hidden_project_code, p.category, p.title, p.team_name, p.image_url
  having coalesce(sum(v.points), 0) > 0
  order by coalesce(sum(v.points), 0) desc, p.hidden_project_code
  limit 5
$$;

revoke all on function public.admin_live_top_projects() from public, anon;
grant execute on function public.admin_live_top_projects() to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.voting_settings;
exception when duplicate_object then
  null;
end $$;
