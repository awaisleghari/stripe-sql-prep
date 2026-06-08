# CLAUDE.md — Stripe Interview Prep Repo

## 0. What this project is

This repository is a modular Vite + React + TypeScript rewrite of the original single-file Stripe SQL Prep app.

The product is a browser-only, static, blended technical-interview prep system for a Stripe PhD / Data Science / MLE-style interview. It trains SQL, data problem decomposition, Python production-style scripting, product analytics, experimentation/causal reasoning, MLE/statistics, Stripe object literacy, interview communication, validation, and edge-case discipline.

The candidate is analytically strong and decent with Python, but is learning SQL and should not be assumed to know pandas. Teach SQL and data reasoning from first principles.

Deployment target: Cloudflare Pages as a static Vite build.

Runtime constraints:

- No backend.
- No database.
- No authentication.
- No server-side code execution.
- No remote grading.
- Progress is stored in `localStorage`.
- Future SQL/code checking must run entirely in the browser.

## 1. Current migration status

The staged migration from the original monolithic HTML app is complete through Repo-7.

Completed:

- Repo-1: Vite/React/TypeScript scaffold, base types, localStorage store, sample module/problem, tests, Cloudflare path.
- Repo-2: full schema, merchant cast, resources, rubrics, and all 68 Practice Gym problems migrated into typed per-category data files.
- Repo-3: all 9 SQL learning modules migrated with full pedagogy: concept, reasoning framework, Predict, Debug, exercises, 5-question quiz, mistakes/edges, interview script, confidence and completion gates.
- Repo-4: standalone pages and Practice Gym parity: Guided Path, Focus Mode, Browse All, Review Queue, problem status persistence, filters, navigation, resources, mock, panic sheet, data reasoning page.
- Repo-5: dashboard upgrade with blended readiness, category coverage, weak-area coaching, and routing into Practice Gym.
- Repo-6: Cloudflare deployment finalization, Node pinning, asset headers, GitHub Actions CI, deploy checklist, and README deployment guidance.
- Repo-7: UI rebuilt on **Mantine v7** (`@mantine/core`, `@mantine/hooks`, `@tabler/icons-react`). Custom dark theme in `src/theme/mantineTheme.ts` (periwinkle brand, brighter-contrast navy palette, 15px base font). App shell (sidebar rail with day-grouped modules, breadcrumb + readiness ring), learning modules (color-coded Mantine `Tabs`, `Accordion`, `Radio`, `Rating`, `Alert`), and the shared `ui/` primitives (`Button`/`Card`/`Tag`/`Callout`/`ProgressBar`) all render through Mantine. SQL `CodeBlock` keeps a local dependency-free syntax highlighter. An earlier interim build on Ant Design was fully removed in this step.

Treat the current repo as the source of truth. Do not redo completed migration chunks unless explicitly instructed.

## 2. Product philosophy

This is not a generic SQL tutorial and not a bootcamp worksheet.

It is a closed, rigorous interview gym. The learner should not have to leave the app to do serious practice. External resources are inspiration and backup; internal modules and Practice Gym problems are the primary training surface.

Every learning surface should answer:

- What am I doing here?
- Why does this matter for Stripe?
- What should I do next?
- What does a good answer look like?
- How do I know if I got it right?
- What should I review if I am weak?
- How does this prepare me for the interview?

The app should make the learner feel:

- oriented,
- calm,
- guided,
- challenged,
- confident,
- not overwhelmed.

The core reasoning loop is:

1. What is the question?
2. What is the input?
3. What is the output?
4. What is one row / one result?
5. What rows count?
6. What rows do not count?
7. What is the metric?
8. What denominator matters?
9. What table/object is the source of truth?
10. What edge cases could break the answer?
11. How do we validate the result?
12. How would we explain this in an interview?

## 3. Candidate profile assumptions

Do not assume pandas fluency.

The candidate is:

- analytically strong,
- decent with Python,
- learning SQL,
- likely comfortable with research/statistical reasoning,
- preparing under time pressure.

