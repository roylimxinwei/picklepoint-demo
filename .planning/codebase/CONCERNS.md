# Codebase Concerns

**Analysis Date:** 2026-03-04

## Architecture & Maintainability

**Monolithic Single-File Design:**
- Issue: Entire application lives in `src/App.jsx` (~1430 lines, 115KB). All components, state management, constants, and styling are co-located in one file
- Files: `src/App.jsx`
- Impact: Extremely difficult to maintain, navigate, debug, or test. No code reuse across components. Adding features requires modifying a massive file. IDE performance may degrade with file this size
- Fix approach: Refactor into modular component files: `src/components/` for reusable UI components, `src/views/` for page-level components, `src/constants/` for colors/data, `src/styles/` for shared styles. This is a significant undertaking but necessary for future scalability

**No Component Separation:**
- Issue: 20+ components (Landing, SpectatorAuth, PlayerCompList, RefereeFlow, OrgDashboard, etc.) all defined in single file with zero abstraction
- Files: `src/App.jsx` (lines 339-1432)
- Impact: Code duplication patterns (e.g., repeated styling, form patterns). Prop drilling through root component. Impossible to test individual components
- Fix approach: Create separate file per component following React conventions. Extract shared UI patterns into reusable components (button styles, form inputs, modals)

**Root Component Oversized:**
- Issue: `PicklePoint()` root component handles all state (view, matches, scores, auth, forms, modals) + routing logic + all child renders. Contains useEffect with complex state mutations
- Files: `src/App.jsx` (lines 190-334)
- Impact: Changes to any feature require understanding entire state management logic. Hard to add new views without affecting existing state
- Fix approach: Extract view-specific state management into custom hooks (e.g., `useRefereeFlow`, `useOrgDashboard`). Separate routing logic from component logic

## State Management & Data Flow

**Missing Dependency in useEffect:**
- Issue: Line 211-241: `useEffect` has dependency array `[view]` but callback uses `Math.random()` and sets interval every view change. The interval's random score generation is indeterminate—sometimes runs mid-match
- Files: `src/App.jsx` (line 211-241)
- Impact: Live score simulation may skip updates or update inconsistently when switching views. User perception of broken real-time updates
- Fix approach: Clarify intent: is this a demo sim that should be consistent? If so, seed the randomness. If not, document that intervals fire on view changes

**No Undo Stack Cleanup:**
- Issue: Line 247: `undoStack` grows unbounded. Every scored point is added to undo stack but never cleared except manually when `startNextGame` is called (line 266)
- Files: `src/App.jsx` (lines 195, 247, 266)
- Impact: Long tournaments may accumulate very large undo arrays in memory. No safeguard against stack overflow
- Fix approach: Limit undo stack to last N actions (e.g., 50). Automatically clear on match completion or add memory management

**Mutations & Missing Validation:**
- Issue: Score validation exists in PlayerLive (lines 725-727) but not in RefereeFlow (line 796). Referee can manually set any score without validation. Game scores can go to invalid states
- Files: `src/App.jsx` (lines 796-844)
- Impact: Referee could accidentally create invalid match states (score < 11, negative numbers, or impossible win conditions). No way to detect referee error
- Fix approach: Extract score validation logic into shared function. Apply same validation rules across all scoring interfaces (referee + player submission)

**Tight Coupling Between State Updates:**
- Issue: Line 245-256: `scorePoint()` callback updates three pieces of state in sequence inside nested map (match selection, game state, match status). If any branch fails, state is inconsistent
- Files: `src/App.jsx` (lines 243-257)
- Impact: Complex interlocking state could diverge in edge cases. Hard to reason about correctness
- Fix approach: Use state reducer pattern or extract into a pure function that validates score, returns new match state, then apply atomically

## Performance & Optimization

**Unoptimized Re-renders:**
- Issue: All child components receive `matches` array and `setMatches` as props/callback. Any match update re-renders entire app. No component memoization or selective subscriptions
- Files: `src/App.jsx` (lines 301-314)
- Impact: Every 2.5-4 second live score update re-renders entire UI tree including modals, forms, lists. Perceptible lag on lower-end devices (elderly user base per design notes)
- Fix approach: Use React.memo for components that don't need live updates. Implement selective subscriptions (e.g., only RefereeFlow watches match 1). Consider Context API with granular providers

**Continuous Interval Running:**
- Issue: Line 213-239: `setInterval` with dependency on `view` creates new interval on every view change and doesn't stop running when in "landing" view. Interval runs even when user is idle
- Files: `src/App.jsx` (lines 211-241)
- Impact: Battery drain on mobile devices. Server/simulation CPU cost if this were a real app with persistent state
- Fix approach: Only start interval when view is "spectator" or "player" or "organizer" (viewing live matches). Stop on landing view cleanup

