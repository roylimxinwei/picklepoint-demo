# Phase 1: Scaffolding - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up Next.js, FastAPI, and Supabase into a working three-tier stack. Deploy to Vercel (frontend), Railway (backend), and Supabase Cloud. Verify cross-origin communication works in both local dev and production. No features — just the skeleton.

</domain>

<decisions>
## Implementation Decisions

### Repository structure
- Monorepo with `/frontend` (Next.js) and `/backend` (FastAPI) directories
- Single git repo, shared history
- Vercel deploys from `/frontend`, Railway deploys from `/backend`

### API communication pattern
- Browser calls FastAPI directly (not proxied through Next.js API routes)
- JWT passed in Authorization header for authenticated requests
- Next.js API routes used only for Supabase Auth cookie management (via @supabase/ssr)
- FastAPI CORSMiddleware configured with origins from environment variable

### Local development
- Two terminal windows: `npm run dev` for Next.js, `uvicorn` for FastAPI
- Both connect to the same Supabase project (dev or staging)
- `.env.local` files in each directory for environment variables
- No Docker required for local dev

### Deployment targets
- Frontend: Vercel (auto-deploy from main branch, root directory set to `/frontend`)
- Backend: Railway (auto-deploy from main branch, root directory set to `/backend`)
- Database: Supabase Cloud (single project for auth + postgres + realtime)

### Health and keepalive
- FastAPI `/health` endpoint returns 200 (no DB query)
- Set up keep-warm ping every 4 minutes to prevent Railway cold starts (critical for live tournaments)

### Claude's Discretion
- Exact Next.js project configuration (App Router layout)
- FastAPI project structure (routers, models, dependencies)
- Environment variable naming conventions
- Which Supabase features to enable at project creation

</decisions>

<specifics>
## Specific Ideas

- This is a new project repo — the existing demo repo stays as a UI/UX reference
- JavaScript/JSX only (no TypeScript) to match demo conventions
- Keep dependencies minimal — only what's needed for the skeleton

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Demo `src/App.jsx` serves as the complete UI specification — all component designs, flows, and styling patterns are defined there
- COLORS constant with role-based palettes can be ported directly
- Font configuration (Outfit, DM Sans, JetBrains Mono) from demo's `index.html`

### Established Patterns
- Inline styles throughout (no CSS framework) — maintain this in Next.js
- Function components with useState/useCallback — same pattern in Next.js
- Mobile-first responsive design with breakpoints at 380px, 768px, 1024px, 1280px

### Integration Points
- New Next.js app will eventually port components from demo's App.jsx
- Supabase client initialization in Next.js (browser + server)
- FastAPI will need Supabase service role client for server-side operations

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-scaffolding*
*Context gathered: 2026-03-04*
