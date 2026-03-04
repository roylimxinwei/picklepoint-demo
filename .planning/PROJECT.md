# PicklePoint

## What This Is

A real-time pickleball tournament management platform that enables organizers to run live events, referees to score matches point-by-point, players to check in and follow their matches, and spectators to watch live scores via event codes. Built as a full-stack application replacing an existing hardcoded React demo.

## Core Value

Referees can reliably score matches in real-time and everyone — organizers, players, spectators — sees accurate live results instantly.

## Requirements

### Validated

- ✓ UI design and user flows for all 4 roles (Spectator, Player, Referee, Organizer) — existing demo
- ✓ Point-by-point scoring interface with undo capability — existing demo
- ✓ Role-based color system and responsive mobile-first design — existing demo
- ✓ Event creation form with categories, venue, date — existing demo
- ✓ Organizer dashboard with courts, brackets, players, match queue — existing demo

### Active

- [ ] Real backend with persistent data (Supabase + FastAPI)
- [ ] Supabase Auth for player, referee, and organizer login
- [ ] Spectator access via 5-digit event codes (no account needed)
- [ ] Server-authoritative match scoring (FastAPI validates every point)
- [ ] Real-time score updates via Supabase Realtime
- [ ] Event creation and management (categories, courts, formats)
- [ ] Court assignment and status tracking
- [ ] Elimination brackets and pool play groups
- [ ] Player registration and check-in per event
- [ ] Referee match assignment and scoring flow
- [ ] Organizer dashboard with live match monitoring

### Out of Scope

- Mobile native apps — web-first, mobile responsive
- Payment processing — free events only for v1
- Chat or messaging between users
- Video streaming or replays
- Advanced analytics or statistics dashboards
- Multi-tournament seasons or leagues
- Email notifications beyond auth flows

## Context

**Existing demo:** A polished single-file React demo (`src/App.jsx`, ~1430 lines) with all UI flows implemented using hardcoded mock data. This serves as the design specification and UX reference for the full application.

**Target use case:** Running real pickleball tournaments — this needs to be reliable enough for live event use. The referee scoring flow is the most critical path.

**Tech stack decision:** Next.js (frontend) + FastAPI (backend) + Supabase (database, auth, realtime). This is a new project repo; the demo repo is kept as reference.

**Deployment:** Next.js on Vercel, FastAPI on Railway, Supabase Cloud.

**Architecture decisions from demo:**
- 4 user roles: Spectator, Player, Referee, Organizer
- Match model: best-of-3 games with point-by-point tracking
- Scoring: server-authoritative (FastAPI validates every point, prevents cheating)
- Real-time: Supabase Realtime (WebSocket-based, cost-effective at scale)
- Spectator access: 5-digit event code, no account required

## Constraints

- **Tech stack**: Next.js + FastAPI + Supabase — decided by user
- **Deployment**: Vercel (frontend) + Railway (backend) + Supabase Cloud
- **Auth**: Supabase Auth — email/password + optional OAuth
- **No TypeScript**: Following demo convention (JavaScript/JSX only)
- **Reliability**: Must be stable enough for live tournament use — no data loss on scoring

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase Realtime over polling | Lower cost at scale, included in Supabase tier, fewer DB queries | — Pending |
| Server-authoritative scoring | Prevents cheating, single source of truth for match state | — Pending |
| New repo (not in-place migration) | Clean architecture, demo stays as reference | — Pending |
| Supabase Auth over custom JWT | Integrated with Supabase, less code to maintain | — Pending |
| Spectator code access (no account) | Lower friction for spectators, matches demo UX | — Pending |

---
*Last updated: 2026-03-04 after initialization*
