create table if not exists public.projects (
  id text primary key check (id ~ '^p[0-9]+$'),
  project_number text not null,
  title text not null,
  short_description text not null,
  full_description text not null,
  category text not null,
  team_name text not null,
  image_url text not null,
  features text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.voting_settings (
  id boolean primary key default true check (id),
  is_open boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.voting_settings (id, is_open) values (true, true)
on conflict (id) do nothing;

insert into public.projects (id, project_number, title, short_description, full_description, category, team_name, image_url, features)
values
  ('p1','01','Tide Lines','A tiny coastal sensor that turns shoreline data into a living soundscape.','Our team built a low-cost sensor buoy that measures salinity, temperature and tide movement. The installation translates each reading into a changing musical composition, making an invisible ecosystem audible to visitors.','Earth & Environment','The Blue Current','',array['Water, science','Visual data']),
  ('p2','02','Borrowed Light','A solar reading nook designed for the school’s forgotten corners.','A modular reading seat that stores daylight during the afternoon and releases a soft glow after sunset. We combined recycled timber, flexible solar film and a simple battery circuit.','Design & Technology','Studio 4B','',array['Recycled materials','Solar circuit']),
  ('p3','03','The Memory Garden','A tactile garden that preserves the stories of people who shaped our school.','Visitors explore plantings chosen for their cultural meanings while listening to recorded memories from alumni, caretakers and neighbours. The garden grows as the community contributes.','Arts & Culture','Common Ground','',array['Oral history','Community archive']),
  ('p4','04','Air We Share','Mapping invisible air currents through the school day.','A network of handmade paper pinwheels and open-source monitors reveals how air moves from classroom to classroom. The project pairs rigorous observation with a very human question: who gets the freshest air?','Science & Research','North Wing Lab','',array['Air quality','Open data']),
  ('p5','05','Second Skin','A collection of garments grown from food waste.','We experimented with bacterial cellulose made from fruit scraps, developing translucent sheets that can be stitched, dyed and composted at the end of their life.','Design & Technology','Mend / Make','',array['Bio-materials','Circular design']),
  ('p6','06','Small Acts, Big Map','A neighbourhood map built from everyday acts of care.','Every mark on this hand-drawn map represents a small act of care: a repaired bike, a shared meal, a borrowed book. It asks us to notice the infrastructure of kindness around us.','Social Inquiry','The Listening Post','',array['Field notes','Participatory map']),
  ('p7','07','Night Sky Radio','An interactive radio broadcast from the edge of the visible universe.','Tune across a room-sized radio to hear the mathematics of stars become rhythm and texture. The project makes astronomical scale intimate through sound, light and a lot of careful coding.','Science & Research','Signal / Noise','',array['Radio astronomy','Generative sound']),
  ('p8','08','Kitchen Table Atlas','Recipes and migration stories from our school community.','A printed atlas maps family recipes to the journeys that brought them here. Each page begins with a dish and opens into a story about memory, language and the places we carry.','Arts & Culture','Many Tables','',array['Food stories','Print atlas']),
  ('p9','09','The Quiet Machine','A kinetic sculpture that responds to the sounds of a room.','When the room is loud, the machine folds in on itself. When it is quiet, it unfolds slowly. Our sculpture turns collective attention into a visible, shared choreography.','Arts & Culture','Soft Mechanisms','',array['Kinetic sculpture','Sound reactive']),
  ('p10','10','Pocket Pollinators','A pocket-sized habitat kit for balconies and window ledges.','A kit of seed cards, nesting tubes and illustrated instructions helps people make small habitats wherever they live. We tested the kits with neighbours across three apartment blocks.','Earth & Environment','Wild Window','',array['Urban ecology','Take-home kit']),
  ('p11','11','Language Weather','A forecast made from the words our school uses every day.','We collected anonymous snippets of school language and visualised their mood over a month. The result is a changing weather map that reflects how a community speaks to itself.','Social Inquiry','Word Watch','',array['Text analysis','Community research']),
  ('p12','12','Repair Radio','A broadcast studio for fixing things and telling their stories.','Every repaired object has a history. Our pop-up radio station records those histories while teaching basic repair skills, creating a practical archive of how things stay useful.','Design & Technology','Fixers Collective','',array['Repair culture','Live broadcast'])
on conflict (id) do nothing;

alter table public.votes add column if not exists points integer;
update public.votes set points = case category when 'student' then 1 when 'teacher' then 2 when 'visitor' then 3 end where points is null;
alter table public.votes alter column points set not null;
alter table public.votes drop constraint if exists votes_points_check;
alter table public.votes add constraint votes_points_check check (points in (1, 2, 3));
alter table public.votes drop constraint if exists votes_project_id_fkey;
alter table public.votes add constraint votes_project_id_fkey foreign key (project_id) references public.projects(id);

create table if not exists public.voter_rate_limits (
  action text not null check (action in ('verify', 'vote')),
  fingerprint text not null,
  window_started_at timestamptz not null,
  attempts integer not null default 1 check (attempts > 0),
  expires_at timestamptz not null,
  primary key (action, fingerprint, window_started_at)
);
create index if not exists voter_rate_limits_expiry_idx on public.voter_rate_limits (expires_at);

alter table public.projects enable row level security;
alter table public.voting_settings enable row level security;
alter table public.voter_rate_limits enable row level security;
revoke all on public.projects, public.voting_settings, public.voter_rate_limits from anon, authenticated;

create or replace function public.verify_voter_code(input_code text)
returns table (voting_code_id uuid, category text)
language sql
security definer
set search_path = ''
as $$
  select id, voting_codes.category
  from public.voting_codes
  where code = upper(btrim(input_code)) and status = 'unused'
  limit 1
$$;

create or replace function public.check_voter_rate_limit(input_action text, input_fingerprint text)
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  duration_seconds integer := case input_action when 'verify' then 600 when 'vote' then 60 else 0 end;
  maximum_attempts integer := case input_action when 'verify' then 10 when 'vote' then 6 else 0 end;
  bucket timestamptz;
  current_attempts integer;
begin
  if duration_seconds = 0 or input_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid rate limit input';
  end if;
  bucket := to_timestamp(floor(extract(epoch from clock_timestamp()) / duration_seconds) * duration_seconds);
  insert into public.voter_rate_limits (action, fingerprint, window_started_at, expires_at)
  values (input_action, input_fingerprint, bucket, bucket + make_interval(secs => duration_seconds))
  on conflict (action, fingerprint, window_started_at)
  do update set attempts = public.voter_rate_limits.attempts + 1
  returning attempts into current_attempts;
  delete from public.voter_rate_limits where expires_at < clock_timestamp() - interval '1 hour';
  return query select current_attempts <= maximum_attempts,
    greatest(1, ceil(extract(epoch from bucket + make_interval(secs => duration_seconds) - clock_timestamp()))::integer);
end
$$;

drop function if exists public.submit_voter_vote(uuid, text);
create function public.submit_voter_vote(input_voting_code_id uuid, input_project_id text)
returns table (result text, vote_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_code public.voting_codes%rowtype;
  created_vote_id uuid;
  trusted_points integer;
begin
  select * into found_code from public.voting_codes where id = input_voting_code_id for update;
  if not found or found_code.status <> 'unused' then return query select 'invalid'::text, null::uuid; return; end if;
  if not exists (select 1 from public.voting_settings where id and is_open) then return query select 'closed'::text, null::uuid; return; end if;
  if not exists (select 1 from public.projects where id = btrim(input_project_id) and is_active) then return query select 'invalid_project'::text, null::uuid; return; end if;
  trusted_points := case found_code.category when 'student' then 1 when 'teacher' then 2 when 'visitor' then 3 end;
  insert into public.votes (voting_code_id, project_id, category, points)
  values (found_code.id, btrim(input_project_id), found_code.category, trusted_points)
  returning id into created_vote_id;
  update public.voting_codes set status = 'used', used_at = now() where id = found_code.id;
  return query select 'submitted'::text, created_vote_id;
exception when unique_violation then
  return query select 'invalid'::text, null::uuid;
end
$$;

revoke all on function public.verify_voting_code(text) from anon, authenticated;
revoke all on function public.submit_vote(text, text) from anon, authenticated;
revoke all on function public.verify_voter_code(text) from public, anon, authenticated;
revoke all on function public.check_voter_rate_limit(text, text) from public, anon, authenticated;
revoke all on function public.submit_voter_vote(uuid, text) from public, anon, authenticated;
grant execute on function public.verify_voter_code(text) to service_role;
grant execute on function public.check_voter_rate_limit(text, text) to service_role;
grant execute on function public.submit_voter_vote(uuid, text) to service_role;

