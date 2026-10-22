# Zeebe coverage gaps, agent performance and a same-input comparison page — analysis and plan

Date: 2026-10-22. Status: Part A, week 1 (B1, B2, B4, C1, C2) week 2 (B3, B5, C3, C5, the D1 scorer) and week 3 (B7, B8, C4, D1) are **done**, but the D1 page must not ship until D1b below is fixed; C6 was dropped (see its row). Everything else is open.

Effort scale: **S** < ½ day, **M** ½–2 days, **L** > 2 days. Paths are relative to the repo root;
`core/` means `packages/core/src/`.

## TL;DR

1. **Coverage gaps: most can close in about two weeks of focused work.** Eight of the eleven gaps
   are S or M, and the plumbing they need already exists: the descriptor-derived placement table
   (`core/bpmn/zeebe-placement.ts`), lint rules for listeners and forms (`camunda-compat.ts`), and
   a typed writer (`zeebeExtensionsToXmlElements`). The highest-value items are reader symmetry,
   call-activity variable mapping, multi-instance on tasks, and exposing the edit API through
   MCP `update_element` (today it accepts only `name` and `type`).
2. **Agent performance: the gaps are lookup and iteration cost, not runtime speed.** Layout runs at
   a 0.28 ms median and is not a lever. The levers are:
   - the homepage benchmark still counts builder failures that have since been fixed;
   - a ~10k-token README sent as the builder prompt;
   - docs lookup that fails in a fresh checkout;
   - template defaults that cost closeness points;
   - annotation placement limited to above/below, which costs layout points.

   Five cheap wins are listed in Part C.
3. **A comparison page: yes, as a narrow "same input, different routes" page under `/compare`,** built
   at build time from committed recordings, with a hand-written deterministic builder script as
   the reference row. Phase 1 needs no new LLM spend. Competitors come later, as a separate,
   reviewed lane.

## Part A — done in this change

- **Bug:** `buildMultiInstance` dropped `completionCondition`. It now writes
  `bpmn:completionCondition` as a `tFormalExpression` (`core/bpmn/bpmn-builder.ts`). Regression
  test in `packages/core/tests/builder-zeebe-options.test.ts`.
- **Edit API fields:** `applyBpmnOperations` `update` patches now set `assignee`, `candidateGroups`,
  `candidateUsers`, `dueDate`, `followUpDate`, `priority` and `properties`. Each is placement-checked:
  assignment on a service task is refused.
  - `correlationKey` writes the `zeebe:subscription` on the referenced `bpmn:message`, or on the
    element if it still carries its own. An element with no message is reported as a problem.
  - The compact format carries the user-task fields and `properties` both ways (`compactify` and
    `expand`). `correlationKey` is patch-only (`ElementPatch` in `core/bpmn/operations.ts`),
    because compact elements have no messages.
  - Tests are in `packages/core/tests/full-operations.test.ts`.

## Part B — Zeebe coverage gaps

### Analysis

The model keeps Zeebe data as raw `XmlElement` trees on `extensionElements`. That is what makes
round-trip safe: unknown and vendor content survives, as the roundtrip corpus, foreign-attributes
and interchange-fidelity tests show. The cost is that three code paths each re-implement typed
access:
- the builder, through `zeebeExtensionsToXmlElements`;
- the edit operations, through `full-operations.ts` setters;
- template application, through `connectors/apply-element.ts`.

The reader (`getZeebeExtensions`, `core/bpmn/utils.ts:187`) reads only taskDefinition, ioMapping,
taskHeaders, properties, formDefinition (formId), agentDefinition and calledDecision. Write-then-read
therefore loses assignment, schedule, priority, subscription, userTask, adHoc and calledElement.

**Recommendation: don't retype the model.** Grow one typed accessor module, a symmetric read and
write per extension that mutates the tree in place and calls `assertZeebePlacement`. Migrate the
three paths onto it gradually. A fluent `zeebe(el).assignment.set()` is optional sugar on top.

### Gap table (prioritised by value to agents ÷ effort)

