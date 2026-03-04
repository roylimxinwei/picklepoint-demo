# Requirements: PicklePoint

**Defined:** 2026-03-04
**Core Value:** Referees can reliably score matches in real-time and everyone sees accurate live results instantly.

## v1 Requirements

### Authentication & Access

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in with Google OAuth
- [ ] **AUTH-03**: User has a single account with per-event role capabilities (organizer, referee, player in different events)
- [ ] **AUTH-04**: Any authenticated user can create an event (becoming its organizer)
- [ ] **AUTH-05**: Spectator can access live scores via 5-digit event code without an account
- [ ] **AUTH-06**: User session persists across browser refresh

### Event Management

- [ ] **EVNT-01**: Organizer can create event with name, date, venue
- [ ] **EVNT-02**: Organizer can manage event lifecycle (draft → registration → live → completed)
- [ ] **EVNT-03**: Organizer can create categories per event (singles, doubles, mixed, age groups)
- [ ] **EVNT-04**: Organizer can add and manage courts for an event

### Player Management

- [ ] **PLYR-01**: Player can register for an event/category
- [ ] **PLYR-02**: Player can check in at an event
- [ ] **PLYR-03**: Organizer can view player roster with filters
- [ ] **PLYR-04**: Player receives WhatsApp notification when their match is starting soon

### Referee Scoring

- [ ] **SCOR-01**: Organizer can assign a referee to a match
- [ ] **SCOR-02**: Referee can score points for either team in an assigned match
- [ ] **SCOR-03**: Server validates every point and enforces game rules (11pts, 2-pt lead, best of 3)
- [ ] **SCOR-04**: Referee can undo last point with full audit trail (event-sourced)
- [ ] **SCOR-05**: Referee screen shows elapsed match timer
- [ ] **SCOR-06**: Referee screen shows match-point/game-point indicator

### Real-Time & Live Views

- [ ] **LIVE-01**: Spectators see live score updates via Supabase Realtime
- [ ] **LIVE-02**: Organizer dashboard shows court status grid with live scores
- [ ] **LIVE-03**: Users can view match detail with game-by-game breakdown

### Tournament Structure

- [ ] **TRNT-01**: Organizer can create pool play groups
- [ ] **TRNT-02**: Pool standings auto-calculate from match results
- [ ] **TRNT-03**: Organizer can create single elimination brackets
- [ ] **TRNT-04**: Bracket auto-advances winners when match completes (server-side)
- [ ] **TRNT-05**: Organizer can assign matches to courts

### Organizer Dashboard

- [ ] **DASH-01**: Organizer can view court status overview with live data
- [ ] **DASH-02**: Organizer can manage match queue
- [ ] **DASH-03**: Organizer can view and filter player list

## v2 Requirements

### Seeding & Positioning

- **SEED-01**: Seeding of players directly into brackets based on ranking
- **RULE-01**: Pickleball-specific stacking rules and player position management

### Analytics & History

- **STAT-01**: Win/loss records and point differentials per player
- **STAT-02**: Tournament history and results archive

### Advanced Tournament Formats

- **BRAK-01**: Double elimination brackets
- **BRAK-02**: Round-robin to bracket automatic transition

### Notifications

- **NOTF-01**: In-app notification center

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment processing | Track status externally (Venmo, cash) for v1 |
| Video streaming / replays | High infrastructure cost, not core to tournament management |
| Chat / messaging | Organizers use existing channels (WhatsApp, text) |
| Skill ratings / rankings | Requires historical data across multiple events |
| Seasons / leagues | v1 is single-event focused |
| Email notifications | WhatsApp + in-app sufficient for live events |
| Mobile native app | Web-first with responsive design |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| AUTH-05 | Phase 3 | Pending |
| AUTH-06 | Phase 3 | Pending |
| EVNT-01 | Phase 4 | Pending |
| EVNT-02 | Phase 4 | Pending |
| EVNT-03 | Phase 4 | Pending |
| EVNT-04 | Phase 4 | Pending |
| PLYR-01 | Phase 4 | Pending |
| PLYR-02 | Phase 4 | Pending |
| PLYR-03 | Phase 4 | Pending |
| PLYR-04 | Phase 4 | Pending |
| SCOR-01 | Phase 5 | Pending |
| SCOR-02 | Phase 5 | Pending |
| SCOR-03 | Phase 5 | Pending |
| SCOR-04 | Phase 5 | Pending |
| SCOR-05 | Phase 5 | Pending |
| SCOR-06 | Phase 5 | Pending |
| LIVE-01 | Phase 6 | Pending |
| LIVE-02 | Phase 6 | Pending |
| LIVE-03 | Phase 6 | Pending |
| TRNT-01 | Phase 8 | Pending |
| TRNT-02 | Phase 8 | Pending |
| TRNT-03 | Phase 8 | Pending |
| TRNT-04 | Phase 8 | Pending |
| TRNT-05 | Phase 8 | Pending |
| DASH-01 | Phase 7 | Pending |
| DASH-02 | Phase 7 | Pending |
| DASH-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after roadmap creation — all 31 requirements mapped*
