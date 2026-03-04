# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Single-file monolithic React application with view-based state management and hardcoded mock data.

**Key Characteristics:**
- All components, data, and styling coexist in `src/App.jsx` (~1432 lines)
- View navigation controlled via string-based state (`useState("landing")`)
- No client-side routing library — manual view switching
- No API layer — mock data constants at file head
- Live simulation via `setInterval` for demo purposes
- Inline styles throughout — no CSS files or UI library dependencies

## Layers

**Presentation Layer:**
- Purpose: Render UI components for each role and view
- Location: `src/App.jsx` (lines ~340-1432 component definitions)
- Contains: Functional React components with inline JSX
- Depends on: React, useState, useEffect, useCallback hooks, inline style objects
- Used by: Root `PicklePoint` component conditionally renders

**State Management Layer:**
- Purpose: Hold application state (view, auth, matches, selections, form data)
- Location: `src/App.jsx` (lines ~190-269 root component state declarations)
- Contains: `useState` hooks for view, matches, authentication flags, selections, undo stack
- Depends on: React hooks
- Used by: All child components receive state via props and callbacks

**Data Layer:**
- Purpose: Define constants for tournaments, players, teams, referees, competitions
- Location: `src/App.jsx` (lines ~3-159 constants section)
- Contains: COLORS, TEAMS, COMPETITIONS, ORG_COMPETITIONS, DISCOVER_COMPETITIONS, MDA_PLAYERS, REGISTERED_PLAYERS, REG_PHASE_PLAYERS, REFEREES, COURTS, ELIMINATION_TEAMS, POOL_GROUPS, initialMatches
- Depends on: Static JavaScript objects and arrays
- Used by: All feature flows

**Utility/Helper Layer:**
- Purpose: Format data and perform calculations
- Location: `src/App.jsx` (lines ~160-185 utility functions and shared components)
- Contains: `formatTime()`, `teamDisplay()`, shared UI components: `TopBar`, `LiveDot`, `Badge`, `Chip`
- Depends on: Inline style objects, basic JavaScript
- Used by: All components

## Data Flow

**View Navigation Flow:**

1. User lands on `Landing` component
2. Selects role (spectator/player/referee/organizer)
3. `goTo(roleName)` called → updates `view` state
4. Root `PicklePoint` conditionally renders role-specific flow
5. Each flow has authentication, feature screens, and back navigation

**Match Scoring Flow (Referee):**

1. Referee views `RefereeFlow` component with current match from `matches` state
2. Clicks team button to score a point
3. `scorePoint(matchId, team)` called with match ID and team ("a" or "b")
4. Updates match's `currentGame` score, checks win conditions
5. If game won: pushes to `games` array, resets `currentGame`, increments `gameNum`
6. If match won: sets match `status` to "match_end"
7. `scoreFlash` state triggers visual feedback via CSS transform
8. Undo stack captures previous score via `undoPoint` callback

**Live Simulation Flow:**

1. When `view !== "landing"`, `useEffect` starts `setInterval` (2500-4000ms)
2. For matches with `scoredBy: "player"`: randomly completes games/matches
3. For matches with `scoredBy: "referee"`: randomly increments current game score
4. Updates propagate to `SpectatorLive` and `OrgDashboard` via shared `matches` state

**State Management:**

- View state: Controls which screen/flow renders (`landing`, `spectator`, `player`, `referee`, `organizer`, `org_create_event`)
- Auth state: `authed` boolean per role flow
- Selection state: `selectedComp` (competition), `selectedCategory`, `focusMatch`
- Match state: `matches` array with full game/score history, `focusMatch` ID for detail view
- Form state: Temporary states for login, check-in, event creation
- Undo state: `undoStack` array for reverting referee scoring

## Key Abstractions

**Role-Based Flows:**
- Purpose: Encapsulate feature flows for each user role
- Examples: `Landing`, `SpectatorAuth`/`SpectatorLive`, `AuthScreen`, `PlayerCompList`/`CheckIn`/`PlayerLive`, `RefereeFlow`, `CreateEvent`/`OrgCompList`/`CategoryList`/`OrgDashboard`
- Pattern: Functional components receiving state/callbacks as props, managing local UI state via `useState`

