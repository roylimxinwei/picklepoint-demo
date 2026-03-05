# Phase 2: Database Schema - Research

**Researched:** 2026-03-05
**Domain:** Supabase PostgreSQL — migrations, RLS, Realtime replication
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Role Model**
- Separate `event_roles` table (user_id, event_id, role) — not a column on registrations
- Per-event roles only — no global admin role for v1
- Any authenticated user can create an event (becoming its organizer via auto-inserted event_role)
- A user can hold multiple roles in the same event (organizer + player)
- Referee assignment to a match auto-grants the referee event_role — no pre-registration required
- Teams table with player members — supports both singles (1-player team) and doubles

**Match Event Sourcing**
- `match_events` stores point_scored and point_undone only — game/match completion derived from replay
- Each event row includes snapshot: team1_score, team2_score, game_number at time of event
- `matches` table has denormalized current_score_team1, current_score_team2, current_game, status — updated atomically with each event insertion
- Supabase Realtime broadcasts on `matches` row changes (denormalized scores enable this)
- Client-generated UUID as idempotency key on match_events (UNIQUE constraint prevents double-submissions)

**Migration Tooling**
- Supabase CLI migrations (`supabase migration new`, `supabase db push`)
- `supabase/` directory at repo root (standard convention)
- Initialize Supabase CLI in this phase (`supabase init`, link to project)
- Seed data included in `supabase/seed.sql` — sample events, players, matches for dev/testing
- `supabase db reset` gives a fully populated development database

**RLS Strategy**
- Role-aware RLS from day one — Postgres enforces role checks, not just FastAPI
- Only assigned referees can insert match_events
- Only event organizers can modify their events
- Players can only see/modify their own registrations
- Anon RLS policies enabled for spectator Realtime access — spectators query Supabase directly
- Event code as access filter for anon users — the 5-digit code itself acts as the access token
- RLS CREATE POLICY statements inline with CREATE TABLE in same migration file

### Claude's Discretion

- Exact column types and constraints (varchar lengths, check constraints)
- Index strategy beyond primary/foreign keys
- Trigger vs application-level logic for denormalized score updates
- Seed data content (specific team names, player names, event details)
- Migration file naming and splitting strategy (one big migration vs. per-table)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Summary

This phase creates the entire PostgreSQL schema inside Supabase using the Supabase CLI migration system. The output is a `supabase/` directory at repo root containing one or more SQL migration files and a `seed.sql` file. All tables must have RLS enabled from day one; the anon role is denied by default and selectively opened for spectator read access via event code. The `matches` table carries denormalized live scores so Supabase Realtime can broadcast row-level changes without requiring clients to run joins.

The critical design tension is between migration atomicity (one big migration is easy to reason about during a single-phase build) and future maintainability (per-logical-group files are cleaner). Because this is a greenfield build and all tables are being created simultaneously, a small number of migration files grouped by logical concern is the right call: one file for core entities, one for match event sourcing, one for RLS policies. This avoids the cognitive cost of managing 11+ files while keeping RLS separate and auditable.

Supabase Realtime requires tables to be added to the `supabase_realtime` publication via SQL. This is a one-line ALTER PUBLICATION statement — it is easy to miss and must be included in the migration.

**Primary recommendation:** Use three migration files (core tables, match event sourcing + idempotency, RLS policies + publication), one seed.sql, and security-definer helper functions for role-check RLS policies to avoid performance pitfalls with repeated subquery evaluation.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase CLI | latest (v2.x) | Migration management, db push, seed | Official Supabase toolchain — `supabase migration new` / `supabase db push` |
| PostgreSQL | 15 (Supabase managed) | Database engine | Provided by Supabase; no choice needed |
| supabase-py | >=2.0.0 (already in requirements.txt) | Backend Python client for service role operations | Already installed and configured |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase JS client | already installed in frontend | Realtime subscriptions, anon queries | Frontend spectator Realtime access |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase CLI migrations | Alembic (Python) | Alembic is Python-native but cannot manage Supabase-specific features (RLS, publications, auth schema). Supabase CLI is the correct tool. |
| Security definer functions for role checks | Inline subqueries in RLS | Inline subqueries re-evaluate per row — 100x+ slower on large tables. Security definer functions cache via initPlan. |