| # | Gap | Effort | Value | Depends on |
|---|---|---|---|---|
| B1 | `getZeebeExtensions` reader asymmetric with the writer | S | High (bug class) | — |
| B2 | Call activity: no ioMapping, taskHeaders, properties, `propagateAllParentVariables`, `bindingType`, `versionTag` | S–M | High | B1 |
| B3 | Multi-instance only on sub-process/transaction/ad-hoc; `outputCollection` / `outputElement` dropped; compact and process-text carry only collection/element/sequential | M | High | — |
| B4 | Edit API not reachable via MCP `update_element` (accepts only `name` and `type`, `apps/proxy/src/mcp-server.ts`); `ELEMENT_SCHEMA` and `sdk-spec.ts` list only jobType/formId/decisionId/calledProcess | S–M | High for agents | — |
| B5 | Execution and task listeners: no builder option (lint already exists, `camunda-compat.ts` ~1024–1266) | M | Medium–High | B1 |
| B6 | Edit API: no event-definition edits (message name, error code, timer cycle/date, condition), listeners, multi-instance | M–L | High for agents | B3, B5 |
| B7 | Forms: `formKey`, `externalReference`, `bindingType`/`versionTag` (S); embedded `zeebe:userTaskForm` (M) | S + M | Medium | B1 |
| B8 | Conditional events: no `condition` / `zeebe:conditionalFilter` in the builder; compact `conditional` emits an empty definition that bpmnlint flags | M | Medium | — |
| B9 | Template bindings missing: calledElement, calledDecision, userTask, formDefinition, assignmentDefinition, taskSchedule, priorityDefinition, script. An unknown binding is a hard validation error (`connectors/validate.ts`) | L total (S each once typed) | Medium | B2, B7 |
| B10 | `zeebe:linkedResources` in the builder (templates only today) | S | Low (RPA only) | — |
| B11 | Data elements in the builder (deliberately exempt, `builder-coverage.ts`) | M | Low (no runtime effect) | — |

### Tasks (phase B-1: the first ~week)

Each task is TDD (failing test first), adds a `doc/progress.md` entry, and must pass
`pnpm biome check .`, `tsc` for core, and `npx vitest run` in `packages/core`.

**B1 — reader symmetry (S).**
- Modify: `core/bpmn/utils.ts` (`getZeebeExtensions`), and `core/bpmn/zeebe-extensions.ts` if
  `ZeebeExtensions` lacks a `calledElement` field.
- Test: new `packages/core/tests/zeebe-extensions-roundtrip.test.ts`. For every field of a fully
  populated `ZeebeExtensions`, `getZeebeExtensions(zeebeExtensionsToXmlElements(ext))` deep-equals
  `ext`. Write it table-driven, so a field added to the writer without a reader fails the test.

**B2 — call activity (S–M).**
- Modify: `CallActivityOptions` and `makeCallActivityEl` in `core/bpmn/bpmn-builder.ts` (~190, ~958).
  Add `ioMapping`, `taskHeaders`, `zeebeProperties`, `propagateAllParentVariables`, `bindingType`
  (`"latest" | "deployment" | "versionTag"`) and `versionTag`. Write through the typed writer, not
  `unknownElements`.
- Test: `builder-zeebe-options.test.ts` gets one case per option. Asserts: the XML attribute or
  child exists, a parse-back keeps it, and `analyzeCamundaCompat` at 8.7 flags
  `propagateAllParentVariables`, as it does today.

**B3 — multi-instance everywhere (M).**
- Modify: `MultiInstanceOptions` gets `outputCollection?` and `outputElement?`. Add `multiInstance?` to
  the service, user, script, send, receive, business-rule and call-activity option types, through
  one shared helper. Widen `CompactElement.multiInstance` and process-text in the same way.
- Test: one parameterised case per task type, with a round-trip through builder, export and
  parse; plus compact `expand` and `compactify` keeping `outputCollection` and `completionCondition`.

