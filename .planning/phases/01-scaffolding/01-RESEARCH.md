# Phase 1: Scaffolding - Research

**Researched:** 2026-03-05
**Domain:** Three-tier web deployment — Next.js 15 + FastAPI + Supabase on Vercel + Railway
**Confidence:** HIGH (core stack), MEDIUM (Railway cold-start mitigation)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Repository structure:** Monorepo with `/frontend` (Next.js) and `/backend` (FastAPI) directories — single git repo, shared history. Vercel deploys from `/frontend`, Railway deploys from `/backend`.
- **API communication pattern:** Browser calls FastAPI directly (not proxied through Next.js API routes). JWT passed in Authorization header. Next.js API routes used only for Supabase Auth cookie management via `@supabase/ssr`. FastAPI CORSMiddleware configured with origins from environment variable.
- **Local development:** Two terminal windows (`npm run dev` + `uvicorn`). Both connect to the same Supabase project. `.env.local` files in each directory. No Docker required.
- **Deployment targets:** Frontend → Vercel (auto-deploy from main, root directory `/frontend`). Backend → Railway (auto-deploy from main, root directory `/backend`). Database → Supabase Cloud (single project).
- **Health and keepalive:** FastAPI `/health` endpoint returns 200 (no DB query). Keep-warm ping every 4 minutes to prevent Railway cold starts.
- **Language:** JavaScript/JSX only — no TypeScript, to match demo conventions.
- **Minimal dependencies:** Only what's needed for the skeleton.

### Claude's Discretion
- Exact Next.js project configuration (App Router layout)
- FastAPI project structure (routers, models, dependencies)
- Environment variable naming conventions
- Which Supabase features to enable at project creation

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 1 wires up three services that have never met each other into a coherent working skeleton: Next.js 15 on Vercel, FastAPI on Railway, and Supabase Cloud. No features are implemented — the goal is proving the plumbing works end-to-end in both local dev and production. Each service needs its own scaffolding, environment variable wiring, and a handshake verification that cross-origin requests flow cleanly.

The technical complexity is low but the sequencing matters: Supabase project must exist first (to get credentials), then FastAPI (to get its deployed URL for CORS configuration), then Next.js (to wire in both). The keep-warm strategy for Railway deserves early attention because Railway's native cron minimum is 5 minutes — the 4-minute requirement from CONTEXT.md means an external cron service (GitHub Actions or a dedicated uptime service) rather than Railway's built-in cron.

JavaScript/JSX only (no TypeScript) is a locked constraint. This affects how Supabase client files are structured — use `.js` not `.ts` extensions throughout, and skip `createServerClient` type annotations.

**Primary recommendation:** Scaffold in dependency order (Supabase → Railway/FastAPI → Vercel/Next.js), verify each service independently, then verify cross-service communication. Implement keep-warm ping via GitHub Actions scheduled workflow rather than Railway cron (Railway minimum is 5 min, requirement is 4 min).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x | React framework with App Router, SSR | Locked decision |
| react / react-dom | 18.x | UI runtime | Matches demo, installed by create-next-app |
| @supabase/supabase-js | latest (2.x) | Supabase client for JS | Official Supabase SDK |
| @supabase/ssr | latest | Cookie-based auth for Next.js SSR | Replaces deprecated auth-helpers |
| fastapi | 0.115.x | Python API framework | Locked decision |
| uvicorn[standard] | 0.30.x | ASGI server for FastAPI | Standard pairing; `[standard]` includes websocket support |
| pydantic-settings | 2.x | Environment variable management with `.env` support | Official FastAPI recommendation; bundles python-dotenv |
| supabase | 2.x | Python Supabase client (`supabase-py`) | Official SDK for server-side DB access |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| python-dotenv | (bundled with pydantic-settings) | Load `.env` in local dev | Already included; no separate install |
| httpx | 0.27.x | HTTP client for FastAPI tests | Needed for `TestClient` and async test patterns |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pydantic-settings | python-dotenv only | pydantic-settings adds type validation and IDE autocomplete for settings — worth the extra package |
| uvicorn[standard] | gunicorn + uvicorn workers | gunicorn is better for multi-core production; uvicorn alone is fine for Railway hobby/starter tier and simpler to configure |
| GitHub Actions keep-warm | Railway cron | Railway native cron minimum is 5 minutes; GitHub Actions can run every 4 minutes; use GitHub Actions |

