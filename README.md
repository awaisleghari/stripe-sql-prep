# Stripe Interview Prep — Blended Technical Gym

A static, single-page prep app for a Stripe PhD/DS/MLE technical interview.
Built with **Vite + React + TypeScript**, no backend, progress in `localStorage`.

## Why this architecture
Migrated from a single 470 KB HTML file into a modular repo so every piece has an obvious home:

| Question | Answer |
| --- | --- |
| Where is a **problem** defined? | `src/data/gym/<category>/*.ts` (e.g. `sql/conditional.ts`) |
| Where is a **module** defined? | `src/data/modules/*.ts`, registered in `modules/index.ts` |
| Where is a **ladder** defined? | `src/data/gym/ladders.ts` |
| Where is a **UI component** rendered? | `src/components/{layout,ui,learning,gym,dashboard,schema}` |
| Where is **localStorage** handled? | `src/state/progressStore.ts` (the only place storage is touched) |
| Where is **readiness** calculated? | `src/utils/scoring.ts` |
| Where are **problem filters** implemented? | `src/utils/filters.ts` |
| Where are **quiz rules** enforced? | type `Quiz` + `tests/data/integrity.test.ts` |
| Where do I **add a ladder**? | append to `src/data/gym/ladders.ts` + add its problems |
| Where do I **add a problem**? | a category file under `src/data/gym/`, then it's auto-included via `gym/index.ts` |
| Where do I **test data integrity**? | `tests/data/integrity.test.ts` |

Data is separated from renderers; SQL problems from logic/Python/etc. (one file per category);
state from presentation; selectors/scoring from UI; tokens from components.

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run test       # vitest (data integrity + store + selectors)
npm run build      # typecheck + vite build -> dist/
```

## End-to-end smoke tests (optional)
```bash
npx playwright install   # downloads browser binaries (first time)
npm run test:e2e
```

## Deploy to Cloudflare Pages
This is a static SPA — no env vars, no secrets, no backend.

1. Push the repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20 (set `NODE_VERSION=20` if needed)
4. Deploy. Every push to the production branch auto-deploys; PRs get preview URLs.

Because routing is in-app state (not URL paths), no SPA redirect rule is required.
If you later switch to URL-based routes, add a `public/_redirects` file with `/*  /index.html  200`.

## Migration status
- **Repo-1:** scaffold, types, store, sample module + sample ladder, tests, deploy path. ✅
- **Repo-2 (done):** full schema (11 tables), cast, resources (+map), rubrics, and **all 68 problems** migrated into typed per-ladder category files; data-integrity tests scaled to the full set. ✅
- **Repo-3:** migrate all SQL learning modules.
- **Repo-4:** full Practice Gym parity.
- **Repo-5:** dashboard blended-readiness polish.
- **Repo-6:** Cloudflare CI finalisation.