**No Input Debouncing:**
- Issue: Search input (line 497) and other form inputs fire onChange directly without debouncing. For "Discover" competition search with filter checks, each keystroke potentially filters all 5 competitions
- Files: `src/App.jsx` (lines 497, 441-452)
- Impact: Minor on small data sets, but if expanded to real tournament with 100s of competitors, search would be sluggish
- Fix approach: Add simple debounce wrapper (even 200ms) to search input onChange. Consider useTransition for larger data filtering

## Data & Constants

**Hardcoded Mock Data Has Inconsistencies:**
- Issue: TEAMS array (lines 14-19) has 8 teams. ELIMINATION_TEAMS (lines 46-55) has 32 teams. They share no common IDs or references. Same teams used across all competitions
- Files: `src/App.jsx` (lines 14-134)
- Impact: If building real features, unclear which data source is authoritative. No way to ensure consistency when modifying competition rosters
- Fix approach: Define single team/player source of truth. Use IDs to reference instead of duplicating team names. Create data validation layer

**Player Emails Generated With Regex Bug:**
- Issue: Line 107: `${p1.toLowerCase().replace(". ", ".")}@email.com` uses fixed string replace on dot-space pattern. If player name is "A.Lim" (no space), email becomes "a.lim@email.com" (works). But pattern is fragile
- Files: `src/App.jsx` (lines 104-110)
- Impact: Email generation is inconsistent. Not a bug now but will break if name format changes. Regex should use global flag and handle edge cases
- Fix approach: Use `replace(/\. /g, "")` to consistently remove spaces after periods, or use split/join pattern

**No Data Validation on Entry:**
- Issue: CreateEvent form (lines 852-920) accepts any input for date, venue, category count without validation. Can create events with past dates, empty fields (though UI disables submit), or 0 max players
- Files: `src/App.jsx` (lines 853-876)
- Impact: Organizer could accidentally create unusable events. No feedback on why submission failed if edge case triggered
- Fix approach: Add explicit validation functions before onSubmit. Return validation errors to user. Prevent past dates in date picker (min attribute)

## UI/UX & Interaction Issues

**Modal Stacking Undefined:**
- Issue: Go Live confirmation modal (line 317-331) could theoretically stack with bracket assignment modal (line 1366-1429) if both triggered. No z-index management or prevent-default on background clicks
- Files: `src/App.jsx` (lines 317-331, 1366-1429)
- Impact: User could click behind modal, triggering unexpected actions. Multiple modals could create confusing UI states
- Fix approach: Implement modal stack manager. Add backdrop click handlers that only close top modal. Ensure z-index increments per modal level

**Captcha Validation is Hardcoded:**
- Issue: Line 385: Spectator auth requires answer "7" to "4 + 3" hardcoded as string comparison. No accessibility or usability testing
- Files: `src/App.jsx` (lines 383-405)
- Impact: Single hardcoded answer means no real security. Elderly users may have math anxiety. Not WCAG compliant for vision/cognition accessibility
- Fix approach: Replace with proper CAPTCHA service or at least randomize questions. Or remove for demo (spectator view requires no auth in real scenario)

**Timing and Race Conditions:**
- Issue: Line 244: `setTimeout(() => setScoreFlash(null), 250)` happens synchronously but state update is async. If user scores twice quickly, second score may not flash properly
- Files: `src/App.jsx` (line 244)
- Impact: Visual feedback inconsistent for rapid scoring. Referee might not know if score registered
- Fix approach: Use useRef to track flash state or implement proper animation state machine

**No Loading States:**
- Issue: Forms (CreateEvent, AuthScreen) have no loading/pending states. If submission were async (e.g., to API), user would see no feedback
- Files: `src/App.jsx` (lines 410-434, 852-920)
- Impact: User might click submit multiple times thinking it didn't work
- Fix approach: Add `isLoading` state to forms. Disable submit button during submission. Show loading spinner

## Security & Edge Cases

**Credential Handling:**
- Issue: AuthScreen (lines 410-434) takes email/password input but `onAuth()` callback just sets `authed: true` without verifying credentials
- Files: `src/App.jsx` (lines 410-434)
- Impact: No real authentication. Anyone can click "Log In" to access player/referee/organizer views. This is fine for demo but dangerous if extended
- Fix approach: Add comment documenting this is demo-only. If real auth needed, integrate OAuth or JWT validation. Never send passwords in plain text

**No CSRF Protection:**
- Issue: Forms have no anti-CSRF tokens or validation. If this were a real app with API endpoints, forms would be vulnerable
- Files: `src/App.jsx` (lines 864-876 CreateEvent submit)
- Impact: If deployed to web, POST requests could be forged by malicious sites
- Fix approach: This is a client-side only demo, so not critical. But if API added, use hidden CSRF token or SameSite cookies

**Unvalidated URL/External Links:**
- Issue: No href validation for any links. The Google OAuth button (line 420) doesn't have real OAuth configured
- Files: `src/App.jsx` (line 420)
- Impact: Demo only, but misleading to users that they can auth with Google
- Fix approach: Either implement real OAuth or remove Google button from demo

