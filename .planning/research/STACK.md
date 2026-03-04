# Stack Research

**Domain:** Real-time pickleball tournament management
**Researched:** 2026-03-04

## Recommended Stack

### Frontend: Next.js 15 (App Router) + React 19

**Why:** App Router provides server components, route-level middleware for auth guards, and streaming SSR. React 19 is the default with Next.js 15.

**Key packages:**
- `next@15` — App Router, middleware, API route handlers
- `react@19` / `react-dom@19` — UI rendering
- `@supabase/supabase-js@2` — Supabase client (auth, realtime, DB reads)
- `@supabase/ssr@0.5+` — Cookie-based auth for Next.js SSR (replaces deprecated `@supabase/auth-helpers-nextjs`)

**Confidence:** HIGH (stable, well-documented integration path)

### Backend: FastAPI 0.111+ (Python 3.11+)

**Why:** Async by default, automatic OpenAPI docs, Pydantic v2 for request validation, excellent for server-authoritative scoring logic.

**Key packages:**
- `fastapi@0.111+` — Web framework
- `pydantic@2` — Data validation (v2 is faster, breaking changes from v1)
- `python-jose[cryptography]` — JWT verification for Supabase tokens
- `supabase-py@2` — Server-side Supabase client (service role key)
- `uvicorn` — ASGI server
- `httpx` — Async HTTP client (if needed for external calls)

**Confidence:** HIGH (FastAPI + Supabase is a well-trodden path)

### Database & Auth: Supabase

**Why:** Postgres + Auth + Realtime in one hosted service. Eliminates need to run own DB, build auth, or set up WebSocket infrastructure.

**Components used:**
- **Supabase Auth** — Email/password login, JWT tokens, role management via user metadata
- **Supabase Postgres** — Primary database, RLS for access control
- **Supabase Realtime** — WebSocket-based change notifications for live scores

**Confidence:** HIGH

### Realtime: Supabase Realtime (Postgres Changes)

**Why:** Included in Supabase tier, no separate WebSocket server needed. Listens to Postgres changes — when FastAPI writes a score update, all subscribed clients get notified automatically.

**Pattern:** Client reads from Supabase Realtime. All writes go through FastAPI (server-authoritative). Browser never writes to Supabase directly for scoring.

**Confidence:** HIGH

### Deployment

| Service | Platform | Why |
|---------|----------|-----|
| Next.js frontend | Vercel | Native Next.js hosting, zero-config |
| FastAPI backend | Railway | Container hosting, auto-deploy from git |
| Database + Auth + Realtime | Supabase Cloud | Managed Postgres, built-in auth and realtime |

**Confidence:** HIGH

## What NOT to Use

| Technology | Why Not |
|-----------|---------|
| `@supabase/auth-helpers-nextjs` | Deprecated — replaced by `@supabase/ssr` |
| TypeScript | User chose JavaScript/JSX to match demo conventions |
| Prisma / Drizzle | Unnecessary ORM layer — use Supabase client directly for reads, raw SQL in FastAPI for writes |
| Tailwind CSS | Demo uses all inline styles — maintain consistency |
| Socket.io | Supabase Realtime handles WebSockets — no need for separate WS server |
| Pydantic v1 | FastAPI 0.111+ requires Pydantic v2, v1 has breaking incompatibilities |
| Redux / Zustand | Demo pattern uses plain useState — keep it simple unless complexity demands it |

## Integration Pattern

```
Browser (Next.js)
  ├── Reads: Supabase JS client (auth, realtime subscriptions, read queries)
  ├── Writes: HTTP to FastAPI (scoring, event management, all mutations)
  └── Auth: Supabase Auth → JWT → passed to FastAPI in Authorization header

FastAPI (Railway)
  ├── Validates: Supabase JWT signature (python-jose)
  ├── Writes: Supabase service role client (bypasses RLS for server operations)
  ├── Logic: Scoring state machine, bracket advancement, event management
  └── Returns: Updated state (client also gets realtime notification)

Supabase (Cloud)
  ├── Postgres: All persistent data
  ├── Auth: User management, JWT issuance
  ├── Realtime: Broadcasts Postgres changes to subscribed clients
  └── RLS: Row-level security enforces access control on direct reads
```

---

*Stack research: 2026-03-04*
