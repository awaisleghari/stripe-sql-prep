# CLAUDE.md

## Project mission

This repository is a **Stripe-style technical interview training gym** for a PhD/Data Science/MLE candidate who is learning SQL and preparing for a high-pressure technical interview.

The product is not merely a SQL tutorial. It is a blended learning system for:

1. SQL execution and analytics reasoning.
2. Data problem decomposition.
3. Python production-style scripting without assuming pandas.
4. Product analytics reasoning.
5. Experimentation and causal inference.
6. MLE/statistics intuition.
7. Stripe object literacy.
8. Interview communication under ambiguity.

The candidate is decent with Python and analytically strong, but does **not** have strong pandas fluency. Teach SQL and data reasoning from first principles. Python can be used as support through lists, dictionaries, loops, functions, sorting, sets, tests, and validation. Do not assume pandas.

The long-term goal is a polished, browser-only learning cockpit deployable to Cloudflare Pages. All progress and code execution must remain client-side. No backend, no database server, no secrets, no authentication, and no server-side code execution.

---

## Current architecture

This is a Vite + React + TypeScript app.

Important commands:

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

The app must always build as a static site:

```bash
npm run build
```

Cloudflare Pages target:

- Build command: `npm run build`
- Output directory: `dist`
- No backend required
- No environment variables required for the first version

---

## Non-negotiable engineering principles

### 1. Make everything easy to debug

Every domain must have an obvious home.

- Problems live in `src/data/gym/...`.
- Learning modules live in `src/data/modules/...`.
- Ladders live in `src/data/gym/ladders.ts`.
- Schema/cast/resources/rubrics live in `src/data/...`.
- Type definitions live in `src/types/...`.
- localStorage logic lives only in `src/state/progressStore.ts` and related state utilities.
- Filtering, scoring, navigation, and validation logic live in `src/utils/...`.
- UI components live in `src/components/...`.
- Styling tokens live in `src/styles/tokens.css`.

Do not create junk drawers. Do not create giant files that mix data, UI, and state. Do not hide important logic inside React components if it belongs in a selector, utility, or typed data model.

### 2. Type the data strictly

Every module, problem, ladder, quiz, resource, rubric, and progress object must have a TypeScript type.

Avoid stringly typed behavior where a union type would be safer.

Examples of values that should be typed as unions:

- Problem difficulty
- Problem mode
- Problem status
- Priority
- Ladder id
- Module id
- Quiz ladder level
- Resource category
- Tag color

Do not add new categories or string values without updating the corresponding types, labels, tests, and filters.

### 3. Preserve state safety

Progress is localStorage-backed. localStorage should be handled through the state layer, not scattered across components.

When changing progress shape:

- Use versioned keys where appropriate.
- Add migration logic when necessary.
- Never silently destroy user progress.
- Write tests for selectors and state updates.
- Treat malformed localStorage as recoverable.

### 4. Browser-only code execution

All code execution and answer checking must happen in the browser.

No backend execution.
No remote code execution.
No server-side grading.
No API calls for grading.
No hidden network dependency.

Future SQL checking should use a browser-local engine such as `sql.js` or DuckDB-Wasm. Start with SQL execution only. Python execution is harder and should not be added until the architecture can sandbox it safely. Python drills can initially use model answers, static checks, and test-case prompts.

When adding SQL execution:

- Put SQL engine code under a dedicated `src/sqlRunner/` area.
- Seed datasets must be deterministic and versioned.
- Result comparison must be explicit.
- Feedback rules must be testable.
- Problems should declare whether they are executable.
- Non-executable reasoning problems should continue using model answers and rubrics.

Suggested future structure:

```text
src/sqlRunner/
  engine.ts
  seedDatabase.ts
  datasets/
  normalizeResults.ts
  compareResults.ts
  feedback.ts
  executableProblemTypes.ts
```

### 5. Tests are part of the product, not an afterthought

Any meaningful change should be accompanied by appropriate tests.

Minimum expected validation:

```bash
npm run typecheck
npm run test
npm run build
```

