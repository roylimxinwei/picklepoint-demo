# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**Not Applicable:**
- No external API integrations present
- No SDK imports for third-party services (Stripe, Supabase, AWS, etc.)
- No HTTP client library configured for API calls
- No webhooks or API event subscriptions

## Data Storage

**Databases:**
- None. All data is in-memory and derived from hardcoded mock data

**File Storage:**
- Local filesystem only for Vite build artifacts (`dist/` folder)
- No cloud storage (S3, Firebase Storage, Cloudinary, etc.)
- No file upload/download functionality

**Caching:**
- None. No caching library or service configured
- In-memory state management only via React `useState`

## Authentication & Identity

**Auth Provider:**
- Custom authentication simulation (mock only)
- Implementation: Hardcoded credentials in `src/App.jsx`
  - Spectator: No login required (anonymous view)
  - Player: Username/password mock auth (see `AuthScreen` component, no real verification)
  - Referee: Username/password mock auth
  - Organizer: Username/password mock auth
- No OAuth2, JWT verification, or external identity provider
- No user session persistence (reset on page refresh)

**How It Works:**
- `AuthScreen` component accepts credentials but validates against mock user list only
- No backend validation
- No token generation or storage

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, LogRocket, DataDog, etc.)
- Unhandled errors will surface in browser console only

**Logs:**
- Console logging only (via `console.log`)
- No structured logging framework
- No log aggregation

## CI/CD & Deployment

**Hosting:**
- Static file hosting only (Vite builds to `dist/`)
- No backend deployment
- Can deploy to:
  - Vercel
  - Netlify
  - GitHub Pages
  - Any static web host (S3, Cloudflare Pages, etc.)

**CI Pipeline:**
- Not configured (no GitHub Actions, GitLab CI, CircleCI config)

## Environment Configuration

**No Environment Configuration:**
- No `.env` files (not in `.gitignore`)
- No environment variable injection system
- No API base URL configuration
- No secrets management

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## Live Simulation & Demo Data

**All Data Hardcoded in `src/App.jsx`:**

**Constants:**
- `COLORS` - Role-based color schemes (lines 7-12)
- `TEAMS` - Mock team data (lines 14-19)
- `COMPETITIONS` - Live tournament listings (lines 21-24)
- `ORG_COMPETITIONS` - Organizer's tournament management list (lines 26-29)
- `DISCOVER_COMPETITIONS` - Public tournament discovery data (lines 31-37)
- `REFEREES` - Mock referee database (lines 39-43)
- `COURTS` - Court numbering (line 44)
- `ELIMINATION_TEAMS` - 32 tournament bracket teams (lines 46-55)
- `POOL_GROUPS` - Round-robin group standings (lines 57-90)
- `MDA_PLAYER_NAMES` - 64 player names for "Mixed Doubles A" (lines 93+)

**Live Score Simulation:**
- `setInterval` loop in root `PicklePoint` component updates match scores every 2 seconds
- Simulates live game progression (scores increment, games complete)
- No real-time protocol (WebSocket, Server-Sent Events)
- Deterministic simulation (same pattern repeats)

## Browser APIs Used

**Standard Web APIs:**
- `localStorage` - Not directly used in source (but available via browser)
- `setInterval` / `clearInterval` - For live score simulation timer
- Event handlers - `onClick`, `onChange`, `onSubmit` on HTML elements
- CSS media queries (in `index.html` global `<style>`)

**NOT Used:**
- Geolocation API
- Notification API
- Service Workers / offline support
- IndexedDB / Web Storage (state not persisted across refresh)

## Third-Party Fonts & CDNs

**Fonts:**
- Outfit (headings) - Loaded via Google Fonts (referenced in CLAUDE.md, not in code)
- DM Sans (body) - Loaded via Google Fonts (referenced in CLAUDE.md, not in code)
- JetBrains Mono (labels/data) - Loaded via Google Fonts (referenced in CLAUDE.md, not in code)
- Note: Font imports not found in provided files; may be injected via external CSS or system fonts fallback

**CDNs:**
- None (all code bundled by Vite)
- Font loading may occur via Google Fonts CDN (not configured in visible code)

---

*Integration audit: 2026-03-04*
