-- ==========================================
-- Migration 2: match_events table with idempotency key and trigger
-- ==========================================

-- match_events: append-only event log
create table public.match_events (
  id              uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,    -- client-generated UUID, UNIQUE prevents double-submit
  match_id        uuid not null references public.matches(id),
  event_type      text not null check (event_type in ('point_scored', 'point_undone')),
  scoring_team    smallint check (scoring_team in (1, 2)),  -- null for point_undone
  team1_score     smallint not null,  -- snapshot AFTER this event is applied
  team2_score     smallint not null,
  game_number     smallint not null,
  created_by      uuid not null references auth.users(id),
  created_at      timestamptz not null default now()
);

create index on public.match_events (match_id, created_at);

-- Trigger: sync denormalized scores on matches after each event insert
create or replace function public.sync_match_scores()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.matches
  set
    current_score_team1 = NEW.team1_score,
    current_score_team2 = NEW.team2_score,
    current_game        = NEW.game_number,
    updated_at          = now()
  where id = NEW.match_id;
  return NEW;
end;
$$;

create trigger trg_sync_match_scores
after insert on public.match_events
for each row
execute function public.sync_match_scores();
