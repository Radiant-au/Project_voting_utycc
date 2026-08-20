update public.projects
set category = 'Design & Technology'
where category not in ('Earth & Environment', 'Design & Technology');

alter table public.projects
  drop constraint if exists projects_category_check;

alter table public.projects
  add constraint projects_category_check
  check (category in ('Earth & Environment', 'Design & Technology'));
