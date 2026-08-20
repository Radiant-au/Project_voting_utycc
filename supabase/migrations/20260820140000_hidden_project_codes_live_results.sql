alter table public.projects
  add column if not exists hidden_project_code text;

update public.projects
set hidden_project_code = 'PC' || lpad(project_number, 3, '0')
where hidden_project_code is null;

alter table public.projects
  alter column hidden_project_code set not null;

alter table public.projects
  drop constraint if exists projects_hidden_project_code_format;

alter table public.projects
  add constraint projects_hidden_project_code_format
  check (hidden_project_code ~ '^[A-Z0-9][A-Z0-9-]{2,31}$');

create unique index if not exists projects_hidden_project_code_key
  on public.projects (hidden_project_code);

create or replace function public.admin_live_top_projects()
returns table (
  rank integer,
  hidden_project_code text,
  category text,
  total_points integer
)
language sql
security definer
set search_path = ''
as $$
  select row_number() over (order by coalesce(sum(v.points), 0) desc, p.hidden_project_code)::integer,
    p.hidden_project_code,
    p.category,
    coalesce(sum(v.points), 0)::integer
  from public.projects p
  left join public.votes v on v.project_id = p.id
  where p.is_active
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
  group by p.id, p.hidden_project_code, p.category
  having coalesce(sum(v.points), 0) > 0
  order by coalesce(sum(v.points), 0) desc, p.hidden_project_code
  limit 5
$$;

revoke all on function public.admin_live_top_projects() from public, anon;
grant execute on function public.admin_live_top_projects() to authenticated;

grant select on public.votes to authenticated;
alter table public.votes enable row level security;
drop policy if exists "admins read votes" on public.votes;
create policy "admins read votes"
on public.votes for select to authenticated
using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

do $$
begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then
  null;
end $$;
