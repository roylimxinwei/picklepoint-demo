# Codebase Structure

**Analysis Date:** 2026-03-04

## Directory Layout

```
picklepoint-demo/
├── src/
│   ├── main.jsx              # Entry point — React DOM mount
│   └── App.jsx               # Entire application (~1432 lines)
├── public/
│   └── favicon.svg           # Brand icon
├── index.html                # HTML shell with mobile meta tags
├── vite.config.js            # Vite configuration with React plugin
├── package.json              # Dependencies: react, react-dom only
├── package-lock.json         # Locked versions
└── README.md                 # Project documentation
```

## Directory Purposes

**src/:**
- Purpose: Source code directory
- Contains: All JavaScript/JSX application code and styles
- Key files: `main.jsx` (10 lines), `App.jsx` (1432 lines)

**public/:**
- Purpose: Static assets served as-is
- Contains: favicon.svg

**Root:**
- Purpose: Project configuration and documentation
- Key files: `index.html`, `vite.config.js`, `package.json`

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell that mounts React at `<div id="root">`, loads fonts from Google Fonts CDN (DM Sans, Outfit, JetBrains Mono), defines viewport and meta tags for mobile
- `src/main.jsx`: ReactDOM.createRoot, renders `<App />` in StrictMode
- `src/App.jsx`: Default export `PicklePoint` component — entire application

**Configuration:**
- `vite.config.js`: Vite + React plugin setup
- `package.json`: Scripts (dev, build, preview), dependencies (react@18, react-dom@18, @vitejs/plugin-react@4, vite@5)

**Core Logic:**
- `src/App.jsx` (all 1432 lines):
  - Lines 1-12: COLORS constant (role-specific color palettes)
  - Lines 14-159: Data constants (TEAMS, COMPETITIONS, REFEREES, COURTS, ELIMINATION_TEAMS, POOL_GROUPS, MDA_PLAYERS, REGISTERED_PLAYERS, etc.)
  - Lines 160-185: Utility functions and shared components (`formatTime`, `teamDisplay`, `TopBar`, `LiveDot`, `Badge`, `Chip`)
  - Lines 190-333: Root `PicklePoint` component with state and render logic
  - Lines 339-1432: Feature-specific components (Landing, SpectatorAuth, SpectatorLive, AuthScreen, PlayerCompList, CheckIn, PlayerLive, RefereeFlow, CreateEvent, OrgCompList, CategoryList, OrgDashboard)

**Testing:**
- No test files present

## Naming Conventions

**Files:**
- `.jsx` extension for all React components
- PascalCase for component files: `App.jsx`, `main.jsx`
- lowercase for config files: `vite.config.js`, `package.json`

**Components:**
- PascalCase for all React components: `PicklePoint`, `Landing`, `SpectatorAuth`, `PlayerCompList`, etc.
- Pattern: Role-specific components prefixed with role (`Spectator*`, `Player*`, `Referee*`, `Org*`)
- Shared components: `TopBar`, `LiveDot`, `Badge`, `Chip`

**Functions:**
- camelCase for utility functions: `formatTime()`, `teamDisplay()`, `generateBracketMatches()`
- camelCase for event handlers: `scorePoint()`, `undoPoint()`, `startNextGame()`, `goTo()`, `handleGoLive()`, `executeGoLive()`, etc.
- camelCase for state setters: `setView`, `setMatches`, `setFocusMatch`, etc.

**Variables:**
- camelCase for all variables: `matches`, `focusMatch`, `selectedComp`, `authed`, `checkedIn`
- UPPERCASE for constants: `COLORS`, `TEAMS`, `COMPETITIONS`, `REFEREES`, `COURTS`, `EVENT_CATEGORIES`, `ELIMINATION_TEAMS`, `POOL_GROUPS`
- Abbreviations in mocks: `MDA_PLAYERS` (Mixed Doubles A), `MDA_PLAYER_NAMES`, `MDA_COMPANIES`, `REG_PHASE_PLAYERS`