Run Playwright when UI routes, navigation, or interaction flows change:

```bash
npm run test:e2e
```

If a change cannot be tested automatically yet, explicitly say what was manually inspected and why a test was not added.

---

## Product principles

### 1. The app must be problem-forward

The learner should always understand:

1. What am I doing right now?
2. Why does it matter for the interview?
3. What should I produce?
4. How do I check whether I got it right?
5. What should I do next?

Avoid catalog dumps. The Practice Gym should default to a focused one-problem-at-a-time runner, not an overwhelming grid.

A browse/catalog mode is useful, but it is secondary. The primary experience should be:

- pick a ladder;
- start or continue;
- focus on one problem;
- attempt;
- reveal hints only when needed;
- compare solution;
- mark status;
- move to next problem.

### 2. Learning must be confidence-building and layered

Do not create random bags of questions. Every ladder should progress deliberately:

1. Recognition / concept intuition.
2. Easy mechanical practice.
3. Medium applied problem.
4. Hard multi-step problem.
5. Edge-case hard problem.
6. Debug or explain-aloud task.
7. Timed final-boss challenge.

Every problem should clearly state:

- what this problem teaches;
- why it is harder than the previous problem;
- prerequisite skill;
- next recommended problem.

### 3. Teach from first principles, not pandas

The candidate is not a strong pandas user. Do not write learning content that assumes pandas fluency.

Use this reasoning loop:

1. What question are we answering?
2. What is the input?
3. What is the output?
4. What is one row/result?
5. What rows count?
6. What rows do not count?
7. What is the metric?
8. What is the denominator?
9. What edge cases can break the answer?
10. How do we validate?

Python support should use simple language and simple data structures. Avoid advanced pandas vocabulary unless clearly labeled as optional and not required.

### 4. Stripe realism matters

Keep problems Stripe-flavoured and realistic. Use the synthetic schema and recurring merchant cast consistently.

Core objects and concepts:

- merchants
- customers
- charges
- refunds
- disputes
- subscriptions
- invoices
- balance transactions
- payouts
- connected accounts
- PaymentIntent vs Charge
- Refund vs Dispute
- Balance Transaction as ledger
- platform vs connected-account grain

Frequent edge cases:

- pending charges
- failed charges
- duplicate/idempotency events
- refund vs dispute distinction
- late-arriving disputes
- created_at vs available_on
- multi-currency
- integer division
- one-to-many join fan-out
- nulls
- low-volume merchants
- selection bias
- time-window ambiguity
- causality vs correlation

### 5. The app should train interview communication

Every substantial problem should include an explain-aloud component. The candidate should practice saying:

- “Let me clarify the metric.”
- “The output grain is…”
- “The denominator should be…”
- “The relevant source table is…”
- “The edge cases are…”
- “I would validate this by…”
- “I would not claim causality because…”

---

## UI / UX standards

The UI should feel like a premium, calm, focused learning cockpit.

Design inspiration:

- Ant Design for structure, navigation, tables, tags, steps, progress, collapses, and status indicators.
- shadcn/ui for restrained dark-mode surfaces, spacing, typography, and composable component sensibility.
- Linear / Raycast / Vercel / Superhuman for polish, hierarchy, and low visual noise.

Do not blindly copy any design system. Use the sensibility.

### Required UX qualities

- One primary task visible at a time in Focus Mode.
- Clear page purpose and next action.
- Strong visual hierarchy.
- Consistent spacing and alignment.
- Compact but readable cards.
- No chip/tag overload before the learner sees the task.
- No giant walls of metadata.
- No raw data-object rendering.
- No cluttered grids as the primary learning surface.
- Mobile should remain usable.

### Component expectations

Reusable components should exist for common patterns:

- Page hero
- Coach card
- Guidance panel
- Task panel
- Deliverable panel
- Checklist panel
- Common confusion panel
- Validation panel
- Interview panel
- Problem card
- Problem detail
- Ladder overview
- Focus runner
- Empty state
- Code block
- Tag
- Progress
- Tabs
- Collapse