**B4 — expose edits to agents (S–M).**
- Modify: `apps/proxy/src/mcp-server.ts`. `update_element` forwards a `patch` to
  `applyBpmnOperations` (strict, so unknown keys and misplaced extensions come back as tool errors).
  Add the new fields to `ELEMENT_SCHEMA`. In `apps/proxy/src/sdk-spec.ts`, list the fields and fix
  the stale "ELK layout" wording.
- Test: proxy MCP test. Update the assignee and correlation key of a parsed fixture through the
  tool, and assert the exported XML. A misplaced field (assignee on a service task) returns an
  error naming `zeebe:assignmentDefinition`.

**B5 — listeners (M).**
- Modify: `ZeebeListener { eventType; type; retries? }`. Add `executionListeners?` on all
  activity, event and gateway options, and `taskListeners?` on `UserTaskOptions`. Add the writer,
  the reader (B1 pattern), and patch fields in `full-operations.ts`, replacing wholesale like headers.
- Test: XML shape; placement refusal for `taskListeners` on a service task; and an existing
  camunda-compat listener rule firing on a builder-made diagram.

Phase B-2 (next): B7, B8, then B6, then B9, in that order. B10 and B11 only on request.

## Part C — agent performance gaps

### Measured gaps

| Source | Metric | BPMN Kit | Best other | Note |
|---|---|---|---|---|
| Bake-off rerun, 2026-10-18 (`doc/agent-bpmn-bakeoff-rerun.md`) | Time to passing gate | 132 s (best 110 s) | 113 s (bpmn-js CLI) | Target ≤ 100 s not met; the CPT gate itself takes ~43 s |
| same | Closeness | 87.3 | 89.6 | The committed reference `expected.bpmn` itself scores 87.7 |
| same | Layout (of 15) | 7.7 | 9.5 | Mean shape offset 194 px |
| same | Cost | not measured | $0.47 | Only total tokens captured (103,665) |
| Homepage benchmark (`apps/landing/src/generated/ai-benchmark.ts`) | Builder usable | 9 / 12 | compact 5 / 5 | The 3 failures are fixed bugs; see below |
| same | Builder input tokens (median) | 10,652 | compact 2,415 | The prompt is the whole core README (~20 KB) |
| Layout runtime (`doc/bpmn-auto-layout-evaluation.md`) | Median / p90 / max | 0.28 / 1.4 / 8 ms | bpmn-auto-layout 4.4 / 46 / 1,267 ms | Not a gap |

### Root causes

- **Builder compile failures.** The recordings (`apps/demo/recordings/`, 1–3 July) failed on
  `BranchBuilder.subProcess` not existing, and on a swapped `subProcess(id, opts, fn)` argument
  order. `BranchBuilder.subProcess` and `adHocSubProcess` now exist (`core/bpmn/bpmn-builder.ts`
  ~1693, ~1733), so the homepage understates the builder. Argument-order mistakes remain possible.
- **Prompt size.** The whole README is sent on every call.
- **Lookup.** Per the bake-off analysis:
  - `npx bpmnkit-docs ask` fails in a fresh checkout;
  - retrieval returns the wrong chunk for "apply an element template";
  - template property ids are hard to find, so agents fell back to `getTemplate()`.
- **Closeness.** `applyTemplates` writes template defaults the blueprint omits, and the
  `ignoreNullValues` question on GET is undecided.
- **Layout.** Annotation sides are only `"above" | "below"` (`core/layout/annotations.ts:115`), but
  the spec asks for left or right. The tool grid places tools in creation order.
- **Sub-process annotations.** They get no DI shape; this cost one 44 s retry in one run.

### Improvements, ordered

