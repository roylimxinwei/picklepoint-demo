-- ==========================================
-- Migration 1: Core entity tables
-- All 12 entity tables in dependency order.
-- match_events is created in migration 2.
-- ==========================================

-- events
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(200) not null,
  venue       varchar(200),
  event_date  date,
  event_code  char(5) not null unique,        -- 5-digit spectator access code
  status      text not null default 'draft'
              check (status in ('draft', 'registration', 'live', 'completed')),
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- categories (singles, doubles, mixed, age group)
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  name        varchar(100) not null,
  format      text not null check (format in ('singles', 'doubles', 'mixed')),
  created_at  timestamptz not null default now()
);

-- courts
create table public.courts (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  name        varchar(50) not null,
  status      text not null default 'active'
              check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now()
);

-- teams (1 player = singles, 2 players = doubles)
create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name        varchar(100),
  created_at  timestamptz not null default now()
);

-- team_members junction
create table public.team_members (
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid not null references auth.users(id),
  primary key (team_id, user_id)
);

-- event_registrations (player registers for an event/category)
create table public.event_registrations (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  user_id     uuid not null references auth.users(id),
  team_id     uuid references public.teams(id),
  checked_in  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (event_id, category_id, user_id)
);

-- event_roles (organizer, referee, player per event)
create table public.event_roles (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references auth.users(id),
  role        text not null check (role in ('organizer', 'referee', 'player')),
  created_at  timestamptz not null default now(),
  unique (event_id, user_id, role)
);

-- matches
create table public.matches (
  id                   uuid primary key default gen_random_uuid(),
  event_id             uuid not null references public.events(id),
  category_id          uuid not null references public.categories(id),
  court_id             uuid references public.courts(id),
  team1_id             uuid not null references public.teams(id),
  team2_id             uuid not null references public.teams(id),
  referee_id           uuid references auth.users(id),
  status               text not null default 'scheduled'
                       check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  -- denormalized live scores (updated by trigger on match_events insert)
  current_score_team1  smallint not null default 0,
  current_score_team2  smallint not null default 0,
  current_game         smallint not null default 1,
  -- pool/bracket context (nullable — set when match is assigned to structure)
  pool_group_id        uuid,          -- FK added after pool_groups table
  bracket_slot_id      uuid,          -- FK added after bracket_slots table
  scheduled_at         timestamptz,
  started_at           timestamptz,
  completed_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- pool_groups
create table public.pool_groups (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name        varchar(50) not null,  -- e.g. "Group A"
  created_at  timestamptz not null default now()
);

-- pool_standings (denormalized, updated after each pool match completes)
create table public.pool_standings (
  id            uuid primary key default gen_random_uuid(),
  pool_group_id uuid not null references public.pool_groups(id) on delete cascade,
  team_id       uuid not null references public.teams(id),
  wins          smallint not null default 0,
  losses        smallint not null default 0,
  points_for    int not null default 0,
  points_against int not null default 0,
  updated_at    timestamptz not null default now(),
  unique (pool_group_id, team_id)
);

-- brackets (one per category, single elimination)
create table public.brackets (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- bracket_slots (each slot = one position in the elimination bracket)
create table public.bracket_slots (
  id          uuid primary key default gen_random_uuid(),
  bracket_id  uuid not null references public.brackets(id) on delete cascade,
  round       smallint not null,     -- 1 = final, 2 = semis, etc.
  slot_number smallint not null,
  team_id     uuid references public.teams(id),
  match_id    uuid references public.matches(id),
  created_at  timestamptz not null default now(),
  unique (bracket_id, round, slot_number)
);

-- Add deferred FKs from matches back to pool/bracket (avoids circular dependency)
alter table public.matches
  add constraint fk_matches_pool_group
  foreign key (pool_group_id) references public.pool_groups(id);

alter table public.matches
  add constraint fk_matches_bracket_slot
  foreign key (bracket_slot_id) references public.bracket_slots(id);

-- Indexes for RLS-heavy lookups
create index on public.event_roles (user_id, event_id, role);
create index on public.event_registrations (user_id, event_id);
create index on public.matches (event_id, status);
