alter table public.votes
  drop constraint if exists votes_project_id_check;

alter table public.voter_vote_idempotency
  drop constraint if exists voter_vote_idempotency_project_id_check;
