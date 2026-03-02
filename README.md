# PicklePoint — Interactive Prototype

Real-time pickleball tournament management platform. This is an interactive demo showcasing all four user roles: Spectator, Player, Referee, and Organizer.

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Vercel (Recommended)

### Step-by-step:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "PicklePoint demo"
   ```
   - Go to [github.com/new](https://github.com/new) and create a new repo (e.g. `picklepoint-demo`)
   - Follow GitHub's instructions to push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/picklepoint-demo.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
   - Click **"Add New Project"**
   - Import your `picklepoint-demo` repository
   - Vercel auto-detects it as a Vite project — no config needed
   - Click **"Deploy"**
   - Your site will be live at `https://picklepoint-demo.vercel.app` (or similar)

3. **Custom Domain (Optional)**
   - In Vercel dashboard → your project → Settings → Domains
   - Add your custom domain and follow DNS instructions

### Alternative: Netlify

1. Push to GitHub (same as above)
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click **"Add new site" → "Import an existing project"**
4. Select your GitHub repo
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click **"Deploy site"**

## What's Inside

- **Landing Page** — Role selection with color-coded hierarchy
- **Spectator** — 5-digit code + captcha → live scores (dual scoring display)
- **Player** — Google/email login → find competitions → QR check-in → live view
- **Referee** — Point-by-point tap scoring with live broadcast
- **Organizer** — Competition lifecycle management, player filters, export, broadcast

## Tech

- React 18 + Vite
- Zero external UI libraries (all custom components)
- Responsive across phone, tablet, and desktop
