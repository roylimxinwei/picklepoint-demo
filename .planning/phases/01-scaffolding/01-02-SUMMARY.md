---
phase: 01-scaffolding
plan: 02
subsystem: infra
tags: [nextjs, react, supabase, ssr, middleware, app-router]

# Dependency graph
requires: []
provides:
  - Next.js 15 App Router frontend in /frontend with build passing
  - Supabase browser client factory (createBrowserClient) for Client Components
  - Supabase server client factory (createServerClient) with SSR cookie handling
  - Auth token refresh middleware at src/middleware.js
  - apiFetch helper targeting NEXT_PUBLIC_API_URL with JWT Authorization header
  - OAuth callback route at /api/auth/callback for Google OAuth (Phase 3)
affects: [02-auth, 03-google-oauth, 04-player, 05-referee, 06-organizer, 07-spectator]

# Tech tracking
tech-stack:
  added: [next@15.2.0, react@18, react-dom@18, "@supabase/supabase-js@2.x", "@supabase/ssr@0.6.x"]
  patterns:
    - "App Router with .jsx (no TypeScript) — all Next.js files use .js/.jsx extensions"
    - "Supabase factory pattern — createClient() called per-request, never at module level"
    - "Middleware in src/ (not src/app/) for auth token refresh on every non-static request"
    - "apiFetch dynamic import of supabase/client to avoid SSR issues"

key-files:
  created:
    - frontend/package.json
    - frontend/next.config.js
    - frontend/jsconfig.json
    - frontend/src/app/layout.jsx
    - frontend/src/app/page.jsx
    - frontend/.env.example
    - frontend/src/lib/supabase/client.js
    - frontend/src/lib/supabase/server.js
    - frontend/src/middleware.js
    - frontend/src/lib/api.js
    - frontend/src/app/api/auth/callback/route.js
  modified: []

key-decisions:
  - "Used dynamic import for supabase/client in apiFetch to prevent client-only code running server-side"
  - "middleware.js placed in src/ (not src/app/) per Supabase SSR docs for correct middleware detection"
  - "Google Fonts loaded via <link> tags in layout.jsx head (not next/font) to match demo font stack"

patterns-established:
  - "Pattern: Browser Supabase client — import { createClient } from '@/lib/supabase/client' in Client Components"
  - "Pattern: Server Supabase client — const supabase = await createClient() from '@/lib/supabase/server' in Server Components"
  - "Pattern: API calls — import { apiFetch } from '@/lib/api' for all FastAPI requests"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 1 Plan 02: Next.js Frontend Scaffolding Summary

**Next.js 15 App Router frontend with @supabase/ssr cookie-based auth and apiFetch helper targeting FastAPI — all JavaScript/JSX, builds clean**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-05T04:52:26Z
- **Completed:** 2026-03-05T04:55:11Z
- **Tasks:** 2
- **Files modified:** 11 created

## Accomplishments
- Next.js 15 app with App Router scaffolded in /frontend with passing production build
- Supabase SSR client setup: browser factory (createBrowserClient) and server factory (createServerClient) with request-scoped cookie handling
- Auth token refresh middleware in src/middleware.js with correct static-asset exclusion matcher
- apiFetch helper in src/lib/api.js with dynamic Supabase client import and JWT Bearer injection
- OAuth callback route at /api/auth/callback ready for Google OAuth in Phase 3

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js app with App Router and Supabase dependencies** - `f3b65c9` (feat)
2. **Task 2: Add Supabase client factories, auth middleware, and API helper** - `d88013e` (feat)

**Plan metadata:** (docs commit — see final commit hash)

## Files Created/Modified
- `frontend/package.json` - Next.js 15 + React 18 + @supabase/supabase-js + @supabase/ssr dependencies
- `frontend/next.config.js` - Minimal Next.js config
- `frontend/jsconfig.json` - @/* import alias pointing to ./src/*
- `frontend/src/app/layout.jsx` - Root layout with Google Fonts (Outfit, DM Sans, JetBrains Mono) and dark theme body
- `frontend/src/app/page.jsx` - Placeholder landing page with PicklePoint heading
- `frontend/.env.example` - Template with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL
- `frontend/src/lib/supabase/client.js` - createBrowserClient factory for Client Components
- `frontend/src/lib/supabase/server.js` - createServerClient factory with cookie getAll/setAll for SSR
- `frontend/src/middleware.js` - Auth token refresh middleware with static asset exclusion matcher
- `frontend/src/lib/api.js` - apiFetch helper with JWT Bearer auth and NEXT_PUBLIC_API_URL target
- `frontend/src/app/api/auth/callback/route.js` - OAuth code exchange route handler

## Decisions Made
- Used dynamic `import('./supabase/client')` inside apiFetch to avoid importing browser-only code at module level (would break SSR)
- middleware.js placed in `src/` (not `src/app/`) per Supabase SSR documentation requirement
- Google Fonts loaded via `<link>` tags in layout.jsx `<head>` rather than next/font to keep the same font stack as the demo (Outfit, DM Sans, JetBrains Mono)

## Deviations from Plan

None - plan executed exactly as written. All files created as specified in the plan action blocks, using the exact patterns from RESEARCH.md Pattern 2.

## Issues Encountered

None - npm install and npm run build completed cleanly on first attempt. Middleware detected at 79.9 kB, callback route registered as dynamic (server-rendered on demand) as expected.

## User Setup Required

Before running locally, developers must create `frontend/.env.local` from `.env.example` with real Supabase credentials:

```bash
cp frontend/.env.example frontend/.env.local
# Then fill in:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

The app will start with `npm run dev` from within the `frontend/` directory even without these env vars, but Supabase auth will not function until they are set.

## Next Phase Readiness
- Frontend scaffold is complete and build passes — ready for Plan 03 (FastAPI backend scaffolding)
- Supabase client plumbing is ready for Plan 04+ (auth flows)
- apiFetch helper is ready to use once FastAPI is running (Plan 03)
- No blockers

## Self-Check: PASSED

All 11 created files verified present on disk. Both task commits (f3b65c9, d88013e) verified in git log.

---
*Phase: 01-scaffolding*
*Completed: 2026-03-05*
