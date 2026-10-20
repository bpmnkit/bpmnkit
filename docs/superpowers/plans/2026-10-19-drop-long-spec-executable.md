# Drop: a long spec becomes an executable agent diagram — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasting the bake-off spec (`packages/core/tests/fixtures/bakeoff/spec.md`) into `/drop?nolimit` can produce an ad-hoc AI agent with its REST tools, the annotations and connector configuration, instead of a plain-task shape with an invented error path.

**Architecture:** Four independent fixes along the drop pipeline: what the prompt teaches (core guide + drop rules + gap check), the generate budget for long descriptions, the connect pass for long descriptions, and a readiness badge that names what keeps a draft from running.

**Tech Stack:** TypeScript, Cloudflare Worker (apps/drop), `@bpmnkit/core` process text, Vitest, Biome.

**Spec:** this plan argues from two investigation reports (root causes with file:line evidence):
`/tmp/claude-0/-home-user-bpmnkit/af528bf5-1e0b-51e1-9469-66aad1175bac/scratchpad/drop-inv/generation-report.md` and `.../drop-inv/executability-report.md`. Summary of causes:
1. `GENERATE_SYSTEM_PROMPT` (apps/drop/src/lib/generate.ts:12) orders "A REST call gets a boundary:error leading to a task that handles the failure"; the `rest` gap rule (apps/drop/src/lib/check.ts ~line 82) re-asks for it whenever "REST"/"HTTP" appears. That is the invented "REST connection failed" path.
2. `PROCESS_TEXT_GUIDE` (packages/core/src/bpmn/process-text.ts:37-63) leaves `adhoc` out of the Kinds line and has no ad-hoc example; the model drew a plain task `AI_Agent`, no tools, no notes. "Use short lowercase ids" made it put the spec's ids (`Gateway_RunAgent`) into names.
3. Generate output is capped at 600 tokens for glm-4.7-flash (`DIRECT_MAX_TOKENS`); the reference diagram text is ~1,320 tokens; a cut answer is not detected and gets cached. `normaliseDescription` puts a 6.8 KB markdown spec on one line. Refine/complete reject a diagram over `MAX_DIAGRAM_CHARS` (4000).
4. The connect pass sends the full description; the route rejects a request over 2000 chars with 400 (apps/drop/src/routes/connect.ts readBody), so with `?nolimit` it never runs, and the client hides the server's reason behind "Connectors not configured". Connect output budget `maxConnectTokens` is too small for an AI Agent `with` line (~500 tokens).
5. Readiness says only "Shape only — 2 steps need configuration" for a draft with plain tasks and a code-less error boundary.

## Global Constraints

- No new dependencies. TypeScript strict, zero Biome findings, all tests green (`pnpm --filter @bpmnkit/drop exec vitest run`, core tests when core changes, `tsc --noEmit -p tsconfig.json` and `-p tsconfig.client.json` in apps/drop).
- Without `?nolimit`, request/response caps stay as they are (2,000-char description, 600-token glm output, 2,000-char connect request).
- The system prompt is one fixed prefix (prompt cache): nothing per-request goes into it.
- The live model cannot be called here; changes are verified structurally (prompt text, parsing, routes with a fake AI binding). Say so in reports.
- Every commit: dated (2026-10-19) entry at the top of `doc/progress.md`. Changeset for `@bpmnkit/core` when the guide changes (apps/drop is private: no changeset).
- Comments explain why. Commit trailers as in the dispatch.

## Review Focus

1. The guide's new example must parse with zero problems into an ad-hoc sub-process holding a tool with documentation and an annotation — a guide that teaches broken syntax is worse than none.
2. Removing the REST rule must not stop a description that *does* say what happens on failure from getting its boundary (the `failure` gap rule keeps that).
3. A cut-off answer must not be cached and must be visible; an answer that finished normally behaves exactly as before.
4. `?nolimit` must reach every route the page calls for one draft (generate, complete/refine, connect); without it every cap is unchanged.
5. Prompt edits change the existing recorded-answer tests' inputs only — those tests read recorded answers, so they must still pass unchanged.

---

### Task 1: The prompt teaches agents, tools, notes and given ids; no blanket REST boundary