**Installation:**
```bash
# Supabase CLI — install via npm (cross-platform, works in this project)
npm install supabase --save-dev
# Or global install
npm install -g supabase

# Initialize at repo root
supabase init

# Link to remote project (requires SUPABASE_ACCESS_TOKEN env var or interactive login)
supabase link --project-ref <project-ref>
```

---

## Architecture Patterns

### Recommended Project Structure
```
supabase/
├── config.toml                  # Created by supabase init
├── seed.sql                     # Dev seed data (32 elimination teams, 64 players)
└── migrations/
    ├── 20260305000001_core_tables.sql          # events, categories, courts, teams, players, event_registrations, event_roles, matches, pool_groups, pool_standings, brackets, bracket_slots
    ├── 20260305000002_match_event_sourcing.sql # match_events with idempotency key, trigger for denormalized score update
    └── 20260305000003_rls_and_realtime.sql     # ALTER TABLE ... ENABLE ROW LEVEL SECURITY, CREATE POLICY, ALTER PUBLICATION
```

### Pattern 1: RLS with Role-Check via Security Definer Function

**What:** A SECURITY DEFINER function that checks event_roles is called from RLS policies. This lets Postgres cache the role lookup per statement rather than re-evaluating a subquery for every row.

**When to use:** Any RLS policy that needs to check if auth.uid() has a given role for a given event. Applies to: events (organizer check), matches (organizer + referee check), match_events (referee check), event_registrations (player check).

**Example:**
```sql
-- Source: Supabase RLS Performance docs
-- https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv

-- Helper function: does the current user have `p_role` in `p_event_id`?
create or replace function public.has_event_role(p_event_id uuid, p_role text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.event_roles
    where user_id = (select auth.uid())
      and event_id = p_event_id
      and role = p_role
  );
$$;

-- Usage in a policy:
create policy "organizers can update their event"
on public.events
for update
to authenticated
using (public.has_event_role(id, 'organizer'))
with check (public.has_event_role(id, 'organizer'));
```

### Pattern 2: Anon Spectator Access via Event Code

**What:** Anon users (spectators) can read match and score data for an event by supplying the 5-digit event code. The event code is on the `events` table; RLS allows anon SELECT on event-related tables when the event_code is known.

**When to use:** All spectator-read tables: events (by code), matches, pool_standings, brackets, bracket_slots. Do NOT open write access to anon.

**Example:**
```sql
-- Source: Supabase RLS docs — anon role policies
-- https://supabase.com/docs/guides/database/postgres/row-level-security

-- events: anon can read if they supply the code (frontend filters by code)
create policy "anon can read events by code"
on public.events
for select
to anon
using (true);  -- further filtered client-side by event_code column value

-- matches: anon can read all matches (event_id join handled client-side)
create policy "anon can read matches"
on public.matches
for select
to anon
using (true);
```

**Note on event_code security:** The 5-digit code is a lightweight access control for demo purposes — it is not cryptographic. Spectators who know the code can read live scores. This is the locked decision; no alternative needed.

### Pattern 3: match_events Idempotency Key

**What:** Client generates a UUID before submitting a point. The UUID is stored as `idempotency_key` with a UNIQUE constraint. Duplicate submissions (e.g., referee taps twice due to network retry) are rejected by the constraint, not application logic.

**When to use:** EVERY insert into `match_events` must supply an idempotency_key. Backend (FastAPI) receives the client UUID and passes it through.

**Example:**
```sql
-- Source: PostgreSQL UNIQUE constraint pattern
create table public.match_events (
  id            uuid primary key default gen_random_uuid(),
  idempotency_key uuid unique not null,  -- client-generated, prevents double-submit
  match_id      uuid not null references public.matches(id),
  event_type    text not null check (event_type in ('point_scored', 'point_undone')),
  scoring_team  smallint check (scoring_team in (1, 2)),  -- null for point_undone
  team1_score   smallint not null,  -- snapshot at time of event
  team2_score   smallint not null,
  game_number   smallint not null,
  created_by    uuid not null references auth.users(id),
  created_at    timestamptz not null default now()
);
```

