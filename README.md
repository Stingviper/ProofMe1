# ProofMe

**Prove your skills. Don't just claim them.**

Full-stack skill verification for developers: assessments, a LeetCode-style DSA lab (Java + Python), live judging, hidden tests, leaderboards, submission history, and shareable public profiles.

> Problem statements are original and inspired by classic interview patterns — not copied from LeetCode.

## Demo

| Item | Value |
|------|--------|
| **Local** | `npm run dev` → http://localhost:5173 |
| **Demo account** | Create any account via **Sign up**, or use your own email |
| **Suggested demo path** | Sign up → DSA Lab → solve *Two Sum* / *Maximum Element* → Dashboard → Copy profile link |

> Tip for reviewers: after one accepted submit, open **Leaderboard** and **Submissions** to see progress features.

### Screenshots (add your own)

Place images in `docs/` and link them here:

1. Landing page  
2. DSA lab (editor + pass)  
3. Dashboard / topic progress  
4. Public profile + leaderboard  

```markdown
![Landing](docs/landing.png)
![DSA Lab](docs/dsa-lab.png)
![Dashboard](docs/dashboard.png)
![Profile](docs/profile.png)
```

## Feature matrix

| Feature | Detail |
|---------|--------|
| Auth | Supabase email/password + auto profile |
| Assessments | Java, JavaScript, SQL |
| DSA Lab | 800 problems · 50 / topic · topic rail |
| Languages | **Java** (Solution stubs) · **Python** (function style) |
| Judge | Judge0 · 3 visible on Run · 15+ hidden on Submit · rate limited |
| Progress | Solved checkmarks · topic bars · solve time |
| History | Full **Submissions** page with filters |
| Leaderboard | Public DSA rankings |
| Profiles | `/profile/:username` + copy link + solved count |
| Theme | Dark / light toggle |
| CI | GitHub Actions build on push |

## Architecture

```
Browser (React + Vite)
  ├─ Auth / Dashboard / Profiles / Leaderboard / Submissions
  ├─ DSA Lab (Monaco)
  └─ POST /api/judge  →  rate limit  →  wrap Solution  →  Judge0
Supabase Postgres + RLS (profiles, skill_results, submissions)
```

## Quick start

```bash
npm install
cp .env.example .env.local
```

Set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
# optional
# JUDGE0_URL=https://ce.judge0.com
```

Run **all** of `supabase-schema.sql` in the Supabase SQL editor (includes `solve_time_ms` and `public_accepted_count`).

```bash
npm run dev
```

## Deploy on Vercel

1. Push repo to GitHub  
2. Import in Vercel  
3. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`  
4. Supabase Auth → add production URL to Site URL + Redirect URLs  
5. Optional: `JUDGE0_URL`  

`vercel.json` already rewrites SPA routes and `/api/*`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs `npm run build` on push/PR.

## Resume blurb

> **ProofMe** — Full-stack skill verification (React, Supabase, Judge0). LeetCode-style DSA lab with Java/Python judging, hidden tests, rate-limited judge API, leaderboards, submission history, and public verified profiles.

## Security notes

- RLS on profiles, skill_results, submissions  
- Public profiles readable by design  
- Submissions private to owner  
- Judge API rate-limited (30 req/min/IP, best-effort)  
- Never put service-role keys in `VITE_*`  

Copyright © 2026 Om Deorukhakar. All Rights Reserved.
