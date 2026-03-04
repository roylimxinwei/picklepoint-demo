# Project Research Summary

**Project:** PicklePoint — Real-Time Pickleball Tournament Management
**Domain:** Live sports tournament platform with referee scoring, bracket management, and spectator realtime feeds
**Researched:** 2026-03-04
**Confidence:** HIGH

## Executive Summary

PicklePoint is a real-time sports tournament management platform that requires a server-authoritative scoring engine, role-gated access (organizer, referee, player, spectator), and live score broadcasting. The expert approach is a three-tier architecture: Next.js 15 on Vercel for UI, FastAPI on Railway for all business logic and mutations, and Supabase as the hosted Postgres + Auth + Realtime layer. The key insight is that scoring must be fully server-authoritative — clients never write scores directly to the database. All point submissions go through FastAPI, which owns the game state machine, validates rules (11 points, 2-point lead, best of 3), and writes atomically. Supabase Realtime then broadcasts Postgres changes to all subscribers automatically.

The recommended build order is strictly dependency-driven: schema and auth must exist before any feature work, the scoring engine must be proven in isolation before the referee UI is built, and Realtime integration comes after the scoring engine produces real data. This order is non-negotiable — skipping ahead creates compounding rework. The hardest single piece is the scoring state machine (all edge cases: deuce, undo across game boundaries, match completion, bracket advancement). Budget the most time here.

The primary risks are idempotency (double-tap on flaky gym Wi-Fi submits the same point twice), Supabase Realtime stale state after tab backgrounding, and Railway cold starts during live tournament hours. All three are well-understood and have clear prevention patterns — they just must be built in from the start, not bolted on. RLS must be enabled at schema creation time, not after.

## Key Findings

### Recommended Stack

The stack is Next.js 15 (App Router) + React 19 for the frontend, FastAPI 0.111+ (Python 3.11+, Pydantic v2) for the backend, and Supabase for Postgres, Auth, and Realtime. Deployment targets are Vercel (Next.js), Railway (FastAPI), and Supabase Cloud. This combination is well-documented, production-proven, and eliminates the need for a separate WebSocket server, an ORM, or custom auth infrastructure.

**Core technologies:**
- `next@15` + `react@19`: App Router, SSR, route-level middleware for auth guards — native Next.js hosting on Vercel
- `@supabase/ssr@0.5+`: Cookie-based auth for SSR (replaces deprecated `@supabase/auth-helpers-nextjs` — do not use the old package)
- `fastapi@0.111+` + `pydantic@2`: Async backend, automatic OpenAPI docs, fast validation — ideal for server-authoritative scoring logic
- `python-jose[cryptography]`: JWT verification of Supabase tokens in FastAPI
- `supabase-py@2` (service role): Backend writes to Postgres bypassing RLS
- Supabase Realtime: WebSocket-based Postgres change notifications — no separate Socket.io or custom WS server needed

**Do not use:** Tailwind CSS (demo uses inline styles — keep consistent), Redux/Zustand (plain useState is sufficient), Prisma/Drizzle (unnecessary ORM layer), Pydantic v1 (breaking incompatibilities with FastAPI 0.111+), `@supabase/auth-helpers-nextjs` (deprecated).

### Expected Features

The feature dependency chain is strict: Auth must exist before events, events before player registration, player registration before match creation, match creation before scoring, and scoring before Realtime and bracket advancement.

**Must have (table stakes):**
- Email/password login with role-based access (organizer, referee, player) — users will not use the platform without this
- Spectator access via 5-digit event code, no account required — removes friction for audiences
- Event creation with states: draft → registration → live → completed
- Category management (singles, doubles, mixed, age groups)
- Player registration and check-in
- Point-by-point referee scoring with server validation, undo, and win detection
- Live score broadcast to spectators and organizer dashboard via Supabase Realtime
- Pool play groups with standings and single elimination brackets with auto-advancement

**Should have (competitive differentiators):**
- Dual scoring modes: referee point-by-point and player game-score submission in same event
- Elapsed match timer and match-point visual indicator on referee screen
- Real-time organizer court grid showing all courts simultaneously
- Pool play → single elimination integrated in one platform (competitors require separate tools)

**Defer to v2+:**
- Payment processing (track status only, avoid PCI compliance)
- Email notifications (in-app sufficient for live events)
- Video streaming, chat, skill ratings, seasons/leagues, double elimination, advanced statistics

### Architecture Approach

The architecture enforces a hard boundary: all writes go through FastAPI (using the Supabase service role key), all reads go directly from the Next.js client to Supabase using the user's JWT (enforced by RLS), and Supabase Realtime is a read-only notification channel. Next.js API route handlers are thin proxies only — no business logic lives there. This prevents the common failure mode where validation logic diverges between frontend and backend.