**Installation (frontend — run inside `/frontend`):**
```bash
npx create-next-app@latest . --no-typescript --eslint --src-dir --app --no-tailwind
npm install @supabase/supabase-js @supabase/ssr
```

**Installation (backend — run inside `/backend`):**
```bash
pip install fastapi "uvicorn[standard]" pydantic-settings supabase httpx
pip freeze > requirements.txt
```

---

## Architecture Patterns

### Recommended Project Structure

```
/                           # Git repo root
├── frontend/               # Next.js app — Vercel root directory
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.jsx      # Root layout (html + body)
│   │   │   ├── page.jsx        # Landing page
│   │   │   └── api/
│   │   │       └── auth/
│   │   │           └── callback/
│   │   │               └── route.js   # Supabase auth callback
│   │   ├── lib/
│   │   │   └── supabase/
│   │   │       ├── client.js   # createBrowserClient (used in Client Components)
│   │   │       └── server.js   # createServerClient (used in Server Components)
│   │   └── middleware.js       # Supabase token refresh middleware
│   ├── .env.local          # NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.
│   ├── next.config.js
│   └── package.json
│
├── backend/                # FastAPI app — Railway root directory
│   ├── main.py             # App entrypoint, CORS middleware, router mounts
│   ├── config.py           # pydantic-settings Settings class
│   ├── routers/
│   │   └── health.py       # /health endpoint
│   ├── .env                # Local dev env vars (gitignored)
│   ├── requirements.txt
│   └── railway.toml        # Railway deployment config
│
└── .github/
    └── workflows/
        └── keep-warm.yml   # Scheduled GitHub Actions ping every 4 minutes
```

### Pattern 1: Next.js App Router with JavaScript

**What:** App Router file-system routing using `.jsx` (not `.tsx`) files. All interactive components use `"use client"` directive.
**When to use:** All Next.js pages and components in this project.
**Example:**
```jsx
// Source: https://nextjs.org/docs/app/getting-started/installation
// frontend/src/app/layout.jsx
export const metadata = {
  title: 'PicklePoint',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```jsx