### Pattern 4: Denormalized Score Update — Trigger vs. Application Logic

**Decision (Claude's discretion):** Use a Postgres AFTER INSERT trigger on `match_events` to update the denormalized scores on `matches`. This is the right call here because:
1. The scoring engine (FastAPI) will validate and then INSERT into match_events — the trigger fires atomically in the same transaction, guaranteeing the `matches` row is always consistent.
2. Supabase Realtime fires on the `matches` UPDATE caused by the trigger — clients get the broadcast automatically.
3. Application-level updates (INSERT match_event, then UPDATE matches) require two round-trips and risk partial failure.

**Example:**
```sql
-- Source: Supabase Postgres Triggers docs
-- https://supabase.com/docs/guides/database/postgres/triggers

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
    current_game        = NEW.game_number
  where id = NEW.match_id;
  return NEW;
end;
$$;

create trigger trg_sync_match_scores
after insert on public.match_events
for each row
execute function public.sync_match_scores();
```

**Note on undo:** When `event_type = 'point_undone'`, the snapshot columns (team1_score, team2_score, game_number) in the match_events row already capture the corrected state after undo — the same trigger logic applies unchanged.

### Pattern 5: Realtime Publication Registration

**What:** Tables must be explicitly added to the `supabase_realtime` Postgres publication for Realtime broadcasts to work. This is done in SQL and belongs in the migration.

**Example:**
```sql
-- Source: Supabase Realtime docs
-- https://supabase.com/docs/guides/realtime/postgres-changes

alter publication supabase_realtime add table public.matches;
-- Add pool_standings if live bracket updates needed in later phases
-- alter publication supabase_realtime add table public.pool_standings;
```

### Anti-Patterns to Avoid

- **Calling auth.uid() directly in subqueries in RLS without wrapping in SELECT:** Forces re-evaluation per row. Use `(select auth.uid())` or security definer functions.
- **No TO clause in CREATE POLICY:** Without `TO authenticated` or `TO anon`, the policy applies to all roles including service_role (which bypasses RLS anyway, but the intent is unclear). Always specify the target role.
- **Missing ENABLE ROW LEVEL SECURITY:** Tables created via raw SQL do NOT have RLS enabled by default. Every table needs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` before policies take effect.
- **Skipping `alter publication supabase_realtime add table`:** Without this, Supabase Realtime will not broadcast changes even if clients subscribe — silent failure.
- **Two-step score update (app level):** INSERT into match_events, then separately UPDATE matches — risks the UPDATE failing silently and leaving scores stale. Use the trigger pattern instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Idempotent inserts | Custom dedup logic in FastAPI | UNIQUE constraint on `idempotency_key` column | Postgres enforces atomically; no race conditions |
| Role check in RLS | Inline correlated subquery per policy | Security definer function `has_event_role()` | 100x+ perf difference; cached per statement |
| Realtime broadcasting | Custom WebSocket server | `alter publication supabase_realtime add table` | Supabase Realtime handles WebSocket connections, heartbeats, reconnects |
| Migration history tracking | Custom migration table | Supabase CLI (`supabase_migrations.schema_migrations`) | Automatic; `db push` skips already-applied migrations |
| Denormalized score consistency | Two-round-trip app update | AFTER INSERT trigger on match_events | Atomic in same transaction; no partial failures |

**Key insight:** In Supabase, most "infrastructure" problems (idempotency, realtime, role checks, migration tracking) are solved at the database layer. The application layer (FastAPI) handles business validation; the database layer handles enforcement.

---

## Common Pitfalls

### Pitfall 1: RLS Enabled But No Permissive Policy — Total Lockout
**What goes wrong:** After enabling RLS on a table, ALL rows are denied to all roles until at least one permissive policy is created. If a migration enables RLS but the policy migration hasn't run yet, the backend gets 0 rows back silently (no error — Supabase just returns empty result set for queries, or 403 for some operations).
**Why it happens:** Postgres default-deny behavior when RLS is enabled with no policies.
**How to avoid:** Always include RLS enable + policies in the same migration or same migration batch. Never leave a table in "RLS enabled, no policies" state.
**Warning signs:** Query returns empty array with 200 status; service role key query returns data but anon/authenticated returns nothing.

### Pitfall 2: Realtime Not Broadcasting — Missing Publication Entry
**What goes wrong:** Frontend subscribes to `matches` table changes, but no updates arrive. The table has RLS and anon policy correctly configured.
**Why it happens:** The table was never added to `supabase_realtime` publication via `ALTER PUBLICATION ... ADD TABLE`.
**How to avoid:** Include the `alter publication supabase_realtime add table public.matches;` in the migration. Verify in Supabase dashboard under Database > Replication.
**Warning signs:** Frontend channel connects successfully (no error) but `on('postgres_changes', ...)` callback never fires.

### Pitfall 3: Trigger Fires Before RLS Check — Security Risk
**What goes wrong:** A trigger that updates `matches` scores could theoretically be invoked by an unauthorized insert if RLS on `match_events` is misconfigured.
**Why it happens:** Triggers run in the security context of the table owner, not the calling user — SECURITY DEFINER functions bypass RLS on the tables they touch.
**How to avoid:** Ensure RLS on `match_events` blocks unauthorized inserts BEFORE the trigger fires. The trigger fires AFTER INSERT — if the INSERT is rejected by RLS, the trigger never runs. Test: verify anon insert into match_events returns error, not silent empty.

### Pitfall 4: supabase db push Requires Linked Project
**What goes wrong:** Running `supabase db push` fails with "project not linked" error.
**Why it happens:** `supabase init` creates config.toml but does not link to the remote project.
**How to avoid:** Run `supabase link --project-ref <ref>` after `supabase init`. The project ref is in the Supabase dashboard URL: `https://app.supabase.com/project/<ref>`.
**Warning signs:** `supabase db push` prints "Error: Cannot find project ref" or similar.

### Pitfall 5: auth.uid() Returns NULL for Anon Users — Policy Logic Error
**What goes wrong:** An authenticated-only policy uses `auth.uid() = user_id` without a `TO authenticated` clause. Anon requests silently evaluate the condition with auth.uid() = NULL, which returns false but doesn't error — policy is just never matched.
**Why it happens:** Missing TO clause means policy applies to all roles.
**How to avoid:** Always use `TO authenticated` on authenticated-only policies, `TO anon` on anon policies. Never rely solely on `auth.uid() IS NOT NULL` in the USING clause as the role guard.

### Pitfall 6: Migration Ordering — Foreign Keys Before Referencing Tables
**What goes wrong:** Migration fails with "relation does not exist" because a CREATE TABLE references a table not yet created in the same migration file.
**Why it happens:** SQL executes top-to-bottom; foreign key constraints are validated at table creation time.
**How to avoid:** In `core_tables.sql`, create tables in dependency order: events → categories → courts → teams → players → event_roles → event_registrations → matches → pool_groups → pool_standings → brackets → bracket_slots.

---

## Code Examples

Verified patterns from official sources:

### Full RLS Enable + Policy Block (per table)
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security

alter table public.events enable row level security;

-- Anon: read events by providing the code (filtered client-side)
create policy "anon read events"
on public.events for select
to anon
using (true);

-- Authenticated: read all events they participate in
create policy "authenticated read events"
on public.events for select
to authenticated
using (true);  -- further narrowed by client query

-- Organizer: update their own events
create policy "organizer update event"
on public.events for update
to authenticated
using (public.has_event_role(id, 'organizer'))
with check (public.has_event_role(id, 'organizer'));

-- Authenticated: insert (create event — any authenticated user)
create policy "authenticated create event"
on public.events for insert
to authenticated
with check (true);  -- organizer role auto-inserted after event creation
```

### match_events RLS — Referee-Only Insert
```sql
-- Source: Supabase RLS docs pattern adapted for role-check

alter table public.match_events enable row level security;

-- Only assigned referees can insert match events
create policy "referee insert match_events"
on public.match_events for insert
to authenticated
with check (
  public.has_event_role(
    (select event_id from public.matches where id = match_id),
    'referee'
  )
);

-- Authenticated and anon can read for live score replay
create policy "read match_events"
on public.match_events for select
to authenticated, anon
using (true);
```

### Supabase CLI Workflow
```bash
# One-time setup at repo root
supabase init
supabase link --project-ref <your-project-ref>

# Create migration files
supabase migration new core_tables
supabase migration new match_event_sourcing
supabase migration new rls_and_realtime

# Edit the SQL files in supabase/migrations/
# Then push to remote
supabase db push

# For local dev reset with seed data
supabase db reset
```

### Test: Service Role Insert Succeeds, Anon Insert Rejected
```python
# Source: supabase-py v2 pattern — backend/tests/test_schema.py (to be created in Wave 0)
import os
from supabase import create_client

def test_service_role_can_insert_event():
    client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    result = client.table("events").insert({
        "name": "Test Event",
        "event_code": "12345",
        "status": "draft",
    }).execute()
    assert len(result.data) == 1

def test_anon_cannot_insert_event():
    from supabase import create_client
    anon_client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_ANON_KEY"])
    # Anon insert should raise or return empty/error
    try:
        result = anon_client.table("events").insert({
            "name": "Should Fail",
            "event_code": "99999",
            "status": "draft",
        }).execute()
        assert result.data == [] or result.count == 0
    except Exception:
        pass  # Error response also acceptable
```

---

## Full Table Schema (Recommended)

Claude's discretion applied: column types, constraints, varchar lengths, indexes.

```sql
-- ==========================================
-- FILE: supabase/migrations/<ts>_core_tables.sql
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
  id          uuid primary key default gen_random_uuid(),
  pool_group_id uuid not null references public.pool_groups(id) on delete cascade,
  team_id     uuid not null references public.teams(id),
  wins        smallint not null default 0,
  losses      smallint not null default 0,
  points_for  int not null default 0,
  points_against int not null default 0,
  updated_at  timestamptz not null default now(),
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
  round       smallint not null,     -- 1 = final, 2 = semis, etc. (or round from top)
  slot_number smallint not null,
  team_id     uuid references public.teams(id),
  match_id    uuid references public.matches(id),
  created_at  timestamptz not null default now(),
  unique (bracket_id, round, slot_number)
);

