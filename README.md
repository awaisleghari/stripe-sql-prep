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
This is a static SPA — no backend, no env vars, no secrets.

**Option A — connect the GitHub repo (recommended, auto-deploys on push):**
1. Push the repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy.** Every push to `main` ships to production; every PR gets a preview URL.

Node version is pinned to 20 via `.nvmrc` (Cloudflare reads it automatically). If a build ever
uses the wrong Node, add an environment variable `NODE_VERSION = 20` in the Pages project settings.

**Option B — deploy from your machine (Wrangler CLI):**
```bash
npm run build
npx wrangler pages deploy dist --project-name=stripe-sql-prep
```
(First run prompts a browser login. No `wrangler.toml` needed.)

**Notes**
- Caching: `public/_headers` fingerprinted assets are cached immutably for a year, while
  `index.html` is always revalidated so new deploys appear immediately.
- Routing is in-app state (not URL paths), so **no SPA redirect rule is required**. If you later
  add URL-based routes, create `public/_redirects` with `/*  /index.html  200`.
- CI: `.github/workflows/ci.yml` runs typecheck + tests + build on every push/PR as a quality gate.
  Cloudflare performs the actual deploy, so no API tokens or secrets live in the repo.

## Deploy checklist
- [ ] `npm run build` succeeds locally and produces `dist/`
- [ ] `npm run test` is green
- [ ] repo pushed to GitHub
- [ ] Cloudflare Pages project created with build command `npm run build` and output dir `dist`
- [ ] first deploy succeeds and the live URL loads the dashboard

## Migration status
- **Repo-1:** scaffold, types, store, sample module + sample ladder, tests, deploy path. ✅
- **Repo-2 (done):** full schema (11 tables), cast, resources (+map), rubrics, and **all 68 problems** migrated into typed per-ladder category files; data-integrity tests scaled to the full set. ✅
- **Repo-3 (done):** all 9 SQL learning modules migrated with full pedagogy — concept, Python analogy, reasoning framework, multiple Predict/Debug drills, laddered exercises, 5-question quiz, mistakes/edges, interview script + follow-up, confidence & completion gate. ✅
- **Repo-4 (done):** the standalone pages — Mock interview (with rubric self-scoring), Panic / final-review sheet, and the Data-Reasoning → SQL lookup. (Practice Gym parity was already achieved in Repo-1–2.) ✅
- **Repo-5 (done):** dashboard upgrade — blended readiness (foundation + practice + simulation), skill coverage by category, and weak-area coaching nudges that route you to the right next drill. The top-bar readiness ring now reflects the blended score. ✅
- **Repo-6 (done):** Cloudflare deploy finalised — Node pinned via `.nvmrc`, asset caching via `public/_headers`, a GitHub Actions CI quality gate, and a full deploy walkthrough + checklist. The repo is at feature parity with the original app and ready to ship. ✅