**Files:**
- Modify: `packages/core/src/bpmn/process-text.ts` (PROCESS_TEXT_GUIDE), `apps/drop/src/lib/generate.ts` (GENERATE_SYSTEM_PROMPT), `apps/drop/src/lib/check.ts` (gap rules)
- Test: core process-text guide tests (find the existing one that checks the guide's examples parse), `apps/drop/tests/generate.test.ts`, `apps/drop/tests/check.test.ts`
- Docs: `.changeset/` (core patch), `doc/progress.md`

**Interfaces:** Produces only prompt text and gap rules; no signature changes.

- [ ] **Step 1: Failing tests.**
  - Core: `PROCESS_TEXT_GUIDE` lists `adhoc` among the kinds, and every example diagram line block in the guide parses with `parseProcessText` to zero problems; the ad-hoc example yields an `adHocSubProcess` whose child service task has documentation, plus one text annotation.
  - Drop `generate.test.ts`: `GENERATE_SYSTEM_PROMPT` does not contain `A REST call gets a boundary:error`; it contains the agent rule and the given-ids rule (assert on stable fragments, e.g. `inside=` and `ids the description gives`).
  - Drop `check.test.ts`: a request naming "REST Outbound connector" with no failure wording yields no gap of kind `rest` (the kind no longer exists); a request containing "AI agent" whose draft has no ad-hoc sub-process yields a gap of kind `agent`; a request asking for "annotations"/"annotate" whose draft has none yields kind `note`; the existing `failure` cases still pass.
- [ ] **Step 2: Run, see them fail.**
- [ ] **Step 3: Implement.**
  - Guide: add `adhoc` to the Kinds line; add a short example (about four lines) after the existing ad-hoc/doc lines, e.g. `ask[start Question asked] > agent[adhoc Answer with tools] > review[user Review answer] > done[end Answered]`, `users[service Look up users | inside=agent]`, `doc users: Returns the list of sample users`, `note agent: Picks a tool by its description`. Keep the guide's other content.
  - Drop prompt: replace the REST sentence with: a boundary:error only where the description says what happens when a step fails; an AI agent that chooses among tools is one `adhoc` node and each tool a `service` node with `inside=<agent id>` and a `doc` line, never a step in the flow; each annotation the description asks for is a `note` line; use the ids the description gives, otherwise short lowercase ids (rewrite the existing ids sentence accordingly).
  - check.ts: remove the `rest` rule; add `agent` (asks `/\bai agent\b|\bagentic\b|\bad-hoc\b/i`, has adHocSubProcess, change: model the agent as an adhoc node with its tools as service nodes inside it) and `note` (asks `/\bannotat(?:e|ion|ions)\b/i`, has textAnnotation, change: add each annotation the description asks for as a note line). Follow the existing rule shape and helpers.
- [ ] **Step 4: Run** drop tests (`pnpm --filter @bpmnkit/drop exec vitest run`), core tests touching process text (`pnpm --filter @bpmnkit/core exec vitest run tests/<process-text tests>`), Biome, both drop tsconfigs. All green; the recorded-answer tests unchanged.
- [ ] **Step 5: Commit** `fix(drop,core): teach ad-hoc agents and notes; no blanket REST boundary`.

### Task 2: Long descriptions get room and a visible cut-off

**Files:**
- Modify: `apps/drop/src/lib/generate.ts`, `apps/drop/src/routes/generate.ts`, `apps/drop/src/client/generate.ts`
- Test: `apps/drop/tests/generate.test.ts`, `apps/drop/tests/generate-route.test.ts`

**Interfaces:**
- Consumes: `NO_LIMIT_PARAM`, `maxDescriptionChars(params)` (already in lib/generate.ts).
- Produces: `normaliseDescription(description: string, keepLines?: boolean): string` (keepLines: collapse runs of spaces/tabs within a line and blank-line runs, keep single newlines); `maxTokensFor(model: string, long?: boolean): number` (long → `GENERATE_MAX_TOKENS`); `maxDiagramChars(params: URLSearchParams): number` (`MAX_DIAGRAM_CHARS`, or `MAX_LONG_DIAGRAM_CHARS = 16_000` with `?nolimit`); `readAiEvent` also returns `finish?: string` from `choices[0].finish_reason`; the `done` event gains `truncated?: true`.

- [ ] **Step 1: Failing tests.**
  - `normaliseDescription("# A\n\n\n1.  x   y\n2. z", true) === "# A\n\n1. x y\n2. z"`; without `true` unchanged behaviour.
  - `maxTokensFor("@cf/zai-org/glm-4.7-flash", true) === 2048`; `false`/omitted → 600.
  - `maxDiagramChars` 4000 / 16000.
  - `readAiEvent('{"choices":[{"delta":{},"finish_reason":"length"}]}')` has `finish: "length"`.
  - Route with `?nolimit`: the model call gets `max_tokens: 2048` and the user message keeps the description's line breaks; without it, `max_tokens` is the profile's and whitespace is collapsed as today.
  - Route: a stream whose last chunk has `finish_reason: "length"` ends with `{ done: true, cached: false, truncated: true }` and a second identical request calls the model again (not cached); a normal stream's done event has no `truncated` and is cached as before.
  - Route with `?nolimit`: a refine/complete with a 10,000-char diagram is accepted; without, still 400.
- [ ] **Step 2: Run, see them fail.**
- [ ] **Step 3: Implement** in the route (`answer`) and lib; client: when `done.truncated`, show in the status line "The answer was cut off at the model's output limit — the diagram may be incomplete." (reuse the existing status/error element; read how `done` is handled).
- [ ] **Step 4: Run** drop tests, Biome, both tsconfigs.
- [ ] **Step 5: Commit** `fix(drop): room for long descriptions; a cut-off answer is shown, not cached`.

### Task 3: The connect pass runs for long descriptions and says why when it can't

**Files:**
- Modify: `apps/drop/src/routes/connect.ts`, `apps/drop/src/lib/connect.ts`, `apps/drop/src/client/generate.ts`
- Test: the existing connect route test file in `apps/drop/tests/` (find it), plus a client-free unit test for any new helper

**Interfaces:**
- Produces: `maxConnectRequestChars(params: URLSearchParams): number` (2000, or infinite with `?nolimit`); `maxConnectTokens(tasks: number, agents?: number): number` — each AI Agent card selected adds 600 tokens; cap raised to 3000.

- [ ] **Step 1: Failing tests.**
  - Route: a 6,000-char `request` is 400 without `?nolimit` (message unchanged) and accepted with `/drop/api/connect?nolimit`.
  - `maxConnectTokens(3) === 450` (unchanged), `maxConnectTokens(5, 1) === 1250`, never above 3000.
  - The route passes the agent count when a selected card is the AI Agent sub-process template (test via the fake AI binding's recorded `max_tokens`).
- [ ] **Step 2: Run, see them fail.**
- [ ] **Step 3: Implement.** Client: the connect call uses `/drop/api/connect?nolimit` when the page has `?nolimit` (same pattern as `generatePath`); when the connect response is not OK, the "Connectors not configured" row includes the server's `error` text (keep the 404-feature-off case quiet as today if it is; read the code).
- [ ] **Step 4: Run** drop tests, Biome, both tsconfigs.
- [ ] **Step 5: Commit** `fix(drop): connect long descriptions; show why connectors were not configured`.

### Task 4: Readiness names what keeps a draft from running

**Files:**
- Modify: `apps/drop/src/lib/readiness.ts`
- Test: `apps/drop/tests/readiness.test.ts` (or the existing readiness test file)
- Docs: `apps/landing/src/content/docs/guides/drop.md` (one paragraph on long specs: `?nolimit`, larger budget, the cut-off notice; regenerate docspack with `pnpm --filter @bpmnkit/docspack build`), `doc/progress.md`

**Interfaces:** `readiness(...)` unchanged signature; its shape-only `missing` list gains entries.

- [ ] **Step 1: Failing tests.** A draft with a plain `task` lists it in `missing` ("<name>: a plain task does nothing when run — make it a service, user or script task"); an error boundary event with no error code lists "<name>: an error boundary needs an error code". The reference `expected.bpmn` still reads "Ready to deploy (8.10)". Use exact strings that match the file's existing message style (read it first; adjust the wording to the style, keep the meaning).
- [ ] **Step 2: Run, see them fail.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** drop tests, docspack tests, Biome, both tsconfigs.
- [ ] **Step 5: Commit** `fix(drop): readiness names plain tasks and code-less error boundaries`.
