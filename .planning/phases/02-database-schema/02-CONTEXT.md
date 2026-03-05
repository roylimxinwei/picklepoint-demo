# Phase 2: Database Schema - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

All Supabase tables, RLS policies, and migrations for the PicklePoint tournament platform. This phase creates the complete data foundation — every feature phase (3-8) depends on these tables existing with access controls enforced. No API endpoints or UI in this phase.

</domain>

<decisions>
## Implementation Decisions

### Role Model
- Separate `event_roles` table (user_id, event_id, role) — not a column on registrations
- Per-event roles only — no global admin role for v1
- Any authenticated user can create an event (becoming its organizer via auto-inserted event_role)
- A user can hold multiple roles in the same event (organizer + player)
- Referee assignment to a match auto-grants the referee event_role — no pre-registration required
- Teams table with player members — supports both singles (1-player team) and doubles

### Match Event Sourcing
- `match_events` stores point_scored and point_undone only — game/match completion derived from replay
- Each event row includes snapshot: team1_score, team2_score, game_number at time of event
- `matches` table has denormalized current_score_team1, current_score_team2, current_game, status — updated atomically with each event insertion
- Supabase Realtime broadcasts on `matches` row changes (denormalized scores enable this)
- Client-generated UUID as idempotency key on match_events (UNIQUE constraint prevents double-submissions)

### Migration Tooling
- Supabase CLI migrations (`supabase migration new`, `supabase db push`)
- `supabase/` directory at repo root (standard convention)
- Initialize Supabase CLI in this phase (`supabase init`, link to project)
- Seed data included in `supabase/seed.sql` — sample events, players, matches for dev/testing
- `supabase db reset` gives a fully populated development database

### RLS Strategy
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

</decisions>

<specifics>
## Specific Ideas

- Match scoring must be reliable for live tournament use — the append-only event log with idempotency keys is non-negotiable
- The demo has 32 elimination teams and 64 player names — seed data can mirror this scale
- Denormalized scores on `matches` table specifically to enable Supabase Realtime broadcasting without complex joins

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/config.py`: pydantic-settings with `supabase_url` and `supabase_service_role_key` already configured
- Demo `src/App.jsx`: Contains mock data structures (TEAMS, COMPETITIONS, COURTS, POOL_GROUPS, ELIMINATION_TEAMS) that define the expected data shapes

### Established Patterns
- FastAPI + pydantic-settings for configuration
- Supabase as the database layer (connection already wired in backend config)

### Integration Points
- Backend `config.py` already has Supabase credentials — migrations connect to the same project
- Frontend `lib/supabase/` has client initialization — will use these tables via Supabase JS client
- `middleware.js` handles auth session refresh — will check against `event_roles` in later phases

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-database-schema*
*Context gathered: 2026-03-05*
