# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- `.jsx` extension for React components
- Consistent camelCase for file names
- Example: `App.jsx`, `main.jsx`

**Functions:**
- camelCase for all functions and component names
- Examples: `formatTime`, `teamDisplay`, `TopBar`, `PlayerLive`, `OrgDashboard`
- Event handlers use `camelCase` with `on` prefix (e.g., `onBack`, `onAuth`, `onSelect`)
- Generic utility functions at module level: `generateBracketMatches`, `formatTime`, `teamDisplay`

**Variables:**
- camelCase for all variables and constants
- State variables use `useState` with destructured pairs: `const [view, setView] = useState("landing")`
- Examples: `focusMatch`, `scoreFlash`, `undoStack`, `authed`, `selectedComp`
- Shorthand variables in loops: `i`, `m`, `t`, `p`, `co`, `c` used for map/forEach iterations

**Types:**
- No TypeScript used - plain JavaScript/JSX
- Object constants use UPPERCASE_SNAKE_CASE: `COLORS`, `TEAMS`, `COMPETITIONS`, `REFEREES`, `COURTS`
- Color objects nested under role keys: `COLORS.spectator`, `COLORS.player`, `COLORS.referee`, `COLORS.organizer`

## Code Style

**Formatting:**
- No external formatter configured (Prettier not installed)
- Inline styles preferred over CSS - every style is an inline object passed to the `style` prop
- Two-space indentation observed in JSX structure
- Semicolons used consistently throughout

**Linting:**
- No linter configured (ESLint not installed)
- No strict style enforcement beyond what's visible in existing code

## Import Organization

**Order:**
1. React imports (React, hooks)
2. Local imports

**Examples from `src/App.jsx`:**
```javascript
import { useState, useEffect, useCallback } from "react";
```

**Path Aliases:**
- Not used - relative imports only

## Error Handling

**Patterns:**
- Simple validation with early returns: `if (code.length !== 5) { setError("Enter a 5-digit code"); return; }`
- Conditional rendering for error states: `{error && <div style={{...}}>{error}</div>}`
- No try-catch blocks observed in application code
- No error boundaries implemented
- Alert-based confirmations for non-critical flows: `onClick={() => alert(...)}`

## Logging

**Framework:** console (no dedicated logging library)

**Patterns:**
- No console logging observed in production code
- No debug statements visible in the codebase
- All data flow is implicit through state updates and side effects

## Comments

**When to Comment:**
- Minimal commenting observed
- Section headers use visual separators: `// ══════════════════════════════════════`
- Purpose of sections clear from function names and structure
- No inline comments for complex logic
- Some intentional comments (commented-out code): Lines 350, 352-353, 374

**JSDoc/TSDoc:**
- Not used - no TypeScript, minimal documentation
- Commented-out lines suggest removed features rather than formal documentation

## Function Design

**Size:**
- Single-file architecture - all functions in one file `src/App.jsx`
- Functions range from 10 lines (utility functions) to 300+ lines (complex components like `OrgDashboard`)
- Average component function is 50-150 lines

**Parameters:**
- Props destructured in function parameters: `function TopBar({ onBack, title, right, borderColor = "rgba(255,255,255,0.06)" })`
- Callbacks passed as props named with `on` prefix
- Default values provided for optional parameters: `teamDisplay(t, short = false)`

**Return Values:**
- Components always return JSX or conditional JSX
- Utility functions return primitives (strings, arrays, objects, numbers)
- Early returns used for guard clauses: `if (!m) { setFocusMatch(null); return null; }`

## Module Design

**Exports:**
- Single default export: `export default function PicklePoint()`
- All components defined in same file, no named exports
- Constants defined at module level before components

**Barrel Files:**
- Not applicable - single file architecture

## Component Structure

**All components are function components:**
- Root component: `PicklePoint()` - manages global view state
- Page/Screen components: `Landing()`, `SpectatorAuth()`, `AuthScreen()`, `PlayerCompList()`, etc.
- Reusable UI components: `TopBar()`, `Badge()`, `Chip()`, `LiveDot()`

**State Management:**
- Plain `useState()` hooks only - no context, Redux, or Zustand
- Root component manages view navigation and match data
- Child components manage form state and UI state locally
- Props passed down to control behavior: `function SpectatorLive({ matches, focusMatch, setFocusMatch, onBack })`

**Example pattern from `src/App.jsx` lines 191-210:**
```javascript
const [view, setView] = useState("landing");
const [matches, setMatches] = useState(initialMatches);
const [focusMatch, setFocusMatch] = useState(null);
// ... more state

const goTo = (v) => {
  setView(v);
  setAuthed(false);
  setCheckedIn(false);
  setSelectedComp(null);
  setSelectedCategory(null);
  setFocusMatch(null);
};
```

## Styling Conventions

**Inline styles only:**
- Every styled element uses the `style={}` prop with inline objects
- No CSS files exist in the project
- No class names except responsive utility classes in `<style>` tag
- Colors come from `COLORS` constant object

**Color system:**
- Four role-based color palettes in `COLORS` constant (lines 7-12)
- Each role has: `primary`, `accent`, `bg`, `border`, `gradient`
- Example: `COLORS.player.primary = "#EF4444"`

**Typography:**
- Font families: Outfit (headings), DM Sans (body), JetBrains Mono (labels/data)
- Imported from Google Fonts in App root (line 273)
- Font sizes: body 15-16px, labels 13-14px, buttons 17-19px, headings 19-25px

**Animations:**
- CSS animations defined in `<style>` tag (lines 274-278): `pulse`, `fadeIn`, `slideUp`, `scanLine`
- Applied via inline `animation` property
- Common animations: staggered fade-in with `animation: \`fadeIn 0.3s ease ${i * 0.05}s both\``

**Responsive design:**
- Media queries in `<style>` tag with utility classes
- Classes like `pp-landing-title`, `pp-score-big`, `pp-court-grid`, `pp-org-court-grid`
- Mobile-first breakpoints at 380px, 768px, 1024px, 1280px

## Event Handling

**Pattern:**
- Callback props named with `on` prefix: `onBack`, `onAuth`, `onSelect`, `onCheckIn`
- Event handlers inline: `onClick={() => doSomething()}`
- Use `useCallback()` for complex event handlers to maintain referential equality
- Examples from `src/App.jsx`:
  - Line 243: `const scorePoint = useCallback((mid, t) => { ... }, []);`
  - Line 258: `const undoPoint = useCallback(() => { ... }, [undoStack]);`

## Data Flow

**Mock data constants:**
- All data defined as module-level constants at top of `src/App.jsx`
- Examples: `TEAMS`, `COMPETITIONS`, `ORG_COMPETITIONS`, `REGISTERED_PLAYERS`, `REFEREES`
- No API calls - demo uses hardcoded data

**Live simulation:**
- `useEffect` hook (lines 211-241) runs `setInterval` to simulate live score updates
- Updates happen every 2500-4000ms with random point scoring
- Only active when `view !== "landing"`

**State updates:**
- Pure functions with spread operators for immutability
- Example (line 214): `setMatches(prev => prev.map(m => { ... }))`
- Maintain immutability principle in all state updates

---

*Convention analysis: 2026-03-04*
