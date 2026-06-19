# neo tester

A tiny live testbed to demonstrate the **edit → push → Vercel redeploy** loop.
Zero build: plain HTML/CSS/JS. Supabase loaded from CDN, with a localStorage
fallback so it works the instant it's deployed — before any backend exists.

## Run locally
Just open `index.html`, or serve the folder:
```sh
python3 -m http.server 5173   # http://localhost:5173
```

## The edit loop (the whole point)
1. Change a line in `index.html` (e.g. the `<h1>` or the lede).
2. `git add -A && git commit -m "tweak copy" && git push`
3. Vercel auto-deploys in seconds. Refresh the live URL — your change is there.

## Two modes
- **local** (default): messages save to your browser's `localStorage`.
- **cloud**: paste your Supabase URL + anon key into `config.js`, redeploy → the
  same UI now reads/writes a Supabase `messages` table.

## Wire up Supabase (cloud mode)
1. Create a Supabase project.
2. SQL Editor → run `supabase-setup.sql` (creates the `messages` table + policies).
3. Project Settings → API → copy the **Project URL** and **anon public key**.
4. Paste both into `config.js`, commit, push. The badge flips to `cloud`.

> The anon key is safe to ship in client code — that's its purpose. Row-level
> security (in `supabase-setup.sql`) is what governs access.

## Deploy
Connected to Vercel via GitHub: every push to `main` deploys to production.
Manual: `vercel deploy --prod`.