**Match Object:**
- Purpose: Represents a tournament match with full scoring state
- Structure:
  ```javascript
  {
    id: number,
    court: number,
    teamA: { id, names[] },
    teamB: { id, names[] },
    division: string,
    round: string,
    games: [{ a: number, b: number }],
    currentGame: { a: number, b: number },
    gameNum: number,
    matchScore: { a: number, b: number },
    status: "active" | "completed" | "match_end" | "game_end",
    scoredBy: "referee" | "player",
    startedAt: timestamp
  }
  ```
- Used by: Scoring flows, live score displays, organizer dashboards

**Chip & Badge Components:**
- Purpose: Reusable UI buttons and labels with role-based coloring
- Pattern: Pure function components returning styled buttons/spans
- Used by: Competition lists, player filters, category selections

## Entry Points

**Root Component `PicklePoint`:**
- Location: `src/App.jsx` lines ~190-333
- Triggers: App initialization via React DOM in `src/main.jsx`
- Responsibilities:
  - Holds all root state (view, matches, auth, selections)
  - Manages live simulation interval
  - Conditionally renders role flows based on view state
  - Provides scoring callbacks to referee flow

**Landing Component:**
- Location: `src/App.jsx` lines ~339-377
- Triggers: Initial page load, back button from any role flow
- Responsibilities: Display role selection buttons, call `onSelect(roleKey)` to navigate

**Main Feature Flows:**
- `SpectatorAuth` (line ~383): 5-digit code + captcha validation
- `PlayerCompList` (line ~439): Browse registered and discoverable competitions
- `RefereeFlow` (line ~796): Point-by-point match scoring with live timer
- `OrgCompList` (line ~950): View/create/manage competitions
- `OrgDashboard` (line ~1024): Category/court/player/bracket management with live stats

## Error Handling

**Strategy:** Minimal error handling — demo focus assumes valid data and user actions.

**Patterns:**
- Form validation: Check field values before submission (`if (!name || !date || !venue)`)
- Auth validation: Check code length and captcha answer, show error message
- No try-catch blocks — no API calls or async errors
- Invalid match IDs silently return early (`if (m.id !== mid) return m`)

## Cross-Cutting Concerns

**Logging:** None implemented — no console logging or analytics

**Validation:**
- Form inputs validated before state updates
- Numeric inputs constrained (5-digit code for spectator)
- Category selections enforced before event creation

**Authentication:**
- Mock auth: Email/password login and Google button both trigger `onAuth()` callback
- No token generation or session management
- No persistence — auth state lost on page reload

**Styling:**
- No CSS files — all styles via inline objects
- Responsive breakpoints via CSS media queries in `<style>` tag (lines 274-299)
- Role-specific colors defined in COLORS constant (lines 7-12)
- Animations defined as CSS keyframes: pulse, fadeIn, slideUp, scanLine

## Component Hierarchy

```
PicklePoint (root, state holder)
├── Landing
├── SpectatorAuth
├── SpectatorLive
│   └── MatchFocus
├── AuthScreen (shared login for player/referee/org)
├── PlayerCompList
├── CheckIn
├── PlayerLive (similar to SpectatorLive)
├── RefereeFlow
├── CreateEvent
├── OrgCompList
├── CategoryList
└── OrgDashboard
    ├── Courts view
    ├── Elimination bracket view
    ├── Bracket knockout view
    ├── Match queue view
    ├── Players view (with filters)
    └── Alerts/broadcast view
```

## Notable Design Decisions

**Why monolithic single file:**
- Demo simplicity — easier to understand full feature set in one read
- No build complexity — single JSX file works with Vite

**Why string-based views:**
- Simple state machine — each view is a string token
- No routing library needed — reduces dependencies (only React + React DOM)
- Deterministic transitions — easy to trace view changes

**Why inline styles:**
- No build step for CSS needed
- Role colors applied consistently throughout
- Mobile-first responsive design via media queries

**Why mock data as constants:**
- No API setup required for demo
- Live simulation shows dynamic updating without backend
- Easy to customize for different tournament types

---

*Architecture analysis: 2026-03-04*