## Testing & Observability

**No Tests:**
- Issue: Zero test files. No unit tests, integration tests, or E2E tests
- Files: No `*.test.jsx` or `*.spec.jsx` files
- Impact: Regression risk high. Score calculation logic (lines 249-256) uncovered. New features break existing flows undetected
- Fix approach: Add Jest + React Testing Library. Start with critical paths: scorePoint function, match state updates, form validation. Aim for 60%+ coverage on core logic

**No Error Boundaries:**
- Issue: App has no ErrorBoundary component. Any render error crashes entire app with blank screen
- Files: `src/App.jsx` (all components)
- Impact: Single typo or runtime error in nested component takes down entire tournament view
- Fix approach: Wrap key sections (SpectatorLive, RefereeFlow, OrgDashboard) in ErrorBoundary. Log errors for debugging

**No Logging or Monitoring:**
- Issue: No console.logs, no error tracking, no event analytics
- Files: `src/App.jsx` (entire file)
- Impact: If users report bugs, no way to know what they were doing or what state they were in. Can't track feature usage
- Fix approach: Add debug logging for state changes. If deploying to production, integrate error tracking (Sentry) and analytics (Mixpanel/GA)

**Console Warnings Expected:**
- Issue: Using inline styles with functions inside renders (e.g., line 362-363 onMouseEnter with direct style mutations) will trigger React warnings about unoptimized renders
- Files: `src/App.jsx` (lines 362-363, 475-476, and many others)
- Impact: Console noise. Harder to spot real warnings when running dev server
- Fix approach: Extract inline event handlers to named functions or use CSS hover states instead of onMouseEnter/Leave

## Browser Compatibility & Responsive Design

**CSS Grid Fallback Missing:**
- Issue: Grid templates (lines 288-292, 1332) use modern CSS. No fallback for older browsers
- Files: `src/App.jsx` (lines 287-298)
- Impact: Layout broken on IE11 (though EOL). Minor issue for modern browsers
- Fix approach: Add fallback grid or use flexbox alternative for older browser support if needed

**Font Loading Synchronous:**
- Issue: Google Fonts loaded via `<link>` tag (line 273) in component render. This happens on every mount
- Files: `src/App.jsx` (line 273)
- Impact: Fonts load over network synchronously. First paint delayed. If network slow, text is unstyled briefly
- Fix approach: Move `<link>` to `index.html` `<head>`. Or preload fonts. Use `font-display: swap` to show fallback while loading

**Mobile Responsiveness Incomplete:**
- Issue: Media queries (lines 281-298) only adjust grid layout and landing title. Most components don't adapt for small screens (narrow input fields, stacked buttons)
- Files: `src/App.jsx` (lines 281-298)
- Impact: UI cramped on phones. Many buttons/inputs not touch-friendly. Forms may be hard to fill on small screens
- Fix approach: Mobile-first media query strategy. Add `@media (max-width: 640px)` for base styles, then enhance for larger screens. Test on actual devices or use Chrome DevTools

## Known Limitations & Future Work

**Live Simulation is Unrealistic:**
- Issue: Random score generation (lines 217-237) doesn't follow real match patterns. Scores jump from 0 to complete games instantly. Game length random not based on actual rally dynamics
- Files: `src/App.jsx` (lines 211-241)
- Impact: Demo doesn't reflect real tournament flow. User gets no sense of pacing or actual match duration
- Fix approach: If extending demo, implement realistic rally simulation with serve, win probabilities based on teams/players, realistic game duration distribution

**No Persistence:**
- Issue: All state in-memory. Refreshing page loses everything. No localStorage or backend
- Files: `src/App.jsx` (entire state management)
- Impact: User can't refresh or leave demo without losing progress. Not realistic for real app
- Fix approach: Add localStorage for session data if extending. Or integrate backend API with real persistence

**Organizer View Overly Simplified:**
- Issue: OrgDashboard (lines 1000-1432) shows hardcoded brackets and matches. Live simulation doesn't actually update organizer view—bracket matches are local state in component (line 1037)
- Files: `src/App.jsx` (lines 1000-1432)
- Impact: Organizer sees stale data. Live updates don't sync between referee scoring and organizer bracket view
- Fix approach: Make bracket matches derived from root `matches` state. Bracket assignments should update root state so all views sync

**Spectator Can't Actually Switch Matches:**
- Issue: SpectatorLive (line 550-798) has `focusMatch` state but live scores don't update per match—shows all matches' scores. Clicking match button doesn't filter view
- Files: `src/App.jsx` (lines 550-798)
- Impact: "Focus match" button doesn't work as expected. UI misleading
- Fix approach: Filter rendered matches by `focusMatch`. Hide non-focused matches or highlight focused match only

---

*Concerns audit: 2026-03-04*