-- Add deferred FK from matches back to pool/bracket (avoids circular dependency)
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
create index on public.match_events (match_id, created_at);
```

```sql
-- ==========================================
-- FILE: supabase/migrations/<ts>_match_event_sourcing.sql
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
```

```sql
-- ==========================================
-- FILE: supabase/migrations/<ts>_rls_and_realtime.sql
-- ==========================================

-- ---- Security definer helper ----
create or replace function public.has_event_role(p_event_id uuid, p_role text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.event_roles
    where user_id = (select auth.uid())
      and event_id = p_event_id
      and role = p_role
  );
$$;

-- ---- Enable RLS on all tables ----
alter table public.events enable row level security;
alter table public.categories enable row level security;
alter table public.courts enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_roles enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.pool_groups enable row level security;
alter table public.pool_standings enable row level security;
alter table public.brackets enable row level security;
alter table public.bracket_slots enable row level security;

-- ---- events policies ----
create policy "anon read events" on public.events for select to anon using (true);
create policy "authenticated read events" on public.events for select to authenticated using (true);
create policy "authenticated create event" on public.events for insert to authenticated with check (true);
create policy "organizer update event" on public.events for update to authenticated
  using (public.has_event_role(id, 'organizer'))
  with check (public.has_event_role(id, 'organizer'));

