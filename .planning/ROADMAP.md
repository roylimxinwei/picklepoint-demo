# Roadmap: PicklePoint

## Overview

PicklePoint is built in strict dependency order: infrastructure first, then auth, then events and players, then the scoring engine (the hardest and most critical piece), then real-time broadcasting, then the full frontend UI, and finally bracket management. Each phase is a hard prerequisite for the next — skipping or reordering creates compounding rework. The result is a production-ready tournament platform where referees can score matches live and everyone sees accurate results instantly.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Scaffolding** - Next.js, FastAPI, and Supabase repos wired together and deployed (completed 2026-03-05)
- [x] **Phase 2: Database Schema** - All tables, RLS policies, and migrations in place (completed 2026-03-06)
- [ ] **Phase 3: Authentication** - Supabase Auth fully integrated across Next.js and FastAPI
- [ ] **Phase 4: Event and Player Management** - Organizers create events, players register and check in
- [ ] **Phase 5: Scoring Engine** - Server-authoritative point-by-point scoring with undo and win detection
- [ ] **Phase 6: Real-Time Integration** - Live score broadcasts to all clients via Supabase Realtime
- [ ] **Phase 7: Frontend Pages** - All four role views wired to real data as Next.js pages
- [ ] **Phase 8: Tournament Brackets** - Pool play standings and single elimination with server-side auto-advancement

## Phase Details

### Phase 1: Scaffolding
**Goal**: The three-tier deployment is live and all services can communicate with each other
**Depends on**: Nothing (first phase)
**Requirements**: None (infrastructure prerequisite — enables all requirement phases)
**Success Criteria** (what must be TRUE):
  1. Next.js app is deployed on Vercel and loads at a public URL
  2. FastAPI backend is deployed on Railway and responds at `/health` with a 200
  3. Next.js can make a cross-origin request to FastAPI without CORS errors in both dev and production
  4. Supabase project exists with environment variables wired into both Next.js and FastAPI
  5. A local dev run of `npm run dev` (Next.js) and `uvicorn` (FastAPI) connects to Supabase without errors
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — FastAPI backend with health endpoint, CORS, pydantic-settings, and pytest tests
- [ ] 01-02-PLAN.md — Next.js frontend with App Router, Supabase SSR clients, auth middleware, and API helper
- [ ] 01-03-PLAN.md — Integration wiring: gitignore, GitHub Actions keep-warm, and end-to-end verification

### Phase 2: Database Schema
**Goal**: All data tables exist with access controls enforced from day one
**Depends on**: Phase 1
**Requirements**: None (infrastructure prerequisite — enables all feature phases)
**Success Criteria** (what must be TRUE):
  1. All core tables exist in Supabase: events, categories, courts, players, event_registrations, matches, match_events, pool_groups, pool_standings, brackets, bracket_slots
  2. RLS is enabled on every table — anon key cannot read any row without a valid policy
  3. Migration scripts exist and can be run from scratch to reproduce the full schema
  4. A test insert via the service role key succeeds; the same insert via anon key is rejected by RLS
**Plans**: TBD

### Phase 3: Authentication
**Goal**: Users can securely access the platform and FastAPI enforces role-based access on every request
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password and is immediately logged in
  2. User can log in with Google OAuth and land on the correct dashboard
  3. User session persists across browser refresh — closing and reopening the tab keeps them logged in
  4. A spectator can enter a 5-digit event code and view live scores without creating an account
  5. Any authenticated user can create an event (becoming its organizer) — a newly signed-up user has this capability immediately
  6. A FastAPI endpoint called without a valid Supabase JWT returns 401; the same call with a valid JWT succeeds
**Plans**: TBD

