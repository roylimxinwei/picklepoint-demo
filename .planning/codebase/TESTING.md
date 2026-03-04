# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework

**Runner:**
- Not configured - no test runner installed
- No test dependencies in `package.json`

**Assertion Library:**
- Not installed

**Run Commands:**
- None defined - testing infrastructure absent
- Package.json (lines 6-10) only includes:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```

## Test File Organization

**Location:**
- No test files exist in codebase
- Searched patterns: `*.test.*`, `*.spec.*` - none found in `src/`
- No `__tests__` directory

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Testing Status

**Current State:**
- No automated tests implemented
- Application is a single-file React demo (~1100 lines in `src/App.jsx`)
- All functionality relies on manual testing during development

## Manual Testing Surface

**Key testable areas identified:**

**1. Authentication flows:**
- Spectator: 5-digit code + captcha validation (lines 383-405)
  - Code must be exactly 5 digits (validated with `code.length !== 5`)
  - Captcha solution hardcoded to "7" (line 385)
- Player/Referee/Organizer: Email + password or Google OAuth (lines 410-434)
  - Google button present but non-functional (demo)

**2. State transitions:**
- View navigation via `goTo(v)` (line 269)
- Auth state: `authed`, `checkedIn` flags
- Selected state: `selectedComp`, `selectedCategory`, `focusMatch`
- Example (line 269): Single function resets all auxiliary state on navigation

**3. Data filtering:**
- `PlayerCompList` (lines 439-547): Filter by search, fee type, registration status
  - Lines 445-451 show filter logic
- `OrgDashboard` (lines 1024-1345): Filter by player status and company
  - Lines 1042-1052 show multi-condition filtering
- All filtering uses `.filter()` on constants

**4. Score simulation:**
- Live simulation occurs in `useEffect` (lines 211-241)
- Two scoring modes: "player" and "referee"
- Scores generated randomly - no validation of match win conditions visible
- Point scoring when `Math.random() > 0.92` (line 217)

**5. User interactions:**
- Button clicks trigger state updates
- Form inputs: codes, emails, passwords, text areas
- No form validation beyond basic type checks
- Example: `setCode(e.target.value.replace(/\D/g, "").slice(0, 5))` (line 393)

## Component Integration Points

**Key data flows requiring testing:**

**1. Match lifecycle (`src/App.jsx` root):**
- `scorePoint(mid, t)` - update score for match and team (lines 243-257)
- `undoPoint()` - revert last score (lines 258-263)
- `startNextGame(mid)` - reset game state (lines 264-267)
- Live simulation updates all active matches automatically (lines 213-241)

**2. Navigation:**
- `view` state controls which component renders (lines 301-314)
- `goTo(v)` resets all dependent state (line 269)
- Back buttons call `onBack` prop

**3. Competition selection flow:**
- Player: `PlayerCompList` → select → `selectedComp` → `CheckIn` → `PlayerLive`
- Organizer: `OrgCompList` → select → `selectedComp` → `CategoryList` → select → `OrgDashboard`

**4. Create event flow:**
- `CreateEvent` form (lines 852-942)
- Form data collected as object
- On submit, new event added to `orgComps` state and view returns to organizer

## Areas Without Tests

**High-risk areas:**

1. **Score validation logic:**
   - No validation that match win conditions are met (11 points + 2 lead)
   - Score updates in `scorePoint()` (line 248) don't validate game/match endings
   - Live simulation can reach invalid end states

2. **Data mutation:**
   - No immutability checks
   - State updates use spread operators but could have unintended mutations
   - Undo stack implementation (lines 247, 261-262) has no validation

3. **Filter logic:**
   - Complex filtering in `OrgDashboard` (lines 1042-1052)
   - No test verification that filters correctly exclude items
   - Edge cases: empty results, all filters active, etc.

4. **Event creation:**
   - `CreateEvent` form doesn't validate required fields
   - Event object structure not validated before adding to state
   - No duplicate check or ID collision detection

5. **Live simulation:**
   - Random score generation not seeded
   - Match completion conditions embedded in complex logic (lines 229-235)
   - No way to verify specific match states are reachable

6. **UI state consistency:**
   - Multiple boolean flags (`authed`, `checkedIn`, `showBroadcast`, etc.)
   - No enforcement that these flags are consistent
   - Example: Can `selectedComp` be non-null when `selectedCategory` is also set?

## Recommended Testing Strategy

**If testing were to be implemented:**

1. **Unit tests for pure functions:**
   - `formatTime(ms)` (line 160) - time formatting
   - `teamDisplay(t, short)` (line 161) - team name formatting
   - `generateBracketMatches(teams16)` (lines 136-149) - bracket generation
   - Test input/output with sample data

2. **Integration tests for state flows:**
   - Test complete user flows (login → select comp → check in → view live)
   - Verify state resets on navigation
   - Test undo functionality

3. **Data validation tests:**
   - Score validation: test that games end at 11+ with 2-point lead
   - Filter logic: verify filtering returns correct subsets
   - Event creation: verify new events have required fields

4. **Recommended framework:**
   - Jest + React Testing Library (for component behavior)
   - Or Vitest + React Testing Library (faster alternative to Jest)
   - Both would require updating `package.json` and adding test files

## Testing Gaps Summary

| Component/Feature | Testable | Tests | Coverage |
|---|---|---|---|
| `formatTime()` | Yes | None | 0% |
| `teamDisplay()` | Yes | None | 0% |
| Spectator auth validation | Yes | None | 0% |
| Score simulation | Partial | None | 0% |
| Filter logic | Yes | None | 0% |
| State navigation | Yes | None | 0% |
| Event creation | Yes | None | 0% |
| Match undo/redo | Yes | None | 0% |

---

*Testing analysis: 2026-03-04*