// frontend/src/app/page.jsx — minimal landing (scaffolding only)
export default function Home() {
  return <main style={{ color: '#fff', background: '#0A0F1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <h1 style={{ fontFamily: 'Outfit, sans-serif' }}>PicklePoint</h1>
  </main>
}
```

### Pattern 2: Supabase SSR Client Setup (JavaScript)

**What:** Two separate client factory functions — one for browser (Client Components), one for server (Server Components, Route Handlers, middleware).
**When to use:** Any component that needs database access or auth state.
**Example:**
```js
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// frontend/src/lib/supabase/client.js
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

```js
// frontend/src/lib/supabase/server.js
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

```js
// frontend/src/middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Pattern 3: FastAPI with pydantic-settings

**What:** Centralized settings class loaded from environment variables; `/health` endpoint; CORSMiddleware wired from settings.
**When to use:** All environment variable access in FastAPI.
**Example:**
```python
# Source: https://fastapi.tiangolo.com/advanced/settings/
# backend/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    allowed_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

```python
# Source: https://fastapi.tiangolo.com/tutorial/cors/
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from routers import health

settings = get_settings()

app = FastAPI(title="PicklePoint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health.router)
```

```python
# backend/routers/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}
```

### Pattern 4: Railway Deployment Config

**What:** `railway.toml` in the `/backend` directory tells Railway how to build and start the app.
**When to use:** Required for Railway to know the start command.
**Example:**
```toml
# Source: https://docs.railway.com/guides/fastapi
# backend/railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
```

### Pattern 5: Keep-Warm via GitHub Actions

**What:** Scheduled workflow pings `/health` every 4 minutes to prevent Railway cold starts.
**When to use:** Required because Railway's minimum cron interval is 5 minutes, but the requirement is 4 minutes.
**Example:**
```yaml
# .github/workflows/keep-warm.yml
name: Keep Railway Warm
on:
  schedule:
    - cron: '*/4 * * * *'   # every 4 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping health endpoint
        run: |
          curl -f ${{ secrets.RAILWAY_BACKEND_URL }}/health || exit 1
```

### Anti-Patterns to Avoid

- **Using TypeScript anywhere:** Locked constraint is JavaScript/JSX only. Using `.ts`/`.tsx` extensions will break the convention from the demo.
- **Using `allow_origins=["*"]` with `allow_credentials=True` in CORS:** FastAPI will reject this combination; always specify explicit origins when using credentials.
- **Importing Supabase client at module level in Server Components:** Each request should create a fresh server client (factory pattern) so cookies are request-scoped, not shared.
- **Calling `uvicorn` without `--host 0.0.0.0`:** Railway needs the server to bind to all interfaces; localhost-only binding will make the service unreachable.
- **Storing service role key in `NEXT_PUBLIC_` variables:** Service role key bypasses Row Level Security — it must never be exposed to the browser. Use `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) and only use it in server-side code or FastAPI.
- **Committing `.env` or `.env.local` files:** Both must be in `.gitignore`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth token refresh across SSR/client boundary | Custom cookie-passing logic | `@supabase/ssr` middleware | Handles token refresh, cookie sync, and edge cases across Server Components and Client Components |
| Environment variable validation | Manual `process.env` checks with throws | `pydantic-settings` `BaseSettings` | Provides type coercion, default values, `.env` loading, and startup validation all in one |
| CORS preflight handling | Custom OPTIONS handler | `fastapi.middleware.cors.CORSMiddleware` | Handles all preflight cases including credential handling, method/header allowlists |
| Python settings singleton | Global module-level variables | `@lru_cache` + `BaseSettings` | FastAPI's official pattern; testable (can override in tests) |

**Key insight:** The `@supabase/ssr` package specifically exists because naive cookie handling across Next.js SSR/RSC/Client boundaries breaks auth in subtle ways. Don't attempt a custom implementation.

---

## Common Pitfalls

### Pitfall 1: Railway Cold Starts During Live Tournaments
**What goes wrong:** Railway spins down inactive services; first request after idle takes 5-30 seconds. During a live tournament this is unacceptable.
**Why it happens:** Railway's free/starter tier hibernates services with no traffic.
**How to avoid:** GitHub Actions `*/4 * * * *` schedule pings `/health` continuously. Store the deployed URL in `RAILWAY_BACKEND_URL` GitHub Actions secret.
**Warning signs:** `/health` response time > 2 seconds at any point during testing.

### Pitfall 2: CORS Failure in Production but Not Dev
**What goes wrong:** `CORSMiddleware` `allow_origins` is set correctly for localhost but the Vercel production URL is missing.
**Why it happens:** Vercel generates a unique domain (`my-app-abc123.vercel.app`) at deploy time, which differs from the custom domain. Both must be in `ALLOWED_ORIGINS`.
**How to avoid:** Set `ALLOWED_ORIGINS` Railway environment variable to include both the Vercel preview URL and the production URL. Use comma-separated string, parsed by `origins_list` property.
**Warning signs:** Browser console shows `Access-Control-Allow-Origin` error in production but not locally.

### Pitfall 3: Supabase Auth Cookies Not Refreshing
**What goes wrong:** Users get logged out on page refresh or server-side auth checks fail even with a valid session.
**Why it happens:** Next.js Server Components cannot write cookies; the middleware must intercept every request to refresh the token before Server Components run.
**How to avoid:** Ensure `middleware.js` is in the `src/` directory (not `app/`). The matcher must not exclude API routes that handle auth.
**Warning signs:** `supabase.auth.getUser()` returns `null` in Server Components despite a logged-in session in the browser.

### Pitfall 4: Railway Root Directory vs. Config File Path
**What goes wrong:** Setting Railway root directory to `/backend` but `railway.toml` is not found.
**Why it happens:** Railway's config file does NOT follow the root directory setting. The absolute path must be specified (e.g., `/backend/railway.toml`).
**How to avoid:** In Railway service Settings, explicitly set the config file path to `/backend/railway.toml`.
**Warning signs:** Railway build uses defaults instead of your `startCommand`.

### Pitfall 5: `PORT` Environment Variable Not Used
**What goes wrong:** FastAPI starts on a hardcoded port (8000), Railway maps a different port, health checks fail.
**Why it happens:** Railway injects `$PORT` dynamically; ignoring it means the process binds to the wrong port.
**How to avoid:** Always use `--port $PORT` in the uvicorn start command (as shown in `railway.toml` pattern above).
**Warning signs:** Service deploys but health check times out; Railway shows "Port not open" error.

### Pitfall 6: Vercel Environment Variables Not Propagated to Edge Middleware
**What goes wrong:** `NEXT_PUBLIC_SUPABASE_URL` works in components but `middleware.js` cannot read it.
**Why it happens:** Edge middleware has limited access to environment variables — only `NEXT_PUBLIC_` variables are available in the Edge runtime by default.
**How to avoid:** Use `NEXT_PUBLIC_` prefix for Supabase URL and anon key (these are safe to expose). Service role key goes in a server-only variable used only in Route Handlers/Server Components.
**Warning signs:** Middleware throws `Cannot read properties of undefined` on `process.env.NEXT_PUBLIC_SUPABASE_URL`.

---

## Code Examples

### Environment Variable Naming Convention (Recommended)

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000    # FastAPI URL (dev)
# In Vercel: NEXT_PUBLIC_API_URL=https://backend.up.railway.app

# backend/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ALLOWED_ORIGINS=http://localhost:3000
# In Railway: ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app
PORT=8000
```

### Supabase Python Client (FastAPI side)

```python
# Source: https://github.com/supabase/supabase-py
# backend/database.py
from supabase import create_client, Client
from config import get_settings
from functools import lru_cache

@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
```

### Cross-Origin Fetch from Next.js to FastAPI

```js
// frontend/src/lib/api.js
// Source: CONTEXT.md — browser calls FastAPI directly with JWT in Authorization header
export async function apiFetch(path, options = {}) {
  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers = {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...options.headers,
  }

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
  })
}
```

### Vercel Project Configuration (vercel.json in /frontend)

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install"
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023-2024 | auth-helpers is deprecated; all fixes go to @supabase/ssr |
| `service_role` key name | `SUPABASE_SERVICE_ROLE_KEY` (new projects may use "secret key") | Nov 2025 | New Supabase projects use "secret keys" not `service_role`; verify in project API settings |
| Railway Dockerfile required | nixpacks auto-detection | 2023 | Railway auto-detects Python + FastAPI via nixpacks; Dockerfile optional |
| `next dev` (webpack) | `next dev --turbopack` or just `next dev` (Turbopack default) | Next.js 15 | Turbopack is now the default bundler in Next.js 15 dev mode |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated — use `@supabase/ssr` only
- `supabase.auth.session()`: Removed in supabase-js v2 — use `supabase.auth.getSession()` or `supabase.auth.getUser()`
- FastAPI `allow_origins=["*"]` with `allow_credentials=True`: Will raise `RuntimeError` — specify origins explicitly

---

## Open Questions

1. **Supabase API key naming on new projects**
   - What we know: As of November 2025, new Supabase projects use "publishable key" and "secret key" terminology instead of "anon key" and "service_role key"
   - What's unclear: Whether supabase-py and `@supabase/ssr` accept the new key format identically or require any adapter
   - Recommendation: When creating the Supabase project, check the API Settings page carefully. The environment variable names can be whatever we choose — what matters is using the correct key value from the dashboard.

2. **Railway keep-warm vs. paid tier sleeping behavior**
   - What we know: Railway starter tier sleeps services; GitHub Actions every 4 min is the workaround
   - What's unclear: Whether Railway's "Pro" or paid tier eliminates cold starts entirely (which would remove the need for keep-warm)
   - Recommendation: Implement GitHub Actions keep-warm regardless; easy to disable later if upgraded.

3. **Vercel preview deployment URLs and CORS**
   - What we know: Each Vercel PR gets a unique preview URL (unpredictable)
   - What's unclear: Whether to use `allow_origin_regex` in FastAPI to match `*.vercel.app` for preview deployments
   - Recommendation: For Phase 1, use exact origin matching (production + localhost). If preview URL CORS testing is needed in Phase 2+, add `allow_origin_regex`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x (backend) / none configured yet (frontend — no test runner in scope for Phase 1) |
| Config file | `backend/pytest.ini` — Wave 0 gap |
| Quick run command | `cd backend && pytest tests/ -x -q` |
| Full suite command | `cd backend && pytest tests/ -v` |

### Phase Requirements → Test Map

Phase 1 has no formal requirement IDs (infrastructure prerequisite). Success criteria map to smoke tests:

| Criteria | Behavior | Test Type | Automated Command | File Exists? |
|----------|----------|-----------|-------------------|-------------|
| SC-1: Next.js loads | `GET /` returns 200 | smoke (manual browser) | `curl http://localhost:3000` | N/A — manual |
| SC-2: FastAPI /health | `GET /health` returns `{"status": "ok"}` | unit | `pytest tests/test_health.py -x` | Wave 0 gap |
| SC-3: CORS no errors | Browser fetch from localhost:3000 to localhost:8000 succeeds | integration (manual browser) | Check browser console | N/A — manual |
| SC-4: Supabase env wired | `settings.supabase_url` is non-empty at startup | unit | `pytest tests/test_config.py -x` | Wave 0 gap |
| SC-5: Local dev connects | `uvicorn` starts without errors with `.env` loaded | smoke | `uvicorn main:app` exits cleanly | N/A — manual |

