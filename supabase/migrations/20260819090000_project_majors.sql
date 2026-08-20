update public.projects
set category = case mod(project_number::integer - 1, 5)
  when 0 then 'Information Science and Technology'
  when 1 then 'Computer Engineering'
  when 2 then 'Electronic Engineering'
  when 3 then 'Advanced Material Engineering'
  else 'Precision Engineering'
end
where project_number ~ '^[0-9]+$';
