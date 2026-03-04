# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- JavaScript (ES6+) - All source code in `src/main.jsx` and `src/App.jsx`

**Secondary:**
- HTML - Build template in `index.html`

## Runtime

**Environment:**
- Node.js (version unspecified - no `.nvmrc` or `engines` field in package.json)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (v3)

## Frameworks

**Core:**
- React 18.2.0 - UI rendering library, used in `src/App.jsx` and `src/main.jsx`
- React DOM 18.2.0 - DOM rendering for React

**Build/Dev:**
- Vite 5.1.0 - Development server and production bundler
- @vitejs/plugin-react 4.2.1 - JSX support for Vite, configured in `vite.config.js`

## Key Dependencies

**Critical:**
- react@18.2.0 - SPA framework for interactive UI
- react-dom@18.2.0 - React rendering engine for DOM

**Zero External UI/Utility Dependencies:**
- No UI component libraries (Material-UI, Chakra, etc.)
- No CSS framework (Tailwind, Bootstrap, etc.)
- No state management library (Redux, Zustand, etc.)
- No HTTP client (Axios, Fetch API wrapper, etc.)
- No date utilities (date-fns, moment, etc.)
- All styling via inline JavaScript objects

## Configuration

**Environment:**
- No `.env` files or environment configuration system
- No secrets management configured
- Mock data hardcoded in `src/App.jsx` (see INTEGRATIONS.md)

**Build:**
- `vite.config.js` - Minimal Vite config with React plugin enabled
- `index.html` - HTML entry point with mobile viewport meta tags

**Development Server:**
- Default Vite dev server on localhost:5173 (via `npm run dev`)

## Platform Requirements

**Development:**
- Node.js (no minimum specified)
- npm (bundled with Node.js)
- Any modern terminal/shell

**Production:**
- Static hosting only (Vite outputs static HTML/CSS/JS to `dist/`)
- No backend runtime required
- Works in any modern browser (React 18 support):
  - Chrome 91+
  - Firefox 89+
  - Safari 15+
  - Edge 91+

**Mobile:**
- iOS: Safari 15+
- Android: Chrome/Firefox on Android

## Scripts

```bash
npm run dev      # Vite dev server with HMR
npm run build    # Production build to dist/
npm run preview  # Serve dist/ locally for preview
```

## No Configuration For

- Linting (no `.eslintrc`, `.eslintignore`)
- Code formatting (no `.prettierrc`, Prettier config)
- TypeScript (pure JavaScript/JSX only)
- Testing framework (no Jest, Vitest, Mocha config)
- Babel (handled by Vite + React plugin)
- Environment files (no `.env`, `.env.local`, etc.)

---

*Stack analysis: 2026-03-04*