### Sampling Rate
- **Per task commit:** `cd backend && pytest tests/ -x -q`
- **Per wave merge:** `cd backend && pytest tests/ -v`
- **Phase gate:** Both automated tests green + all 5 manual smoke checks pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/__init__.py` — empty file to make tests a package
- [ ] `backend/tests/test_health.py` — covers SC-2 (`GET /health` returns 200)
- [ ] `backend/tests/test_config.py` — covers SC-4 (settings loads SUPABASE_URL from env)
- [ ] `backend/pytest.ini` — configure testpaths and asyncio mode
- [ ] Framework install: `pip install pytest pytest-asyncio httpx` (add to requirements.txt)

---

## Sources

### Primary (HIGH confidence)
- [Official Next.js Installation](https://nextjs.org/docs/app/getting-started/installation) — create-next-app prompts, App Router structure
- [Supabase SSR Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs) — createBrowserClient/createServerClient pattern, middleware setup
- [FastAPI CORS Docs](https://fastapi.tiangolo.com/tutorial/cors/) — CORSMiddleware parameters and credentials constraint
- [FastAPI Settings Docs](https://fastapi.tiangolo.com/advanced/settings/) — pydantic-settings BaseSettings pattern with lru_cache
- [Railway FastAPI Guide](https://docs.railway.com/guides/fastapi) — deployment config, start command
- [Railway Monorepo Guide](https://docs.railway.com/guides/monorepo) — root directory config, railway.toml absolute path requirement

### Secondary (MEDIUM confidence)
- [Railway Cron Docs](https://docs.railway.com/reference/cron-jobs) — confirmed 5-minute minimum; GitHub Actions workaround needed
- [supabase-py GitHub](https://github.com/supabase/supabase-py) — pip install supabase, create_client usage
- [Vercel Monorepo Docs](https://vercel.com/docs/monorepos) — root directory setting for subdirectory deploys
- [Supabase API Key Changes Discussion](https://github.com/orgs/supabase/discussions/29260) — new "publishable key" / "secret key" naming (post Nov 2025)

### Tertiary (LOW confidence — needs validation)
- WebSearch results on Railway cold start behavior: specific timing (5-30 seconds) is community-reported, not officially documented

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via official docs or official GitHub
- Architecture: HIGH — patterns sourced from official Supabase SSR guide and FastAPI docs
- Railway deployment: MEDIUM — railway.toml format inferred from official guide; verify exact format during implementation
- Keep-warm strategy: MEDIUM — Railway 5-minute cron minimum confirmed; GitHub Actions workaround is community-established pattern
- Pitfalls: HIGH — all derived from official documentation constraints (CORS + credentials, PORT env, cookie scope)

**Research date:** 2026-03-05
**Valid until:** 2026-06-05 (stable stack — 90 days; check Supabase key naming if creating project after this date)