Use simple Python support where useful:

- lists,
- dictionaries,
- loops,
- sorting,
- sets,
- functions,
- simple tests,
- validation.

Avoid teaching through advanced pandas assumptions such as:

- `groupby().transform`,
- `pivot_table`,
- complex dataframe merges,
- dataframe rolling windows,
- advanced reshaping.

Acceptable pandas language is limited to “no pandas required” or “pandas not assumed.”

## 4. Actual repository architecture

Keep the architecture modular. Every concept should have an obvious home.

Current structure:

```text
src/
  App.tsx
  main.tsx

  components/
    dashboard/
      Dashboard.tsx
      Resources.tsx
    gym/
      BrowseAll.tsx
      FocusMode.tsx
      GuidedPath.tsx
      GymView.tsx
      ProblemDetail.tsx
      ReviewQueue.tsx
    layout/
      AppLayout.tsx
      Sidebar.tsx
      Topbar.tsx
    learning/
      ModuleView.tsx
    pages/
      MockView.tsx
      PanicSheet.tsx
      ReasoningView.tsx
    schema/
      SchemaExplorer.tsx
    ui/
      Button.tsx
      Callout.tsx
      Card.tsx
      CodeBlock.tsx
      Collapse.tsx
      Labeled.tsx
      ProgressBar.tsx
      Tag.tsx

  data/
    cast.ts
    mock.ts
    panic.ts
    pysql.ts
    resources.ts
    rubrics.ts
    schema.ts
    modules/
      index.ts
      meta.ts
      m0.ts
      m1.ts
      m2.ts
      m3.ts
      m4.ts
      m6.ts
      m8.ts
      m11.ts
      m12.ts
    gym/
      experiment.ts
      index.ts
      ladders.ts
      logic.ts
      product.ts
      python.ts

  state/
    localStorageKeys.ts
    progressStore.ts
    selectors.ts

  styles/
    tokens.css
    globals.css
    components.css

  theme/
    mantineTheme.ts

  types/
    index.ts
    ladder.ts
    module.ts
    pages.ts
    problem.ts
    progress.ts
    quiz.ts
    resource.ts
    rubric.ts
    schema.ts

  utils/
    coaching.ts
    filters.ts
    formatters.ts
    highlightSql.ts
    problemNavigation.ts
    scoring.ts
    validation.ts

tests/
  data/
    integrity.test.ts
  state/
    dashboard.test.ts
    progressStore.test.ts
    selectors.test.ts
  ui/
    render.test.tsx
  e2e/
    smoke.spec.ts
```

Do not create junk-drawer files. Do not turn `App.tsx`, `Dashboard.tsx`, or any single file into a new monolith.

## 5. Where things belong

Use these homes consistently:

- Learning modules: `src/data/modules/`
- Module registry: `src/data/modules/index.ts`
- Practice Gym problem data: `src/data/gym/`
- Ladder registry: `src/data/gym/ladders.ts`
- Gym problem aggregation: `src/data/gym/index.ts`
- Schema/table data: `src/data/schema.ts`
- Merchant cast: `src/data/cast.ts`
- Resources: `src/data/resources.ts`
- Rubrics: `src/data/rubrics.ts`
- LocalStorage keys: `src/state/localStorageKeys.ts`
- LocalStorage reads/writes: `src/state/progressStore.ts`
- Derived state/selectors: `src/state/selectors.ts`
- Dashboard coaching logic: `src/utils/coaching.ts`
- Scoring/readiness: `src/utils/scoring.ts`
- Filters: `src/utils/filters.ts`
- Problem navigation: `src/utils/problemNavigation.ts`
- Data validation helpers: `src/utils/validation.ts`
- Reusable UI primitives: `src/components/ui/`
- Practice Gym UI: `src/components/gym/`
- Learning module UI: `src/components/learning/`
- Dashboard UI: `src/components/dashboard/`