**Major components:**
1. Next.js App (Vercel) — UI rendering, client-side state, route protection via middleware; reads from Supabase directly, writes to FastAPI via HTTP
2. FastAPI Backend (Railway) — all business logic: scoring state machine, bracket advancement, event management, JWT verification; uses service role to write to Supabase
3. Supabase Postgres — persistent data, RLS for access control on direct client reads
4. Supabase Auth — user registration, login, JWT issuance consumed by both Next.js and FastAPI
5. Supabase Realtime — broadcasts Postgres changes to subscribed clients; always followed by a full-state fetch on reconnect

**Key patterns:**
- Append-only match events (never delete; insert UNDO events; derive state by replaying the log)
- Idempotency keys (client UUID per point submission, unique constraint in DB)
- Optimistic UI for referee scoring (show result immediately, reconcile on server response)
- Full-state fetch on every Realtime SUBSCRIBED event (not just on initial connect)

### Critical Pitfalls

1. **Double-tap race condition on scoring** — Referee on flaky gym Wi-Fi retries a timed-out request; server commits both. Prevention: client-generated `point_id` UUID per tap, FastAPI rejects duplicates with 200 + current state, DB UNIQUE constraint on `match_events.point_id`. Must be built before referee UI is wired.

2. **Supabase Realtime stale state after tab backgrounding** — WebSocket reconnects but component never re-fetches. Score updates during disconnect are lost. Prevention: on every channel `SUBSCRIBED` event (including reconnects), immediately fetch full current state. Realtime is change notification only — never sole source of truth.

3. **Scoring latency causes double-tapping** — FastAPI round-trip (including possible Railway cold start) can take 1.5-3 seconds. Referee thinks tap didn't register, taps again (triggering pitfall 1). Prevention: optimistic UI from day one, keep Railway warm with a `/health` ping every 4 minutes during tournament hours.

4. **RLS left disabled** — Teams disable RLS during development "to move faster," ship without it. Browser anon key can read all data. Prevention: enable RLS on every table at schema creation time, alongside the schema migration, not after.

5. **CORS misconfiguration breaks production** — Dev works via proxy; production cross-origin calls to Railway are blocked. Prevention: `CORSMiddleware` with explicit `ALLOWED_ORIGINS` env var (never `*` with `allow_credentials=True`). Test production CORS before any phase is called complete.

## Implications for Roadmap

Based on the dependency chain and pitfall phases, eight phases emerge in a strict dependency order. No phase can be safely skipped or reordered without creating rework.

### Phase 1: Project Scaffolding and Infrastructure
**Rationale:** Everything else depends on working repos, deployment targets, and environment configuration. CORS and production env issues must be caught before feature work begins.
**Delivers:** Next.js repo on Vercel, FastAPI repo on Railway, Supabase project created, env vars wired, CORS configured, `/health` endpoint live.
**Avoids:** CORS production break (P4), Railway cold start surprise (P9).

### Phase 2: Database Schema and RLS
**Rationale:** All features depend on the schema. RLS must be created alongside tables — retrofitting it is error-prone and easy to get wrong.
**Delivers:** All core tables (events, categories, players, courts, pools, brackets, bracket_slots, matches, match_events), RLS policies per role, migration scripts.
**Avoids:** RLS disabled in production (P5), spectator data exposure (P8).

### Phase 3: Auth Integration
**Rationale:** No protected endpoint can be built or tested without working auth. JWT verification in FastAPI must exist before any role-based endpoint.
**Delivers:** Supabase Auth login/signup flows in Next.js, `@supabase/ssr` cookie session management, `get_current_user` FastAPI dependency with `python-jose` JWT verification, Next.js middleware route protection.
**Avoids:** JWT not verified in FastAPI (P11), browser back-button bypass (P12).

### Phase 4: Event and Player Management API
**Rationale:** Events are the container for all other features. Player registration and check-in depend on events existing with correct states.
**Delivers:** Event CRUD (draft → registration → live → completed), category management, player registration, check-in, organizer roster view.
**Uses:** FastAPI + Supabase service role for writes; Next.js client reads via Supabase with RLS.

### Phase 5: Core Scoring Engine (FastAPI)
**Rationale:** This is the hardest and most critical component. It must be fully proven in isolation before any UI depends on it. All edge cases (deuce, undo across game boundaries, match completion) must be test-covered at the API level.
**Delivers:** Scoring state machine in FastAPI — point submission with idempotency, game win detection (11 points, 2-point lead), match win detection (best of 3), undo via append-only event log, match completion trigger.
**Avoids:** Double-tap race condition (P1), state machine only in frontend (P6), undo deletes instead of event-sources (P15), bracket advancement triggered by client (P14).