### Phase 4: Event and Player Management
**Goal**: Organizers can create and run events, and players can register and check in
**Depends on**: Phase 3
**Requirements**: EVNT-01, EVNT-02, EVNT-03, EVNT-04, EVNT-05, EVNT-06, PLYR-01, PLYR-02, PLYR-03, PLYR-04
**Success Criteria** (what must be TRUE):
  1. Organizer can create an event with name, date, and venue — the event appears in their dashboard in draft state
  2. Organizer can transition the event through draft → registration → live → completed, and each state change is reflected immediately
  3. Organizer can add categories (singles, doubles, mixed, age groups) and courts to an event
  4. Player can register for an event/category and see their registration confirmed
  5. Player can check in at an event — their status changes from registered to checked-in in the organizer's roster view
  6. Organizer can view and filter the player roster by category and check-in status
  7. Player receives a WhatsApp notification when their match is starting soon
**Plans**: TBD

### Phase 5: Scoring Engine
**Goal**: Referees can score matches point-by-point with full rule enforcement and undo, and the server is the sole source of truth
**Depends on**: Phase 4
**Requirements**: SCOR-01, SCOR-02, SCOR-03, SCOR-04, SCOR-05, SCOR-06
**Success Criteria** (what must be TRUE):
  1. Organizer can assign a referee to a match — the referee sees that match in their queue
  2. Referee can tap to add a point for either team and the server accepts or rejects it based on current game state
  3. Server enforces pickleball rules: games go to 11 points with a 2-point lead, match ends at best of 3 games — invalid point submissions are rejected with the current valid state returned
  4. Referee can undo the last point — the undo is recorded as an append-only event (not a delete), and the score rolls back correctly
  5. Duplicate point submissions (same `point_id`) are rejected with a 200 and the current state — no double-counted points
  6. Referee screen shows elapsed match timer and a visual match-point or game-point indicator when applicable
**Plans**: TBD

### Phase 6: Real-Time Integration
**Goal**: All clients see live score updates pushed instantly and stay consistent even after reconnection
**Depends on**: Phase 5
**Requirements**: LIVE-01, LIVE-02, LIVE-03
**Success Criteria** (what must be TRUE):
  1. Spectator watching a live match sees score updates within 2 seconds of a point being scored — without refreshing the page
  2. Organizer court grid shows all courts with live scores simultaneously updating as matches are scored
  3. A user can view a match detail with game-by-game score breakdown in real time
  4. After a browser tab is backgrounded and restored, scores are correct — stale state from the disconnected WebSocket is not shown
**Plans**: TBD

### Phase 7: Frontend Pages
**Goal**: All four role views are live as Next.js pages backed by real data, with a responsive UI faithful to the demo design
**Depends on**: Phase 6
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Organizer can view the court status overview with live data — courts show which match is running and the current score
  2. Organizer can manage the match queue: view upcoming matches, reorder them, and assign courts
  3. Organizer can view and filter the player list from the dashboard
  4. Referee scoring screen shows optimistic UI — score appears updated immediately on tap, before the server responds, and reconciles if the server disagrees
  5. All four role views (spectator, player, referee, organizer) render correctly on mobile viewport
**Plans**: TBD

### Phase 8: Tournament Brackets
**Goal**: Organizers can run pool play and single elimination brackets that update automatically as matches complete
**Depends on**: Phase 7
**Requirements**: TRNT-01, TRNT-02, TRNT-03, TRNT-04, TRNT-05
**Success Criteria** (what must be TRUE):
  1. Organizer can create pool play groups and assign players to pools
  2. Pool standings auto-update when a match result is recorded — wins, losses, and point differentials are correct without manual input
  3. Organizer can create a single elimination bracket and assign matches to courts
  4. When a match completes, the winner automatically advances to their next bracket slot — no manual bracket update needed
  5. Bracket auto-advancement is atomic and server-triggered — two matches completing simultaneously in the same round do not corrupt the bracket

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffolding | 3/3 | Complete   | 2026-03-05 |
| 2. Database Schema | 1/1 | Complete   | 2026-03-06 |
| 3. Authentication | 0/TBD | Not started | - |
| 4. Event and Player Management | 0/TBD | Not started | - |
| 5. Scoring Engine | 0/TBD | Not started | - |
| 6. Real-Time Integration | 0/TBD | Not started | - |
| 7. Frontend Pages | 0/TBD | Not started | - |
| 8. Tournament Brackets | 0/TBD | Not started | - |