If a new feature does not fit these homes, create a clearly named file/folder. Do not append unrelated code to a nearby file.

## 6. Chunked development protocol

Every Claude Code turn must be small, focused, and verifiable.

Before changing files:

1. Read `README.md`, `CLAUDE.md`, `package.json`, and relevant source files.
2. Identify the specific task/chunk.
3. Confirm what already exists.
4. Avoid redoing completed work.
5. State the intended files to modify if making a large change.

During changes:

1. Preserve existing IDs unless explicitly instructed.
2. Preserve public types unless changing them is necessary.
3. If changing a type, update all impacted data/components/tests in the same turn.
4. Keep data out of UI components.
5. Keep state mutations out of UI components.
6. Keep localStorage isolated in the state layer.
7. Keep renderers generic and data-driven.
8. Do not add dependencies without explicit approval.
9. Do not silently remove learning content.
10. Do not weaken problem rigor or validation.

After changes:

Run:

```bash
npm run typecheck
npm run test
npm run build
```

For UI flow changes, also run:

```bash
npm run test:e2e
```

If a command fails, do not claim success. Fix it, or report the failure precisely.

At the end of every turn, report:

1. What changed.
2. Files changed.
3. Commands run.
4. Results.
5. Known risks or limitations.
6. Recommended next step.

## 7. ID and data stability rules

Do not casually rename or regenerate IDs.

Stable IDs matter for localStorage, problem navigation, tests, and user progress.

Preserve:

- problem IDs,
- ladder IDs,
- module IDs,
- quiz IDs where present,
- resource IDs,
- schema table IDs/names,
- progress state shape.

If an ID or progress shape must change, implement a migration in the state layer and test it.

Never duplicate IDs.

## 8. Learning module requirements

Learning modules are not articles. They are guided skill-building surfaces.

Each module should include, where applicable:

- purpose / what this teaches,
- why it matters for Stripe,
- concept explanation,
- plain-English mental model,
- SQL or reasoning pattern,
- Predict drills,
- Debug drills,
- exercises,
- common mistakes,
- edge cases,
- interview script,
- follow-up prompt,
- 5-question quiz,
- confidence rating,
- completion gate,
- links to relevant Practice Gym ladders.

Every module quiz must contain exactly 5 questions:

1. L0 concept intuition,
2. L1 mechanical syntax or recognition,
3. L2 simple applied problem,
4. L3/L4 multi-step or edge-case reasoning,
5. L5 interview judgment.

A module should not be treated as interview-ready unless the learner scores at least 4/5 and has attempted at least one hard/final-boss problem in the related ladder.

## 9. Practice Gym requirements

The Practice Gym is the core training surface.

It must be problem-forward, not catalog-forward.

Required surfaces:

- Guided Path,
- Focus Mode,
- Browse All,
- Review Queue.

Focus Mode is the main learning experience. It should show one problem at a time.

Every problem should support:

- clear title,
- mode,
- difficulty,
- priority,
- estimated time,
- source inspiration,
- what you need to do,
- expected deliverable,
- why this matters for Stripe,
- why this is the next step,
- before-you-start checklist,
- context/schema/input,
- task,
- progressive hints,
- reference solution / model answer,
- common confusion,
- validation / check-your-work,
- explain-aloud prompt,
- attempted / completed / needs-review status.

Browse All should remain compact. Do not render giant expanded problem details inside the catalog.

Problems should be arranged in ladders, not dumped into a flat bag.

Difficulty should progress:

1. Foundation / recognition,
2. Easy / mechanical,
3. Medium / applied,
4. Hard / multi-step,
5. Edge-case hard,
6. Final boss / interview-hard.

Final-boss problems should be ambiguous, timed, and require assumptions, decomposition, edge cases, validation, and explanation.

## 10. Existing training categories

The app currently trains:

- SQL fundamentals,
- conditional aggregation,
- joins and grain,
- window functions,
- revenue / ledger reasoning,
- refunds / disputes,
- data logic / problem decomposition,
- Python production scripting,
- product analytics,
- experimentation and causal reasoning.