### Phase 6: Realtime Integration
**Rationale:** Realtime requires the scoring engine to produce real data. This phase connects the scoring output to all client views.
**Delivers:** Supabase Realtime subscriptions in Next.js for match state, full-state refetch on reconnect, `useRealtimeMatch` hook with cleanup, spectator live view, organizer court grid with live scores.
**Avoids:** Stale state after tab backgrounding (P2), subscription leak (P7).

### Phase 7: Frontend Pages (Port Demo UI)
**Rationale:** With real APIs, auth, and realtime in place, porting the demo UI to Next.js pages is straightforward. This phase converts the single-file demo into route-based pages backed by real data.
**Delivers:** All four role views (spectator, player, referee, organizer) as Next.js pages with real data, optimistic UI on referee scoring screen, match detail view, elapsed timer, match-point indicator.
**Avoids:** Scoring latency causing double-taps (P3) — optimistic UI is built here.

### Phase 8: Tournament Bracket Structure
**Rationale:** Brackets depend on completed matches, which depend on a working scoring engine. Bracket auto-advancement has race condition risk and must be server-triggered.
**Delivers:** Pool play groups with standings, single elimination bracket display, server-side bracket auto-advancement on match completion (atomic, FastAPI-triggered, not client-triggered).
**Avoids:** Bracket advancement race condition (P14).

### Phase Ordering Rationale

- Phases 1-3 are pure infrastructure and cannot be skipped — CORS, RLS, and JWT issues discovered late cause full rework.
- Phase 5 (scoring engine) is intentionally isolated before Phase 6 (Realtime) and Phase 7 (UI) so it can be fully tested with curl/pytest against all invalid states before any UI dependency is created.
- Phase 7 (frontend port) comes after all APIs and Realtime are proven — avoids building UI against stubs that diverge from real behavior.
- Phase 8 (brackets) is last because auto-advancement is the most complex server-side trigger and depends on match completion from Phase 5.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Scoring Engine):** Scoring state machine edge cases (deuce handling, undo across game boundaries, concurrent match events) warrant a focused research pass before implementation. The logic is domain-specific and errors are visible to all users in real time.
- **Phase 8 (Brackets):** Race condition on simultaneous match completions in the same bracket round needs explicit atomicity design. Worth a short research pass on Postgres advisory locks or serializable transactions.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Scaffolding):** Vercel + Railway + Supabase setup is well-documented with official guides.
- **Phase 3 (Auth):** `@supabase/ssr` + Next.js middleware pattern is the official Supabase recommendation with complete examples.
- **Phase 6 (Realtime):** Supabase Realtime subscription pattern is well-documented; the full-state-on-reconnect pattern is standard.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages are stable releases with official integration guides. `@supabase/ssr` is the current recommended package (not deprecated auth-helpers). |
| Features | HIGH | Feature set derived from direct comparison with existing pickleball tournament platforms. Complexity ratings based on known implementation patterns. |
| Architecture | HIGH | Three-tier pattern (Next.js / FastAPI / Supabase) is well-documented. Data flow diagrams match official Supabase Realtime and auth documentation. |
| Pitfalls | HIGH | Pitfalls are based on known failure modes in realtime scoring apps (idempotency, WebSocket reconnect, cold starts). All have documented mitigations. |

**Overall confidence:** HIGH

### Gaps to Address

- **Supabase connection limits at scale:** Free tier limits are known but exact behavior under tournament-day concurrent connections (50-200 spectators) is not validated. Upgrade tier before first live event; design a polling fallback if WebSocket connections saturate.
- **Bracket format specifics:** Research assumed single elimination only. If organizers need round-robin pool play seeding rules, that logic needs explicit design during Phase 8 planning.
- **Dual scoring mode interaction:** Player self-reporting game scores (vs referee point-by-point) in the same event needs a clear UI flow and data model decision. This is marked as a differentiator but the state machine interaction was not fully designed.

## Sources

### Primary (HIGH confidence)
- Official Next.js 15 App Router documentation — middleware, route handlers, SSR patterns
- Official Supabase documentation — `@supabase/ssr`, Realtime subscriptions, RLS, Auth JWT
- FastAPI official documentation — Pydantic v2 integration, dependency injection, async patterns

### Secondary (MEDIUM confidence)
- Supabase community guides — Next.js + FastAPI integration pattern
- Railway documentation — cold start behavior, always-on configuration

### Tertiary (LOW confidence)
- Inference from similar real-time scoring platforms (sports timekeeping apps) — Realtime reconnect patterns, optimistic UI behavior at scale

---
*Research completed: 2026-03-04*
*Ready for roadmap: yes*