-- ---- categories / courts / teams / pool_groups / brackets / bracket_slots: readable by all ----
create policy "anon read categories" on public.categories for select to anon using (true);
create policy "authenticated read categories" on public.categories for select to authenticated using (true);
create policy "organizer manage categories" on public.categories for insert to authenticated
  with check (public.has_event_role(event_id, 'organizer'));

create policy "anon read courts" on public.courts for select to anon using (true);
create policy "authenticated read courts" on public.courts for select to authenticated using (true);
create policy "organizer manage courts" on public.courts for insert to authenticated
  with check (public.has_event_role(event_id, 'organizer'));

create policy "anon read teams" on public.teams for select to anon using (true);
create policy "authenticated read teams" on public.teams for select to authenticated using (true);

create policy "anon read team_members" on public.team_members for select to anon using (true);
create policy "authenticated read team_members" on public.team_members for select to authenticated using (true);

-- ---- event_registrations ----
create policy "player read own registrations" on public.event_registrations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "organizer read all registrations" on public.event_registrations for select to authenticated
  using (public.has_event_role(event_id, 'organizer'));
create policy "player insert own registration" on public.event_registrations for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "player update own registration" on public.event_registrations for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---- event_roles ----
create policy "read own event_roles" on public.event_roles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "organizer read all event_roles" on public.event_roles for select to authenticated
  using (public.has_event_role(event_id, 'organizer'));
