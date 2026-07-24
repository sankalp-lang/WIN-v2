# WiN prototype — deploy

**Static site. No build step, no backend, no environment variables.** Open `index.html` locally, or
serve the folder. This is the same shape as the PolicyOS prototype, which is why it deploys cleanly.

## Run locally
```bash
# option A: just open it
open index.html

# option B: serve it (routing + fonts behave best over http)
python3 -m http.server 8123
# → http://localhost:8123
```

## Deploy with git → Vercel
```bash
cd WIN-Prototype-v2
git init && git add -A && git commit -m "WiN prototype v2"
# create an empty repo on GitHub, then:
git remote add origin https://github.com/<you>/win-prototype.git
git push -u origin main
```

Then in Vercel: **New Project → import the repo →**
- **Framework Preset:** `Other`
- **Build Command:** *(leave empty)*
- **Output Directory:** `.` (repo root)
- **Install Command:** *(leave empty)*

Deploy. That's it — Vercel just serves the static files.

## Notes
- **No login wall to worry about.** If a deployment ever redirects to a Vercel login, that's
  *Deployment Protection* (Settings → Deployment Protection → Vercel Authentication → Disabled), not the app.
- **No env vars.** Unlike the old Bolt build, nothing here reads `import.meta.env` or talks to Supabase,
  so there's nothing to configure and nothing to break the build.
- **Routing is client-side via the URL hash** (`#/worker/worker-home`), so deep links and refreshes work on any
  static host with **no rewrite rule / `vercel.json` needed**.
- Everything is self-contained (only Google Fonts is fetched over the network; the app works offline without it).