If adding MLE/statistics or Stripe object literacy later, use the same ladder and Focus Mode standards.

## 11. Browser-only execution policy

Any future “run code and check answer” feature must execute entirely in the browser.

Non-negotiable:

- No backend grading.
- No remote SQL execution.
- No sending learner code to an API.
- No server-side Python execution.
- No secrets or environment variables for execution.

Preferred staged approach:

1. Static pattern checks for early beginner drills.
2. Browser SQL runner for executable SQL problems.
3. Deterministic seed datasets bundled in the app.
4. Result normalization and comparison.
5. Feedback engine for common mistakes.
6. Optional browser-only Python execution later, only after review.

Potential browser SQL engines:

- `sql.js` for simpler SQLite-based local SQL execution.
- DuckDB-Wasm for richer analytical SQL, only if the added complexity is justified.

Execution architecture should be isolated under a dedicated folder, for example:

```text
src/sqlRunner/
  engine.ts
  seedDatabase.ts
  normalizeResults.ts
  compareResults.ts
  feedback.ts
  fixtures/
```

Executable problems should be explicitly marked. Not every problem needs execution.

## 12. State management rules

`src/state/progressStore.ts` is the localStorage boundary.

Components must not call `localStorage` directly.

State should be versioned or migratable if the shape changes.

Corrupt storage must not crash the app. It should fall back safely.

Do not wipe learner progress unless explicitly requested.

Selectors should be pure, stable, and tested.

## 13. Testing requirements

Tests are part of the architecture, not a formality.

Data integrity tests should protect against:

- duplicate problem IDs,
- duplicate ladder IDs,
- ladder references to missing problems,
- problems missing required guided fields,
- unknown modes,
- unknown difficulty values,
- unknown priority values,
- every quiz not having exactly 5 questions,
- raw pandas-first framing,
- resources mapping to invalid targets,
- undefined tag/label values.

State tests should cover:

- default progress state,
- persistence,
- corrupt storage handling,
- problem status updates,
- module status updates,
- selector outputs,
- dashboard/coaching selectors.

UI smoke tests should cover:

- dashboard rendering,
- module rendering,
- Practice Gym rendering,
- Focus Mode rendering,
- Browse All rendering,
- Review Queue rendering,
- Schema Explorer rendering,
- Resources rendering,
- Mock/Panic/Reasoning pages.

E2E smoke tests should cover the most important user flows:

- open dashboard,
- open a module,
- open Practice Gym Focus Mode,
- browse problems,
- mark a problem attempted/completed,
- open Review Queue,
- open resources.

## 14. UI / visual standards

The component library is **Mantine v7** (`@mantine/core`, `@mantine/hooks`), with `@tabler/icons-react` for icons. The theme lives in `src/theme/mantineTheme.ts` and is mirrored as CSS variables in `src/styles/tokens.css` so Mantine components and the remaining hand-rolled view markup stay on one palette. `MantineProvider` (forced dark) wraps the app in `App.tsx`.

Build UI out of Mantine components first (`Tabs`, `Accordion`, `Paper`/`Card`, `Badge`, `Alert`, `Radio`, `Rating`, `Progress`, `RingProgress`, `NavLink`). The shared `ui/` primitives wrap Mantine while preserving small local APIs; prefer extending those over scattering raw Mantine props through view files.

Reach for the design sensibility of Linear / Raycast / Vercel / Superhuman: calm hierarchy, generous spacing, confident but not noisy color.

Do not add another UI framework (Ant Design, shadcn, Tailwind, Chakra, MUI, etc.) — Mantine is the chosen stack. Adding Mantine sub-packages (`@mantine/dates`, `@mantine/notifications`, etc.) still needs explicit approval per §17.

Readability is a first-class requirement (the app is used for 6–7 hour sessions):