**Types/Objects:**
- Role colors: COLORS.spectator, COLORS.player, COLORS.referee, COLORS.organizer
- Each with: primary, accent, bg, border, gradient
- Match statuses: "active", "completed", "match_end", "game_end", "upcoming", "scheduled"
- View names: "landing", "spectator", "player", "referee", "organizer", "org_create_event"

**CSS Classes:**
- Responsive utility classes defined in `<style>` tag: `.pp-landing-title`, `.pp-score-big`, `.pp-score-focus`, `.pp-court-grid`, `.pp-org-court-grid`, `.pp-main-wrap`
- Used for media query breakpoints (mobile, tablet, desktop)

## Where to Add New Code

**New Feature (e.g., new role flow):**
- Primary code: Add component function to `src/App.jsx` after existing components (after line ~1200)
- Add to view routing: Update root `PicklePoint` conditional renders (around line ~301-314)
- Add to role selection: Update `Landing` roles array (line ~340-344)
- Add color palette: Add entry to COLORS constant if needed (line ~7-12)

**New Component/Module (shared UI):**
- Implementation: Add to shared components section at lines ~163-185 in `src/App.jsx`
- Pattern: Export as function component with inline JSX and styles
- Usage: Pass as child or prop to feature components

**New Data/Constant:**
- Add to appropriate section at top of App.jsx (lines ~3-159)
- Group by category: COLORS, TEAMS, COMPETITIONS, PLAYERS, REFEREES, etc.
- Follow naming pattern: PascalCase constants with _ separators

**Utilities:**
- Shared helpers: Add to utility section (lines ~160-185)
- Pattern: Pure functions taking parameters, returning values/components
- Example: `formatTime(ms)`, `teamDisplay(team, short)`, `generateBracketMatches(teams)`

**Styling:**
- Inline objects: Define in component JSX, use COLORS and consistent values
- Responsive: Add media query rules to `<style>` tag (lines ~274-299)
- Colors: Reference COLORS constant (e.g., `COLORS.player.primary`) for consistency
- Spacing: 8px base unit (padding: 16 = 2×8, 24 = 3×8)

## Special Directories

**public/:**
- Purpose: Static assets
- Generated: No
- Committed: Yes

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Production build output
- Generated: Yes (by npm run build)
- Committed: No (in .gitignore)

**.planning/codebase/:**
- Purpose: GSD documentation
- Generated: No (manually by mapper agents)
- Committed: Yes

## Component File Organization

Since all components live in `src/App.jsx`, organization follows this order:

1. **Imports** (lines 1): React, hooks
2. **Constants & Data** (lines 3-159):
   - COLORS object
   - Mock data (TEAMS, COMPETITIONS, PLAYERS, REFEREES, etc.)
3. **Utilities & Shared Components** (lines 160-185):
   - Helper functions
   - Reusable UI components
4. **Root Component** (lines 190-333):
   - PicklePoint with all state
   - Live simulation logic
   - Conditional rendering
5. **Feature Components** (lines 339-1432):
   - Grouped by flow (Landing, Spectator, Player, Referee, Organizer)
   - Each feature set has auth, list, detail screens

## Import Paths

- No import aliases — single-file application
- Google Fonts loaded via CDN in index.html (DM Sans, Outfit, JetBrains Mono)
- No internal imports — all components in one file

## How to Navigate to Features

**Spectator Flow:** Lines ~383-649 (Auth, Live scores, Match focus)
**Player Flow:** Lines ~439-791 (Competition list, Check-in, Live view)
**Referee Flow:** Lines ~796-845 (Point-by-point scoring)
**Organizer Flow:** Lines ~850-1432 (Event creation, Dashboard, Bracket/pool management)

## Responsive Layout Breakpoints

**Mobile (default):**
- Single column grid for court cards
- Large touch targets (16px padding min)
- Font sizes: 15-19px body, 20-25px headings

**Tablet (min-width: 768px):**
- Multi-column auto-fill grid (minmax 260-300px)

**Desktop (min-width: 1024px):**
- 3-column fixed grid
- max-width wrapper (960px)

**Large Desktop (min-width: 1280px):**
- max-width: 1100px

---

*Structure analysis: 2026-03-04*