If a visual pattern appears three times, make it a component or reusable class.

### Copy standards

Prefer learner-friendly labels:

- “Your task” instead of “Prompt”
- “Expected deliverable” instead of “Output”
- “Expected output grain — what one row represents” instead of “Grain”
- “Reference solution — reveal after trying” instead of “Solution”
- “Check your work” instead of “Verification”
- “Common confusion” instead of vague mistake labels
- “What this problem teaches” instead of terse metadata

Tone should be serious, encouraging, direct, and high-signal.

---

## Data-content standards

### Problems

Every problem should have enough structure to support rendering, filtering, validation, and review.

A problem should generally include:

- id
- title
- ladder id
- mode
- difficulty
- priority
- source inspiration
- estimated time
- what this problem teaches
- why it is harder than prior rung
- prerequisite skill
- next recommended problem
- business context
- input/schema/context in play
- task
- expected deliverable
- before-you-start checklist
- hints
- reference solution or model answer
- common confusion
- validation/check-your-work
- edge cases
- explain-aloud prompt

For Python problems, include:

- function signature where useful
- model implementation or pseudocode
- test cases
- time complexity
- memory complexity
- edge cases

For SQL problems, include:

- expected output grain
- expected columns
- sample expected output
- common wrong answers
- validation checks
- edge cases
- answer comparison rules if executable

For product/causal/statistics problems, include:

- model answer
- assumptions
- tradeoffs
- validation plan
- rubric or checklist

### Ladders

Every ladder should have:

- id
- title
- purpose
- ordered problem ids
- category/mode group
- learning outcome
- final-boss problem if applicable

The ladder order matters. Do not append problems randomly.

### Modules

Learning modules should include:

- concept explanation
- mental model
- predict problems
- debug problems
- exercises
- 5-question quiz
- confidence gate
- links into Practice Gym

Every module quiz should have exactly 5 questions mapped to:

1. L0 concept intuition
2. L1 mechanical/syntax
3. L2 simple application
4. L3/L4 multi-step or edge-case reasoning
5. L5 interview judgment

---

## Testing and validation standards

### Data integrity tests should catch

- Duplicate ids.
- Missing problem fields.
- Missing ladder references.
- Problems assigned to non-existent ladders.
- Ladders referencing missing problems.
- Invalid mode/difficulty/priority values.
- Undefined tag colors.
- Raw internal tokens leaking to user-facing labels.
- Any rendered `undefined`, `null`, `[object Object]` anomalies.
- Quizzes not having exactly 5 questions.
- Missing expected deliverables.
- Missing check-your-work sections.
- Missing explain-aloud prompts.
- pandas-first language.

### State tests should catch

- localStorage parse failure recovery.
- progress updates.
- mark attempted/completed/needs review.
- quiz score updates.
- focus problem persistence.
- migration from older progress shapes.

### UI smoke tests should cover

- App renders.
- Sidebar navigation.
- Dashboard renders.
- A module renders.
- Predict/debug/exercise/quiz flow.
- Practice Gym Guided Path.
- Practice Gym Focus Mode.
- Browse All filters.
- Review Queue.
- Problem status persistence.
- Resources route.
- Schema Explorer route.

### Before declaring a turn complete

Run:

```bash
npm run typecheck
npm run test
npm run build
```

If UI behavior changed, also run:

```bash
npm run test:e2e
```

In the final response, summarize:

- What changed.
- What files were touched.
- What tests were run.
- Any known limitations.
- What the next safe step is.

Do not say “all good” unless tests actually passed.

---

## Browser-only SQL execution plan

This is a future core feature.

### Goal

Let the learner type SQL in the browser, run it against deterministic synthetic Stripe-style datasets, and receive feedback.

### Constraints

- All execution happens in browser.
- No backend.
- No API call for grading.
- No secrets.
- No remote code execution.

### Recommended stages

#### Stage 1: Executable SQL infrastructure

Add:

```text
src/sqlRunner/
  engine.ts
  seedDatabase.ts
  datasets/
  normalizeResults.ts
  compareResults.ts
  feedback.ts
  types.ts
```

