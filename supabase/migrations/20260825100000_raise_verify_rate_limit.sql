create or replace function public.check_voter_rate_limit(input_action text, input_fingerprint text)
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  duration_seconds integer := case input_action when 'verify' then 600 when 'vote' then 60 else 0 end;
  maximum_attempts integer := case input_action when 'verify' then 300 when 'vote' then 6 else 0 end;
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