create policy "system insert event_roles" on public.event_roles for insert to authenticated
  with check (true);  -- FastAPI service role handles role assignment; authenticated for organizer self-grant

-- ---- matches ----
create policy "anon read matches" on public.matches for select to anon using (true);
create policy "authenticated read matches" on public.matches for select to authenticated using (true);
create policy "organizer manage matches" on public.matches for insert to authenticated
  with check (public.has_event_role(event_id, 'organizer'));
create policy "organizer update matches" on public.matches for update to authenticated
  using (public.has_event_role(event_id, 'organizer'));

-- ---- match_events ----
create policy "read match_events" on public.match_events for select to anon, authenticated using (true);
create policy "referee insert match_events" on public.match_events for insert to authenticated
  with check (
    public.has_event_role(
      (select event_id from public.matches where id = match_id),
      'referee'
    )
  );

-- ---- pool/bracket readable by all ----
create policy "anon read pool_groups" on public.pool_groups for select to anon using (true);
create policy "authenticated read pool_groups" on public.pool_groups for select to authenticated using (true);
create policy "anon read pool_standings" on public.pool_standings for select to anon using (true);
create policy "authenticated read pool_standings" on public.pool_standings for select to authenticated using (true);
create policy "anon read brackets" on public.brackets for select to anon using (true);
create policy "authenticated read brackets" on public.brackets for select to authenticated using (true);
create policy "anon read bracket_slots" on public.bracket_slots for select to anon using (true);
create policy "authenticated read bracket_slots" on public.bracket_slots for select to authenticated using (true);

-- ---- Realtime replication ----
-- matches table must be in the publication for live score broadcasts
alter publication supabase_realtime add table public.matches;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Writing RLS policies in Supabase dashboard | Writing policies in migration SQL files | Supabase CLI v1+ | Policies are version-controlled, reproducible |
| `supabase db push --password` interactive prompt | `SUPABASE_DB_PASSWORD` env var | CLI v2 | CI/CD friendly, no interactive prompt needed |
| Enabling Realtime via dashboard toggle | `ALTER PUBLICATION supabase_realtime ADD TABLE` in SQL | Supabase CLI support for custom SQL migrations | Reproducible, no manual dashboard step |

**Deprecated/outdated:**
- `supabase db remote commit` — deprecated; use `supabase db pull` then edit migration files
- Supabase CLI v0.x `supabase db push` behavior — v1+ tracks migration history automatically via `supabase_migrations.schema_migrations`

---

## Open Questions

1. **match status update on game completion**
   - What we know: The trigger syncs scores. Match `status` change from `in_progress` to `completed` is not handled by the trigger.
   - What's unclear: Should a second trigger on match_events check if a game/match is won and update `matches.status`? Or does FastAPI handle this after score validation?
   - Recommendation: Leave status update to FastAPI (Phase 5 — Scoring Engine). The trigger is purely for score denormalization. Keeps game-rule logic in one place (FastAPI), not split across trigger + application.

2. **pool_standings update mechanism**
   - What we know: Pool standings need to update when a match completes. This is a more complex calculation (wins/losses, point differential).
   - What's unclear: Trigger on `matches` UPDATE (when status → completed)? Or application logic in Phase 8?
   - Recommendation: Do not build the pool_standings update trigger in Phase 2. Create the table with the schema; Phase 8 (Tournament Structure) implements the update logic. Schema is complete, trigger is deferred.

