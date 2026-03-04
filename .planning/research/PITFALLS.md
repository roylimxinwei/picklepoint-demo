# Domain Pitfalls

**Domain:** Real-time tournament/scoring platform (Next.js + FastAPI + Supabase)
**Researched:** 2026-03-04

## Critical Pitfalls

### Pitfall 1: Race Condition on Point Submission (Double-tap / Network Retry)

**What goes wrong:** Referee taps "Point" on flaky gym Wi-Fi. Request times out on client, app retries. Server already committed first request. Same point recorded twice.

**Prevention:**
- Every point submission includes a client-generated UUID (`point_id`). FastAPI checks if `point_id` already exists before inserting. If exists, return 200 with current state.
- Add `UNIQUE` constraint on `match_events.point_id` as last defense.
- Never auto-retry scoring mutations without a new `point_id`.

**Detection:** Scores jump by 2 after network hiccup. `match_events` has duplicate timestamps within 500ms.

**Phase:** Core scoring API — before referee UI is wired.

### Pitfall 2: Supabase Realtime Stalls After Tab Backgrounding

**What goes wrong:** Spectator backgrounds tab, returns later. WebSocket reconnected but component never re-fetched current state. Score changes during disconnect are lost.

**Prevention:**
- On every Supabase channel `SUBSCRIBED` event (including reconnects), immediately fetch full current state and reconcile.
- Never treat realtime stream as sole source of truth — it's "change events" with full-state sync on reconnect.

**Detection:** Background tab 60 seconds while mutating scores. Return — scores are stale.

**Phase:** Realtime integration phase.

### Pitfall 3: Server-Authoritative Scoring Latency Feels Broken

**What goes wrong:** Referee taps "Point" → FastAPI on Railway (possible cold start) → writes to Supabase → Realtime broadcasts back. 1.5-3 second delay. Feels broken. Referees double-tap (triggering Pitfall 1).

**Prevention:**
- **Optimistic UI** on referee scoring: show new score immediately, reconcile with server response. Roll back if rejected.
- Keep Railway warm with ping every 4-5 minutes during tournament hours.
- Subtle loading indicator, not full spinner. Tap must register visually immediately.

**Detection:** Time round-trip from tap to update. If > 800ms on good connection, UX unacceptable.

**Phase:** Referee scoring UI. Optimistic pattern from day one.

### Pitfall 4: CORS Misconfiguration Breaks Production

**What goes wrong:** Next.js on `picklepoint.vercel.app` calls FastAPI on Railway. Dev works via proxy. Production: "Access blocked by CORS policy." App completely non-functional.

**Prevention:**
- `CORSMiddleware` origins from env var: `ALLOWED_ORIGINS=https://picklepoint.vercel.app`
- Never `allow_origins=["*"]` with `allow_credentials=True` (browser rejects this combo).
- Test production CORS before any phase is complete.

**Detection:** Browser console: `Cross-Origin Request Blocked`.

**Phase:** Infrastructure/deployment — before feature work depends on production API.

### Pitfall 5: Supabase RLS Left Disabled

**What goes wrong:** RLS disabled during dev "to move faster." Ships without it. Any authenticated user can read all data, update any score — the Supabase anon key is in the browser.

**Prevention:**
- Enable RLS on every table before any data enters production.
- All scoring writes go through FastAPI (service role key). Browser's anon/user key only reads.
- Write policies per role: organizers manage own events, referees score assigned matches, players read own registration.

**Detection:** Supabase dashboard → any table showing "RLS disabled" is a risk.

**Phase:** Database schema phase. RLS alongside schema, not after.

### Pitfall 6: Match State Machine Only in Frontend

**What goes wrong:** Game-end logic (11 points, 2-point lead, best of 3) exists only in React. FastAPI accepts any point without validating. Referee scores after match completion — DB records 13-point game.