| # | Change | Files | Expected effect | Effort | Measure with |
|---|---|---|---|---|---|
| C1 | Re-run the frozen builder code against the current core; re-record the builder runs if possible | `scripts/bench-ai-replay.mjs`, `apps/demo/recordings/` | Removes failures that are already fixed from the homepage | S (+ LLM cost to re-record) | `scripts/bench-ai-generation.mjs` |
| C2 | Sub-process annotations get a DI shape | `core/bpmn/bpmn-builder.ts` (`textAnnotations` sites), `core/layout/` | Removes a lint retry | S | `tests/bakeoff-ai-agent-chat.test.ts` plus a regression test |
| C3 | `applyTemplates({ omitDefaults: true })` | `core/connectors/apply-element.ts` and the builder's `applyTemplates` | Recovers config closeness points | S–M | bake-off scorer |
| C4 | Builder prompt: a generated short API reference (signatures plus one example per element) instead of the README | `scripts/generate-readmes.mjs` or a new generator; demo prompt assembly | ~10k → ~2–3k input tokens | M | `bench-ai-generation.mjs` |
| C5 | `bpmnkit-docs ask` works in a fresh checkout; add task-shaped recipe chunks (apply a template, set a start form, set an assignee) | `packages/docspack`, `apps/landing/src/content/docs/` | Biggest time lever according to the bake-off analysis | M | bake-off rerun |
| C6 | ~~Builder argument-order guard~~ — not needed: the builder already accepts the swapped order (`resolveSubProcessArgs`); the July failure predates that | — | — | — | — |
| C7 | Annotation sides `left` / `right` | `core/layout/annotations.ts`, `AnnotateOptions` | Layout score | M | bake-off layout score |
| C8 | Layout closeness research: per-element offset diagnosis against the canonical layout, then `placeGrid` order hints | `core/layout/semantic/place.ts`, `core/layout/bench.ts` | Layout 7.7 → ~9 | L | `scripts/bench-layout.mjs` |
| C9 | Cost re-measure, ≥ 5 runs per side, tokens split in and out | external harness | Needed before any ≤ $0.45 claim | M (paid) | bake-off scorer |
| C10 | Decide `ignoreNullValues` on GET | maintainer decision | Closeness only | S | scorer |

Cheap wins: C1, C2, C6, and the documentation half of B4. Then C3, C4 and C5. C7–C9 are research
or cost money.

## Part D — same-input comparison page

### Is it worth it?

Yes, in a narrow shape. Homepage section 09 (`apps/landing/src/pages/index.astro`, `#ai-benchmark`)
shows medians and ratios, never the artefact. A side-by-side lets an evaluator see the prompt, the
source each route produced (raw XML, compact JSON, builder script, plan) and the rendered diagram,
with scores next to each other. A deterministic reference row, a hand-written builder script with
no AI, answers "is AI even needed?" honestly. If the reference wins on closeness and time, the
page should say so; that candour is what makes the page credible.

### Shape

- Route: `apps/landing/src/pages/compare/same-input.astro`, linked from `compare/index.astro`.
  Add a `[scenario]` route once there are three or more scenarios.
- Per scenario, one row per route:
  - reference builder (no AI);
  - LLM to raw XML;
  - LLM to compact JSON;
  - LLM to builder script;
  - LLM to `ProcessPlan` compiled by `casen synth` (phase 2).
- Columns:
  - static SVG;
  - source excerpt plus a link to the full source;
  - output and input tokens, wall time, and cost from a dated price table;
  - parses, DI complete, lint errors;
  - closeness to the reference;
  - `casen test` pass (phase 3).
  Failed runs stay on the page as rows.
- Data:
  - a new `scripts/build-compare-data.mjs` reads the recordings and writes
    `apps/landing/src/generated/compare/<scenario>/<route>.{svg,bpmn,json}`;
  - outputs are committed, so CI never calls an LLM;
  - every row shows the model id and the recording date.
- Design: `--bpmnkit-ds-*` rules. Radius 0, 1px hairlines, one accent, mono labels, and the grid
  as one bordered box. Diagrams are out of scope for the token rules.

### Phases

**D1b — blocker found in week 3: the scorer cannot compare free-form runs (M).** The scorer
matches elements by id, then by type and name. The recordings come from free-form prompts, so models
choose their own ids and names, and every AI route lands on the scorer's floor (~15/100) while the
reference scores 100. That measures naming, not modelling. Fix before publishing the page: match by
graph structure instead (element type, position in flow order, gateway fan-out and fan-in, and the
event definition), with name similarity only as a tie-breaker. Re-score, and keep the id/name mode for
bake-off-style specs where ids are given.