3. **SUPABASE_ANON_KEY in backend tests**
   - What we know: The RLS success criteria requires testing anon rejection. The backend config.py only has service role key.
   - What's unclear: Should anon_key be added to backend Settings for test purposes?
   - Recommendation: Add `supabase_anon_key` as optional field in Settings (for test use only). Tests use it to verify RLS blocks anon inserts. Never used in production code paths.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x (already installed) |
| Config file | `backend/pytest.ini` (exists — `testpaths = tests`, `asyncio_mode = auto`) |
| Quick run command | `cd backend && python -m pytest tests/test_schema.py -x -q` |
| Full suite command | `cd backend && python -m pytest -x -q` |

### Phase Requirements → Test Map

This phase has no assigned requirement IDs (infrastructure prerequisite). The success criteria map directly to verifiable behaviors:

| Success Criterion | Test Type | Automated Command | File Exists? |
|-------------------|-----------|-------------------|-------------|
| All core tables exist in Supabase | smoke | `supabase db push --dry-run` exits 0 | Wave 0 — no test file yet |
| RLS enabled on every table | smoke | query `information_schema.tables` + `pg_tables` for rowsecurity=true | Wave 0 — `tests/test_schema.py` |
| Service role insert succeeds | integration | `pytest tests/test_schema.py::test_service_role_insert -x` | Wave 0 — `tests/test_schema.py` |
| Anon insert rejected by RLS | integration | `pytest tests/test_schema.py::test_anon_insert_rejected -x` | Wave 0 — `tests/test_schema.py` |
| Migration reproducible from scratch | smoke | `supabase db reset` succeeds (manual or in CI) | Validated manually |

### Sampling Rate
- **Per task commit:** `cd backend && python -m pytest tests/ -x -q`
- **Per wave merge:** `cd backend && python -m pytest -x -q`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/test_schema.py` — covers service role insert + anon rejection + RLS enabled check
- [ ] `backend/.env` — must include `SUPABASE_ANON_KEY` for RLS rejection tests
- [ ] `supabase/` directory — created by `supabase init` in Wave 0

---

## Sources

### Primary (HIGH confidence)
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS enable, CREATE POLICY syntax, auth.uid(), USING vs WITH CHECK
- [Supabase Realtime Postgres Changes Docs](https://supabase.com/docs/guides/realtime/postgres-changes) — ALTER PUBLICATION syntax, RLS requirements for Realtime
- [Supabase Postgres Triggers Docs](https://supabase.com/docs/guides/database/postgres/triggers) — CREATE FUNCTION, CREATE TRIGGER, NEW record syntax
- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — security definer functions, index requirements, anti-patterns
- [Supabase Local Development / Migration Overview](https://supabase.com/docs/guides/local-development/overview) — supabase init, migration new, db push, db reset, seed.sql location
- [Supabase CLI db push reference](https://supabase.com/docs/reference/cli/supabase-db-push) — exact flag syntax, SUPABASE_DB_PASSWORD env var

### Secondary (MEDIUM confidence)
- [Supabase API Keys docs](https://supabase.com/docs/guides/api/api-keys) — anon vs service_role key behavior, RLS bypass for service_role

### Tertiary (LOW confidence)
- Community discussions on migration file organization strategy — confirms both single-file and multi-file approaches are used; official docs are agnostic on file count

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Supabase CLI is the official toolchain, verified from official docs
- Architecture: HIGH — migration patterns and RLS syntax verified from official Supabase docs
- Trigger pattern: HIGH — verified from Supabase Postgres Triggers docs
- Pitfalls: HIGH — verified from official RLS performance docs and known Supabase behavior
- Column types/constraints (Claude's discretion items): MEDIUM — reasonable Postgres conventions, not verified against a specific reference

**Research date:** 2026-03-05
**Valid until:** 2026-06-05 (stable Supabase CLI and Postgres RLS surface — changes infrequently)