- Body text is bright (`--t-1`) on the deep navy base; never dim core reading text to a muted grey.
- Base font is 15px with a ~1.6 line height; do not ship sub-13px reading text.
- Use color with intent — color-coded module tabs, status-colored badges/alerts, gradient accents on primary CTAs and the hero — without turning cards into chip clusters.

Keep UI:

- clear,
- aligned,
- uncluttered,
- consistent,
- readable for 6–7 hour study sessions,
- responsive,
- keyboard accessible where practical.

Avoid:

- giant chip clusters,
- visually noisy cards,
- nested boxes everywhere,
- raw data dumps,
- misleading progress,
- buried problem prompts,
- tiny unreadable text,
- low-contrast text on the dark background,
- inconsistent spacing.

## 15. Content quality rules

Problems must be original and Stripe-flavoured.

Use external resources only as pattern inspiration:

- SQLBolt,
- PostgreSQL Exercises,
- Mode SQL tutorials,
- WindowFunctions-style drills,
- DataLemur-style prompts,
- StrataScratch-style free patterns,
- public GitHub SQL interview repositories,
- Stripe Sigma / Stripe docs,
- Stripe API docs,
- Stripe `python-interview-prep`,
- data-science interview repos,
- probability/statistics interview repos,
- Causal Inference for the Brave and True.

Do not copy proprietary or gated prompts verbatim.

Every resource should map to internal Practice Gym filters or ladders. Resources are secondary; the internal gym is primary.

## 16. Cloudflare Pages deployment

The app is a static Vite app.

Local commands:

```bash
npm install
npm run build
```

Cloudflare Pages settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 20
```

Node is pinned by `.nvmrc`.

The repo includes:

- `public/_headers` for cache headers,
- `.github/workflows/ci.yml` for typecheck + tests + build on push/PR,
- no backend,
- no secrets,
- no environment variables for initial deployment.

Before deployment, run:

```bash
npm run typecheck
npm run test
npm run build
npm audit
```

If vulnerabilities remain, report them honestly. Do not ignore a critical audit issue without explanation.

## 17. Dependency policy

Do not add dependencies unless they clearly improve maintainability or unlock a required capability.

Before adding a dependency, explain:

- why it is needed,
- why local code is insufficient,
- bundle/runtime impact,
- security/audit impact,
- whether it affects Cloudflare deployment.

Approved runtime UI stack: `@mantine/core`, `@mantine/hooks`, `@tabler/icons-react` (see §14). Other Mantine sub-packages and any new UI framework still require approval.

For browser SQL execution later, dependency approval is required before adding `sql.js`, DuckDB-Wasm, Monaco, CodeMirror, Pyodide, or similar.

## 18. Performance and bundle discipline

The app should stay fast as a static site.

Avoid unnecessary heavy libraries. Mantine pulls in a non-trivial JS/CSS payload; before the next deploy push, consider route-level code-splitting (`React.lazy` + dynamic `import()`) to bring the main JS chunk back under the 500 kB Vite warning threshold.

Keep data imports organized so future code splitting is possible.

Avoid expensive recalculations inside render paths. Use pure selectors/utilities where possible.

Do not add huge generated blobs directly inside components.

## 19. Accessibility and usability

Maintain:

- readable contrast,
- visible focus states,
- semantic buttons/labels where practical,
- reasonable keyboard navigation,
- responsive layouts,
- no hover-only critical actions.

Focus Mode should remain calm and one-task-at-a-time.

## 20. Non-negotiables

- Keep the app working after every turn.
- Do not leave broken intermediate states.
- Do not expand scope silently.
- Do not remove content without explicit instruction.
- Do not weaken problem rigor.
- Do not convert final-boss problems into shallow summaries.
- Do not add backend code.
- Do not add remote execution.
- Do not assume pandas fluency.
- Do not skip tests.
- Do not claim tests passed unless they actually ran.
- Do not leave dead buttons.
- Do not leave raw `undefined`, `null`, or `[object Object]` in UI.
- Do not introduce duplicate IDs.
- Do not create junk-drawer files.
