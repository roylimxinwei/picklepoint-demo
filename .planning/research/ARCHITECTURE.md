# Architecture Research

**Domain:** Real-time tournament management (Next.js + FastAPI + Supabase)
**Researched:** 2026-03-04

## Component Boundaries

### 1. Next.js App (Vercel)
- **Responsibility:** UI rendering, client-side state, route protection
- **Communicates with:** Supabase (auth, realtime subscriptions, read queries), FastAPI (all mutations)
- **Does NOT:** Validate scoring logic, manage tournament state, write directly to DB for mutations

### 2. Next.js API Route Handlers (Vercel)
- **Responsibility:** Thin proxy layer (optional) for FastAPI calls, cookie-based auth session management
- **Communicates with:** FastAPI (forwarding requests), Supabase Auth (session refresh)
- **Rule:** NO business logic. Proxy only. All validation lives in FastAPI.

### 3. FastAPI Backend (Railway)
- **Responsibility:** All business logic — scoring state machine, bracket advancement, event management, data validation
- **Communicates with:** Supabase Postgres (via service role key, bypasses RLS)
- **Receives:** Supabase JWT in Authorization header from Next.js clients
- **Validates:** JWT signature using Supabase project JWT secret

### 4. Supabase Postgres (Cloud)
- **Responsibility:** Data persistence, RLS for direct client reads
- **Accessed by:** FastAPI (service role, read/write), Next.js client (anon/user key, read-only via RLS)

### 5. Supabase Auth (Cloud)
- **Responsibility:** User registration, login, JWT issuance, session management
- **Accessed by:** Next.js client (login/signup flows), FastAPI (JWT verification)

### 6. Supabase Realtime (Cloud)
- **Responsibility:** Push score updates to connected clients via WebSocket
- **Triggered by:** Postgres changes (when FastAPI writes score updates)
- **Consumed by:** Next.js client (spectator, organizer dashboard, player views)

## Data Flow

### Auth Flow (Player/Referee/Organizer)
```
Browser → Supabase Auth (login) → JWT issued → stored in cookie via @supabase/ssr
Browser → FastAPI (mutation) → JWT in Authorization header → FastAPI verifies with python-jose
```

### Spectator Access Flow (No Account)
```
Browser → FastAPI: POST /events/verify-code { code: "12345" }
FastAPI → Supabase: SELECT from events WHERE code = $1
FastAPI → Browser: { event_id, event_name, public_data_only }
Browser → Supabase Realtime: subscribe to event's match changes (anon key, RLS allows read)
```

### Referee Scoring Flow (Critical Path)
```
Referee taps "Point Team A"
  → Browser: optimistic UI update (show new score immediately)
  → Browser → FastAPI: POST /matches/{id}/point { team: "a", point_id: "uuid" }
  → FastAPI: validate JWT, load match state, validate game not over
  → FastAPI: apply point, check win conditions, compute new state
  → FastAPI → Supabase: INSERT match_event + UPDATE match state (atomic transaction)
  → Supabase Realtime: broadcasts change to all subscribers
  → All clients (spectators, organizer): receive update, render new score
  → Referee browser: confirm optimistic update matches server response (or rollback)
```

### Realtime Subscription Setup
```
Browser: supabase.channel('match-{id}')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: 'id=eq.{id}' })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      // Full state fetch on initial connect AND reconnect
      fetchCurrentMatchState()
    }
  })
```

## Suggested Build Order

Build order based on dependency chain:

| Order | Component | Depends On | Rationale |
|-------|-----------|-----------|-----------|
| 1 | Project scaffolding | Nothing | Next.js + FastAPI repos, Supabase project |
| 2 | Database schema | Scaffolding | Tables, RLS policies, migrations |
| 3 | Auth integration | Schema, Supabase project | Supabase Auth + FastAPI JWT verification |
| 4 | Event management API | Auth, Schema | CRUD for events, categories |
| 5 | Scoring engine (FastAPI) | Schema, Auth | State machine, point validation, undo — the hardest piece |
| 6 | Realtime integration | Scoring engine | Supabase Realtime subscriptions in Next.js |
| 7 | Frontend pages | Auth, Realtime, APIs | Port demo UI to Next.js pages with real data |
| 8 | Tournament structure | Scoring, Events | Brackets, pools, auto-advancement |

**Critical dependency:** Scoring engine (5) must exist before Realtime (6) can be tested with real data.

## Patterns to Follow

### 1. Proxy Through FastAPI for All Writes
Client never writes to Supabase directly. All mutations go through FastAPI which uses the service role key. This ensures server-authoritative validation.

### 2. JWKS JWT Verification in FastAPI
Use `python-jose` to verify the Supabase JWT signature against the project's JWT secret. Create a `get_current_user` FastAPI dependency that runs on every protected endpoint.

### 3. Read-Only Realtime
Supabase Realtime is a read-only notification channel. Clients subscribe to changes but never trigger writes through the realtime channel.

### 4. Append-Only Match Events
Never delete or update rows in `match_events`. Insert new events (including UNDO events). Derive current match state by replaying the event log. This gives full audit trail.

### 5. Optimistic UI for Scoring
The referee UI applies score changes immediately (optimistic), then reconciles with server response. This masks the network latency of the FastAPI round-trip.

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad |
|-------------|-------------|
| Direct browser writes to Supabase for scoring | Bypasses server validation, enables cheating |
| Polling instead of Realtime | Higher cost, higher latency, more DB load |
| FastAPI running its own WebSocket server | Duplicates Supabase Realtime, adds complexity |
| Storing JWT in localStorage | XSS vulnerability — use httpOnly cookies via @supabase/ssr |
| No audit log for scoring | Cannot debug disputes, no event replay |

## Database Schema Sketch

```sql
-- Core tables
events (id, organizer_id, name, date, venue, code, status, created_at)
categories (id, event_id, name, format, max_players)
players (id, user_id, event_id, category_id, checked_in, registered_at)
courts (id, event_id, name, status)

-- Tournament structure
pools (id, category_id, name)
pool_teams (id, pool_id, team_ids[], standings)
brackets (id, category_id, type, rounds_data)
bracket_slots (id, bracket_id, round, position, team_id, match_id)

-- Scoring (event-sourced)
matches (id, event_id, category_id, court_id, team_a, team_b, status, current_state, referee_id)
match_events (id, match_id, type, team, point_id, timestamp, referee_id)
-- type: 'point_a', 'point_b', 'undo', 'game_end', 'match_end'
-- point_id: client UUID for idempotency
```

---

*Architecture research: 2026-03-04*