**D1 — no new LLM spend (M + M + M).**
- A TS closeness scorer: element type, id/name matching, flow matching, and an optional
  position term. It lives in `scripts/lib/closeness.mjs` (or `core/bpmn/` if it should ship), with
  unit tests, and its definition is published on the page.
- The data script, built on the existing 12 recordings.
- Reference scripts for quote-to-cash (modelled on `packages/core/tests/fixtures/bakeoff/build.ts`),
  loan-approval and kyc. They must be written from the scenario prompt, not from model output, to
  avoid circularity.
- The page, plus `doc/progress.md` and `doc/features.md` entries.

**D2 — new recordings (M + API cost).**
- Add `compact-json` and `plan` panels to the recording format; old keys stay valid.
- Record ≥ 3 runs per route, and report median, best and worst.
- Add a freshness warning when the newest recording is older than ~90 days.

**D3 — execution and competitors (L).**
- A `casen test` column on reebe-wasm.
- An optional competitor lane (bpmn-sdk, the bpmn-js CLI) using each tool's documented usage and
  an equal-effort prompt, with pinned versions, the author invited to review before publishing,
  and an omitted row rather than a guessed one when a run cannot be reproduced.

### Risks

| Risk | Mitigation |
|---|---|
| Stale numbers | Date and model on every row; freshness warning |
| Model drift | Medians plus spread, ≥ 3 runs |
| Self-flattery | Reference row and documented losses on the page |
| Fairness | Separate lane, author review, our concessions stated (bpmn-sdk's descriptor fidelity) |

## Sequencing

1. **Week 1:**
   - Coverage: B1, B2, B4 (the high-value agent-facing set).
   - Performance cheap wins: C1, C2, C6.
2. **Week 2:**
   - Coverage: B3, B5.
   - Performance: C3, C5.
   - Comparison page: D1 starts, beginning with the scorer, which C8 and the page share.
3. **Week 3:**
   - Comparison page: finish D1.
   - Performance: C4.
   - Coverage: B7, B8.
   - Then decide D2 spend, and whether to do B6 and B9 or C7 and C8 next.

## Global constraints (from `CLAUDE.md`)

- Done means zero Biome warnings, zero type errors, passing tests; every fix gets a regression test.
- Every change gets a dated `doc/progress.md` entry; features also go in `doc/features.md`.
- After editing `apps/landing/src/content/docs/`, run `pnpm --filter @bpmnkit/docspack build`.
- No hard-coded brand colours on the page: `var(--bpmnkit-*, <hex>)`.
- devDependencies go in the root `package.json`; prefer writing the scorer in-repo over adding a package.

## Review focus (failure modes no task above tests yet)

1. **A message shared by several elements.** `correlationKey` on one changes it for all of them;
   the B4 tool description must say so. Test: two catch events on one message, edit one, both read
   the new key.
2. **Clearing a value.** No patch can remove an assignee or a schedule today (empty string writes
   `""`). Decide the semantics before B4 exposes patches to agents. Test: `assignee: ""` removes
   the attribute, and the extension disappears when it is empty.
3. **FEEL vs literal priority.** `priority: "=x"` stays a string, `80` stays a number, and
   `"80"` becomes 80 after a compact round trip. Test this in the compact suite.
4. **Re-applying templates after B9.** Stale bound values must be removed, following the
   `zeebe:adHoc` ownership pattern. Test: apply v1, then v2 without a binding, and assert the
   binding is gone.
5. **Comparison-page circularity.** A reference script tuned to beat the recorded runs. Mitigation:
   write it from the prompt and commit it before scoring.

## Open questions for the maintainer

- Should the comparison page launch with competitors, or only after D3?
- Who writes the reference scripts, and is the closeness definition acceptable?
- `ignoreNullValues` on GET: follow the canonical blueprint or the connector's v18 schema?
- Budget for re-recording: C1, and D2's ≥ 3 runs × 5 routes × 3 scenarios = 45 runs.
