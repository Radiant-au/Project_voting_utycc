grant select, insert, update on public.projects to authenticated;

drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects"
on public.projects
for all
to authenticated
using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));