**Prevention:**
- FastAPI is single source of truth for state transitions. Score endpoint must: load state → validate in-progress → validate game not won → apply point → check win conditions → write atomically.
- Test API directly with curl/pytest for all invalid states.

**Detection:** POST a point to a completed match — must return 409/422, not 200.

**Phase:** Core scoring API. Design constraint before referee UI is built.

## Moderate Pitfalls

### Pitfall 7: Realtime Subscription Leak in React

**What goes wrong:** Component subscribes to Supabase channel, user navigates away, cleanup missing. After 5 pages: 5 active subscriptions firing ghost callbacks.

**Prevention:** Always `return () => supabase.removeChannel(channel)` in useEffect. Create `useRealtimeMatch(matchId)` hook.

**Phase:** Realtime integration.

### Pitfall 8: Spectator Event Code Exposes Internal Data

**What goes wrong:** `SELECT * FROM events WHERE code = $1` returns organizer contact info to unauthenticated spectators.

**Prevention:** Explicit spectator-safe columns. Create a view with only public fields. RLS allows anon reads on view only.

**Phase:** Auth/access phase.

### Pitfall 9: Railway Cold Starts During Tournament

**What goes wrong:** FastAPI idle 20 minutes. First request: 8-12 second cold start. Referee thinks it crashed.

**Prevention:** Keep-alive ping every 4 minutes during tournament hours. Lightweight `/health` endpoint. Railway "always-on" for event days.

**Phase:** Infrastructure phase.

### Pitfall 10: Next.js API Routes Duplicating FastAPI Logic

**What goes wrong:** Validation logic gradually lands in both Next.js route handlers and FastAPI. They diverge. Bug in Next.js route allows invalid state.

**Prevention:** Hard rule: Next.js API routes are thin proxies only. All validation in FastAPI. Prefer calling FastAPI directly from client.

**Phase:** Architecture decision at project start.

### Pitfall 11: Supabase JWT Not Validated in FastAPI

**What goes wrong:** FastAPI trusts JWT claims without verifying signature. Attacker crafts fake JWT claiming organizer role.

**Prevention:** `python-jose` or `PyJWT` to verify signature against Supabase JWT secret. `get_current_user` dependency on every protected endpoint.

**Detection:** Send hand-crafted JWT — must be rejected with 401.

**Phase:** Auth integration. Before any role-based endpoints.

## Minor Pitfalls

### Pitfall 12: Browser Back Button Bypasses Auth Guards

**Prevention:** Next.js middleware (`middleware.js`) protects routes at the edge — redirect before page renders.

**Phase:** Auth phase.

### Pitfall 13: Supabase Free Tier Connection Limits

**Prevention:** Know limits before go-live, upgrade tier. Design polling fallback if WebSocket fails.

**Phase:** Load testing.

### Pitfall 14: Bracket Advancement Triggered by Client

**Prevention:** Server-side trigger in FastAPI on match-complete. Never a client action.

**Phase:** Tournament bracket phase.

### Pitfall 15: Undo Deletes Instead of Event-Sources

**Prevention:** Never delete from `match_events`. Insert `UNDO` event. Derive state from event log.

**Phase:** Core scoring API.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Database schema | RLS disabled | Enable RLS at creation (P5) |
| Core scoring API | Double-tap race condition | Idempotency key (P1) |
| Core scoring API | State machine in frontend only | Server-side validation (P6) |
| Core scoring API | No undo audit trail | Event-sourced log (P15) |
| Auth integration | JWT not verified | `get_current_user` dependency (P11) |
| Referee UI | Scoring latency | Optimistic UI (P3) |
| Realtime integration | Stale on reconnect | Full-state refetch (P2) |
| Realtime integration | Subscription leak | useEffect cleanup (P7) |
| Infrastructure | CORS in production | Env-based origins (P4) |
| Infrastructure | Railway cold start | Keep-warm ping (P9) |

---

*Pitfalls research: 2026-03-04*
