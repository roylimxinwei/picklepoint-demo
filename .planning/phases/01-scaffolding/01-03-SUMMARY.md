---
phase: 01-scaffolding
plan: "03"
subsystem: infra
tags: [github-actions, gitignore, keep-warm, railway, vercel, supabase]

# Dependency graph
requires:
  - phase: 01-scaffolding
    provides: FastAPI backend with /health endpoint (01-01)
  - phase: 01-scaffolding
    provides: Next.js frontend scaffolding (01-02)
provides:
  - Root .gitignore covering node_modules, .env, __pycache__, .next, .vercel
  - backend/.gitignore covering Python artifacts, .venv, .env
  - frontend/.gitignore covering node_modules, .next, .env.local, .vercel
  - GitHub Actions keep-warm workflow pinging /health every 4 minutes
affects: [02-database-schema, 03-authentication, 04-player, 05-referee, 06-organizer, 07-spectator]

# Tech tracking
tech-stack:
  added:
    - github-actions (keep-warm workflow)
  patterns:
    - "Keep-warm pattern: schedule cron */4 * * * * + workflow_dispatch + single curl -f step with timeout-minutes: 1"
    - "Secret reference pattern: ${{ secrets.RAILWAY_BACKEND_URL }} for deployment-specific secrets"

key-files:
  created:
    - .github/workflows/keep-warm.yml
    - backend/.gitignore
    - frontend/.gitignore
  modified:
    - .gitignore

key-decisions:
  - "keep-warm.yml uses timeout-minutes: 1 on the job to prevent runaway workflow minutes consumption"
  - ".gitignore files separated per subproject (root/backend/frontend) for clarity and git performance"

patterns-established:
  - "Pattern: GitHub Actions keep-warm — cron */4 on ubuntu-latest, curl -f URL/health || exit 1, timeout-minutes: 1"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 1 Plan 03: Integration Layer Summary

**Root + backend + frontend .gitignore files and GitHub Actions keep-warm cron hitting /health every 4 minutes via RAILWAY_BACKEND_URL secret**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-05T04:57:21Z
- **Completed:** 2026-03-05T05:00:00Z
- **Tasks:** 1 of 2 auto-tasks complete (Task 2 is checkpoint:human-verify)
- **Files modified:** 4

## Accomplishments

- Root `.gitignore` updated with all required entries: `.env`, `.env.local`, `.env*.local`, `__pycache__/`, `*.pyc`, `.pytest_cache/`, `dist/`, `.next/`, `.vercel/`
- `backend/.gitignore` created covering Python artifacts, virtual environments, and `.env`
- `frontend/.gitignore` created covering `node_modules/`, `.next/`, `.env.local`, `.env*.local`, `.vercel`
- `.github/workflows/keep-warm.yml` created with `*/4 * * * *` cron schedule, `workflow_dispatch` trigger, 1-minute job timeout, and `curl -f ${{ secrets.RAILWAY_BACKEND_URL }}/health || exit 1` step

## Task Commits

Each task was committed atomically:

1. **Task 1: Create gitignore files and GitHub Actions keep-warm workflow** - `90e590a` (chore)
2. **Task 2: Verify complete scaffolding works end-to-end** - checkpoint:human-verify (pending user verification)

**Plan metadata:** (docs commit — see final commit hash)

## Files Created/Modified

- `.gitignore` - Updated root gitignore with .env, __pycache__, .next, .vercel, and other standard entries
- `backend/.gitignore` - Python-specific gitignore: __pycache__, *.pyc, .env, .pytest_cache, *.egg-info, .venv, venv
- `frontend/.gitignore` - Next.js-specific gitignore: node_modules, .next, .env.local, .env*.local, .vercel
- `.github/workflows/keep-warm.yml` - GitHub Actions keep-warm workflow with 4-minute cron and RAILWAY_BACKEND_URL secret reference

## Decisions Made

- Job-level `timeout-minutes: 1` added to prevent Railway health pings from consuming excessive GitHub Actions minutes if the endpoint hangs
- Separated gitignore files per subproject (root + backend + frontend) rather than one monolithic file, per the plan specification

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**External services require manual configuration before the keep-warm workflow activates:**

- **Supabase:** Create project, copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (backend)
- **Railway:** Deploy backend from `/backend` directory; copy the public domain URL
- **Vercel:** Import repo, set root to `/frontend`, add all NEXT_PUBLIC_* env vars
- **GitHub:** Add `RAILWAY_BACKEND_URL` as a repository secret (Settings -> Secrets and variables -> Actions) — required for keep-warm.yml to function

Full user setup details are in the plan frontmatter `user_setup` section.

## Next Phase Readiness

- All scaffolding code is in place — backend, frontend, gitignore, and keep-warm workflow
- Awaiting human verification of local dev environment (Task 2 checkpoint)
- Once user sets up Supabase + Railway + Vercel + GitHub secret, full three-tier deployment will be active
- Phase 2 (database schema) can begin after this verification checkpoint passes

## Self-Check: PASSED

Files verified on disk:
- `.github/workflows/keep-warm.yml` — created, contains `*/4 * * * *` cron schedule
- `backend/.gitignore` — created, contains `__pycache__`
- `frontend/.gitignore` — created, contains `.env.local`
- `.gitignore` — updated, contains `.env`

Commit `90e590a` verified in git log.

---
*Phase: 01-scaffolding*
*Completed: 2026-03-05*
