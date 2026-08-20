alter table public.projects
  drop constraint if exists projects_category_check;

update public.projects
set category = case mod(project_number::integer - 1, 5)
  when 0 then 'Information Science'
  when 1 then 'Computer Engineering'
  when 2 then 'Electronic Engineering'
  when 3 then 'Precision Engineering'
  else 'Advanced Material Engineering'
end
where project_number ~ '^[0-9]+$';

alter table public.projects
  add constraint projects_category_check
  check (category in (
    'Information Science',
    'Computer Engineering',
    'Electronic Engineering',
    'Precision Engineering',
    'Advanced Material Engineering'
  ));
