# Features Research

**Domain:** Pickleball tournament management platforms
**Researched:** 2026-03-04

## Table Stakes (Must-Have)

Features users expect from any tournament management platform. Missing these = users leave.

### Authentication & Access
- **Email/password login** for organizers, referees, players — Complexity: Low
- **Role-based access** (organizer, referee, player, spectator) — Complexity: Medium
- **Spectator event code access** (no account needed) — Complexity: Low
- Dependencies: Supabase Auth must be configured first

### Event Lifecycle
- **Event creation** with name, date, venue, categories — Complexity: Low
- **Event states**: draft → registration → live → completed — Complexity: Medium
- **Category management**: singles, doubles, mixed, age groups — Complexity: Medium
- Dependencies: Database schema must support event state machine

### Player Management
- **Player registration** for events — Complexity: Low
- **Check-in** at event (confirm attendance) — Complexity: Low
- **Player roster** visible to organizer — Complexity: Low
- Dependencies: Auth must exist, event must exist

### Referee Scoring (Critical Path)
- **Point-by-point scoring** with server validation — Complexity: HIGH
- **Undo last point** with audit trail — Complexity: Medium
- **Game/match win detection** (11 points, 2-point lead, best of 3) — Complexity: Medium
- **Match assignment** (referee sees their assigned matches) — Complexity: Low
- Dependencies: Scoring state machine is the hardest single component. Must be rock-solid.

### Real-Time Scores
- **Live score broadcast** to spectators and organizer dashboard — Complexity: Medium
- **Court status grid** showing all active matches — Complexity: Medium
- **Match detail view** with game-by-game breakdown — Complexity: Low
- Dependencies: Supabase Realtime, scoring API must be working

### Tournament Structure
- **Pool play groups** with standings — Complexity: Medium
- **Single elimination brackets** — Complexity: Medium
- **Bracket auto-advancement** when match completes — Complexity: HIGH (race condition risk)
- **Court assignment** for matches — Complexity: Low
- Dependencies: Scoring and match completion must trigger advancement server-side

### Organizer Dashboard
- **Court status overview** — Complexity: Low
- **Player list with filters** — Complexity: Low
- **Match queue management** — Complexity: Medium
- Dependencies: All other features feed into the dashboard

## Differentiators (Competitive Advantage)

Features that set PicklePoint apart from competitors like PickleballBrackets, Pickleball Tournament Pro.

- **Dual scoring modes** in same event: referee point-by-point vs player game-score submission — Complexity: Medium
- **No-account spectator access** via 5-digit code (most competitors require login) — Complexity: Low
- **Pool play → single elimination** in one integrated platform — Complexity: Medium
- **Elapsed match timer** on referee screen — Complexity: Low
- **Match-point indicator** (visual alert when game/match point is live) — Complexity: Low
- **Real-time organizer court grid** with live scores across all courts — Complexity: Medium

## Anti-Features (Deliberately NOT Building)

| Feature | Why Not |
|---------|---------|
| Payment processing | Track payment status only — handle payments externally (Venmo, cash). Avoid PCI compliance burden for v1 |
| Email notifications | In-app broadcast sufficient for live events. Email adds complexity with minimal benefit during tournaments |
| Video streaming / replays | Massive infrastructure cost, not core to tournament management |
| Chat / messaging | Out of scope — organizers communicate via existing channels (WhatsApp, text) |
| Skill ratings / rankings | Requires historical data across events. Defer to v2+ |
| Seasons / leagues | v1 is single-event focused |
| Double elimination | Single elimination only for v1. Double elimination is significantly more complex |
| Advanced statistics | Win/loss records, point differentials — defer to v2 |

## Complexity Notes

**Hardest components (by implementation effort):**

1. **Scoring state machine** — Must handle all edge cases: game point, match point, deuce (10-10+), game completion, match completion, undo across game boundaries. Server-authoritative means FastAPI owns all this logic.

2. **Bracket auto-advancement** — When a match completes, the winner must be placed in the next bracket slot. Race condition if two matches in the same bracket round finish simultaneously. Must be atomic and server-triggered.

3. **Real-time reconnection** — Supabase Realtime WebSocket can disconnect (phone locked, bad Wi-Fi). Must handle reconnection + full state sync, not just resume the delta stream.

## Feature Dependencies

```
Auth ──┬── Event Creation ──┬── Player Registration ── Check-in
       │                    │
       │                    ├── Court Management
       │                    │
       │                    └── Match Creation ── Referee Assignment
       │                                              │
       │                         Scoring Engine ◄─────┘
       │                              │
       ├── Supabase Realtime ◄────────┘
       │        │
       │        ├── Spectator Live View
       │        └── Organizer Dashboard
       │
       └── Bracket Management ◄── Match Completion (from Scoring)
```

---

*Features research: 2026-03-04*
