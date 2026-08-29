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
  existing_count integer;
  random_bytes bytea;
begin
  if not public.is_voting_admin() then
    raise exception 'admin role required' using errcode = '42501';
  end if;
  if input_category not in ('student', 'teacher', 'visitor') or input_count not between 1 and 800 then
    raise exception 'invalid category or count';
  end if;
  if input_category = 'student' then
    select count(*) into existing_count
    from public.voting_codes
    where category = 'student';
    if existing_count + input_count > 800 then
      raise exception 'student code limit is 800';
    end if;
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

delete from public.voting_codes codes
where codes.category = 'student'
  and codes.status = 'unused'
  and codes.id in (
    select id
    from (
      select id, row_number() over (order by created_at, id) as code_number
      from public.voting_codes
      where category = 'student'
    ) ranked
    where code_number > 800
  );