Start with one lightweight engine, likely `sql.js`, unless DuckDB-Wasm is deliberately chosen for advanced analytical SQL. Keep the engine behind an interface so it can be swapped later.

#### Stage 2: Seed datasets

Create small, deterministic datasets matching the synthetic Stripe schema:

- merchants
- customers
- charges
- refunds
- disputes
- balance_transactions
- connected_accounts

Datasets should intentionally include edge cases:

- Northwind high failures
- Velvet high refunds
- PixelForge disputes
- GlobalGoods multi-currency
- CloudDesk duplicate idempotency keys
- MarketHub platform/connected accounts

#### Stage 3: Executable problem type

Extend problem types:

```ts
executable?: {
  engine: 'sqlite' | 'duckdb';
  datasetId: string;
  expectedColumns: string[];
  expectedRows: unknown[][];
  comparison: 'exact' | 'unordered' | 'tolerance' | 'shape-only';
  feedbackRules: FeedbackRule[];
}
```

#### Stage 4: Result comparison

Compare:

- syntax success/failure
- columns
- row count
- values
- ordering, if required
- tolerance for rates/decimals
- grain mistakes

#### Stage 5: Feedback rules

Examples:

- All rates are 0: likely integer division.
- Too many rows: possible join fan-out.
- Missing merchants: likely INNER JOIN where LEFT JOIN was needed.
- Wrong denominator: includes only successful charges.
- Currency blended: missing GROUP BY currency.
- Pending included: denominator ambiguity.

Add tests for every feedback rule.

---

## Cloudflare deployment standards

The app should stay compatible with Cloudflare Pages.

Expected deployment:

```bash
npm install
npm run build
```

Cloudflare config:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20+

Do not require backend services for the initial deployment. Do not add environment variables unless absolutely necessary.

If URL-based routing is later added, include a Cloudflare Pages SPA fallback such as:

```text
/* /index.html 200
```

---

## Development protocol for Claude Code

When asked to make a change:

1. Inspect relevant files before editing.
2. Identify the smallest safe change.
3. Preserve existing functionality unless explicitly told otherwise.
4. Update types first if data shape changes.
5. Update data and renderers separately.
6. Add or update tests.
7. Run the required checks.
8. Report honestly what passed and what did not.

Do not:

- Rewrite the whole app casually.
- Add large features without a turn plan.
- Add untyped data.
- Add UI that is not connected to state.
- Add state that is not tested.
- Add placeholder sections pretending to be complete.
- Expand content volume before the UX for that content is clear.
- Add browser SQL execution inside random components.
- Add a dependency without explaining why it is necessary.

Prefer controlled turns:

- Architecture turn.
- Data migration turn.
- Renderer turn.
- State turn.
- Test turn.
- UI polish turn.
- Deployment turn.

Each turn must leave the app in a working state.

---

## Definition of done

A change is done only when:

- TypeScript passes.
- Unit/data/state tests pass.
- Build passes.
- Relevant e2e/smoke tests pass or a reason is given.
- UI remains coherent.
- localStorage state is safe.
- No major route breaks.
- No malformed data is introduced.
- No placeholder content is presented as complete.
- The learner experience is clearer, not more cluttered.

If the change touches problem data, add integrity checks.
If the change touches UI flow, add a smoke test.
If the change touches state, add state tests.
If the change touches SQL execution, add engine/comparison tests.

---

## Current migration priority

Before adding more content, keep the repo migration disciplined.

Recommended order:

1. Finish migrating current single-file content into typed data files.
2. Ensure all current SQL and non-SQL problems render through the new typed Gym.
3. Ensure modules render through typed module data.
4. Ensure the Practice Gym Focus Mode, Guided Path, Browse All, and Review Queue match the monolith behavior.
5. Add data integrity tests that prevent regressions.
6. Only then add browser-based SQL execution.
7. Only then expand problem volume.

The principle: **architecture first, then parity, then executable checking, then scale.**
