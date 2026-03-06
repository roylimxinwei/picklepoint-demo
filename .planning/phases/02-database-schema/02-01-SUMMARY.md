---
phase: 02-database-schema
plan: 01
subsystem: database
tags: [supabase, postgres, rls, realtime, migrations, pytest, supabase-py]

# Dependency graph
requires:
  - phase: 01-scaffolding
    provides: FastAPI backend scaffold with supabase-py already installed

provides:
  - 13 Postgres tables with FK relationships and constraints (events, categories, courts, teams, team_members, event_registrations, event_roles, matches, match_events, pool_groups, pool_standings, brackets, bracket_slots)
  - Append-only match event sourcing with idempotency_key UNIQUE constraint
  - sync_match_scores trigger keeping matches.current_score denormalized
  - RLS enabled on all 13 tables with anon read / authenticated CRUD / referee-only match_events insert
  - has_event_role() SECURITY DEFINER helper for policy expressions
  - Supabase Realtime publication for matches table
  - Seed SQL for development
  - 4 passing pytest integration tests validating live DB schema

affects:
  - 03-auth: event_roles and event_registrations tables define access model
  - 04-organizer-api: events, categories, courts tables are primary write targets
  - 05-scoring-engine: match_events + sync trigger are the scoring foundation
  - 06-spectator-realtime: matches Realtime publication drives live updates

# Tech tracking
tech-stack:
  added:
    - supabase CLI (npm devDependency, npx supabase)
    - supabase-py 2.18.1 (already installed, first real usage)
    - httpx (already installed, used for raw Admin API calls in tests)
  patterns:
    - append-only event sourcing for scoring (INSERT only, no UPDATE/DELETE on match_events)
    - idempotency_key UUID per point submission prevents duplicate scoring
    - SECURITY DEFINER + STABLE function for RLS role checks (100x+ perf vs inline subquery)
    - (select auth.uid()) in policy expressions prevents per-row function re-evaluation
    - service_role key bypasses RLS; used only in backend API layer and tests
    - anon key gives read-only spectator access without auth

key-files:
  created:
    - supabase/config.toml
    - supabase/migrations/20260305000001_core_tables.sql
    - supabase/migrations/20260305000002_match_event_sourcing.sql
    - supabase/migrations/20260305000003_rls_and_realtime.sql
    - supabase/seed.sql
    - backend/tests/test_schema.py
  modified:
    - package.json (supabase devDependency added)

key-decisions:
  - "teams table has no event_id column — teams belong to categories, not events directly; FK chain is teams → categories → events"
  - "test_service_role_insert creates a real auth.users row via Admin API since seed.sql is not applied during db push (only db reset)"
  - "test_rls_enabled uses behavioral proof (anon INSERT rejected 403) rather than pg_class introspection, since information_schema is not exposed via PostgREST"

patterns-established:
  - "Schema tests: use supabase-py service client for table existence checks (SELECT limit 0); use raw httpx for anon role behavior checks"
  - "Auth user fixture: create via /auth/v1/admin/users with email_confirm:true; always delete in finally block"

requirements-completed: []

# Metrics
duration: 15min
completed: 2026-03-06
---

# Phase 2 Plan 1: Database Schema Summary

**13-table Postgres schema with append-only match event sourcing, RLS on all tables, Supabase Realtime for matches, and 4 passing integration tests against the live Supabase instance**

## Performance

- **Duration:** ~15 min (tasks 4 only; tasks 0-3 completed in prior session)
- **Started:** 2026-03-06T00:00:00Z
- **Completed:** 2026-03-06
- **Tasks:** 4 (0-3 prior session, 4 this session)
- **Files modified:** 7

## Accomplishments

- Three migration files pushed to live Supabase (13 tables, match event sourcing trigger, RLS policies, Realtime publication)
- Seed SQL covering all 13 tables with sample tournament data
- 4 integration tests validate: tables exist, RLS blocks anon inserts, service role can insert, anon insert is rejected with 403

## Task Commits

Each task was committed atomically:

1. **Task 0: Pytest stub file** - `1f05ffc` (test)
2. **Task 1: Migration files + Supabase CLI init** - `765709a` (feat)
3. **Task 2: Seed data** - `2c8f35b` (feat)
4. **Task 3: Supabase link + db push** - done by user (no commit)
5. **Task 4: Real test implementations** - `60f5a4b` (feat)

## Files Created/Modified

- `supabase/config.toml` - Supabase project config
- `supabase/migrations/20260305000001_core_tables.sql` - 12 entity tables in FK dependency order
- `supabase/migrations/20260305000002_match_event_sourcing.sql` - match_events table + idempotency key + sync trigger
- `supabase/migrations/20260305000003_rls_and_realtime.sql` - has_event_role(), RLS enable + all policies, Realtime publication
- `supabase/seed.sql` - dev seed data for all 13 tables
- `backend/tests/test_schema.py` - 4 integration tests against live Supabase
- `package.json` - supabase CLI added as devDependency

## Decisions Made

- **teams has no event_id column:** teams belong to categories via FK; event context flows through categories.event_id. The test probe payload for teams was corrected to use category_id only.
- **test_service_role_insert uses Admin API for auth user:** seed.sql is not applied during `db push` (only `db reset`), so hardcoded fake UUIDs fail FK constraints. Solution: create a real auth.users row via `/auth/v1/admin/users` and delete it in a `finally` block.
- **RLS tested behaviorally:** information_schema is not exposed via PostgREST (PGRST106), so RLS is verified by confirming anon INSERT returns HTTP 403 rather than querying pg_class.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] teams probe payload used non-existent column event_id**
- **Found during:** Task 4 (test_rls_enabled)
- **Issue:** Test probe for `teams` table included `event_id` which doesn't exist on the teams table (teams.category_id is the FK, not event_id)
- **Fix:** Removed event_id from teams probe; kept only category_id and name
- **Files modified:** backend/tests/test_schema.py
- **Verification:** test_rls_enabled passes with correct 403 response
- **Committed in:** 60f5a4b (Task 4 commit)

**2. [Rule 1 - Bug] service role insert used hardcoded fake UUID that fails FK constraint**
- **Found during:** Task 4 (test_service_role_insert)
- **Issue:** UUID `00000000-0000-0000-0000-000000000001` not present in auth.users (seed.sql not applied via db push), causing FK violation error
- **Fix:** Added `_create_test_auth_user()` helper that creates a real auth user via Supabase Admin API; `_delete_test_auth_user()` cleans up in finally block
- **Files modified:** backend/tests/test_schema.py
- **Verification:** test_service_role_insert passes; test auth user created and deleted cleanly
- **Committed in:** 60f5a4b (Task 4 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - bugs in test data)
**Impact on plan:** Both fixes were necessary for test correctness. No scope creep — both resolved within test_schema.py.

## Issues Encountered

- PostgREST only exposes `public` and `graphql_public` schemas — `information_schema` is blocked (PGRST106). Switched to behavioral RLS testing via anon HTTP probes.

## User Setup Required

None — user already linked and pushed migrations during Task 3 checkpoint.

## Next Phase Readiness

- All 13 tables live in Supabase Postgres with RLS enforced
- matches table registered in Supabase Realtime publication
- has_event_role() function ready for Phase 3 (Auth) API layer
- Schema tests can be re-run any time: `cd backend && python -m pytest tests/test_schema.py -x -q`
- Next: Phase 3 (Auth) can build on event_roles and event_registrations tables

---
*Phase: 02-database-schema*
*Completed: 2026-03-06*
