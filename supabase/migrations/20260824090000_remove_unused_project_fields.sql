alter table public.projects
  drop column if exists full_description,
  drop column if exists project_number;

alter table public.projects
  drop constraint if exists projects_id_check;

alter table public.projects
  alter column id set default gen_random_uuid()::text;
