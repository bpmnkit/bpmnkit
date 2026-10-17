# Agent BPMN Bake-off Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An agent using BPMN Kit rebuilds Camunda's "AI Agent Chat With Tools" process from the bake-off spec in one builder script, with no `c8ctl` step, and drop states whether its output is executable.

**Architecture:** Phase A closes the builder's expressiveness gaps in `@bpmnkit/core` and adds one in-process `applyTemplates` call, so a builder script carries the whole spec. Phase B makes the answers findable: working `bpmnkit-docs`, a recipe page with ranking tests, `casen connector apply` / `show --filter`, and an updated Claude skill. Phase C teaches drop's line DSL the missing constructs and adds an executability verdict. Phase D reruns the bake-off.

**Tech Stack:** TypeScript (strict), Vitest, Biome, pnpm + Turborepo, Cloudflare Worker (drop).

**Spec:** `doc/agent-bpmn-bakeoff-analysis.md` (the analysis, with file:line evidence) and the bake-off spec it cites (`HanselIdes/bpmn-js-cli@camunda-executable:experiments/ai-agent-bpmn`).

## Global Constraints

- Target platform for every fixture: `modeler:executionPlatform="Camunda Cloud"`, `executionPlatformVersion` `8.10.0`.
- Templates: `io.camunda.connectors.HttpJson.v2` version `18`; `io.camunda.connectors.agenticai.ai-agent-subprocess.v2` version `1` (both already bundled in `packages/core/src/connectors/templates/generated.ts`).
- No new runtime or dev dependencies. Dev dependencies go in the root `package.json` only.
- Zero `tsc` errors, zero Biome findings, all existing tests pass: `pnpm turbo typecheck check test`.
- Every change adds a line to `doc/progress.md`. Feature additions go in `doc/features.md`.
- After any edit under `apps/landing/src/content/docs/`, run `pnpm --filter @bpmnkit/docspack build`.
- Existing builder output must not change for scripts that do not use the new options (ids, XML, layout). `tests/stable-ids.test.ts` and `tests/roundtrip-corpus.test.ts` must pass unchanged.
- Public API changes are checked with `pnpm check:api`; update its snapshot in the same commit.

## Review Focus

1. **`formId` on a start event declared outside `ProcessBuilder`** (inside a `branch()` or an event sub-process). The form must be emitted from all three `startEvent` methods, not only the top-level one. Test in Task 1.
2. **A label that differs from the branch id.** `branch("yes", b => b.label("Yes"))` must give the flow the name "Yes". The stable flow id must still derive from the branch id, so adding a label never renames a flow. Test in Task 2.
3. **Multi-line and XML-hostile FEEL values** (newline, `"`, `'`, `&`, `>`) through `applyTemplates` and `Bpmn.export`. They must come back from `Bpmn.parse` byte-identical: a real newline, not `\n`. Test in Task 3.
4. **A template version that is not bundled** (`io.camunda.connectors.HttpJson.v2@17`). It must return a problem that names the bundled versions, not throw and not silently use v18. Test in Task 3.
5. **An explicit `flowId` that collides** with an element or flow id. `build()` must throw an error naming both, not emit duplicate ids. Test in Task 2.

---

## Phase A — the builder says the whole spec

### Task 1: Start-event form and user-task mappings

**Files:**
- Modify: `packages/core/src/bpmn/bpmn-builder.ts`: `StartEventOptions` (66-88), `UserTaskOptions` (136-160), `makeUserTaskEl` (~818), the three `startEvent` methods (`BranchBuilder` ~1363, `SubProcessContentBuilder` ~1802, `ProcessBuilder` ~2549)
- Test: `packages/core/tests/builder-zeebe-options.test.ts` (new)

**Interfaces:**
- Produces: `StartEventOptions.formId?: string`; `UserTaskOptions.ioMapping?: { inputs?: {source: string; target: string}[]; outputs?: {source: string; target: string}[] }`, plus `taskHeaders?: Record<string,string>`, `zeebeProperties?: {name: string; value: string}[]`, `modelerTemplate?`, `modelerTemplateVersion?`, `modelerTemplateIcon?: string`. These have the same shapes as `ServiceTaskOptions`.

- [ ] **Step 1: Write the failing tests**

```ts
it("emits zeebe:formDefinition on a top-level start event", () => {
  const xml = Bpmn.export(Bpmn.createProcess("p").startEvent("s", { name: "S", formId: "ai-agent-chat-initial-request" }).endEvent("e").build())
  expect(xml).toContain('<zeebe:formDefinition formId="ai-agent-chat-initial-request"/>')
})
it("emits the form on a start event inside an event sub-process", () => { /* same assertion via SubProcessContentBuilder.startEvent */ })
it("maps user-task inputs after zeebe:userTask", () => {
  const xml = Bpmn.export(Bpmn.createProcess("p").startEvent("s").userTask("u", {
    name: "User Feedback", formId: "ai-agent-chat-user-feedback", zeebeUserTask: true,
    ioMapping: { inputs: [{ source: "=agent.responseText", target: "responseText" }] },
  }).endEvent("e").build())
  expect(xml).toMatch(/<zeebe:userTask\/>[\s\S]*<zeebe:formDefinition[\s\S]*<zeebe:input source="=agent.responseText" target="responseText"\/>/)
})
it("keeps a start event's modelerTemplate inside a branch", () => { /* BranchBuilder.startEvent currently drops it */ })
```

- [ ] **Step 2: Run them and see them fail**: `pnpm --filter @bpmnkit/core exec vitest run tests/builder-zeebe-options.test.ts`. Expected: 4 failures (unknown option / missing element).
- [ ] **Step 3: Implement.** Pass `formDefinition: { formId }` and the user-task extensions through `zeebeExtensionsToXmlElements` in each factory. Reuse `buildServiceTaskExtensions`'s mapping code instead of copying it. Element order must follow `src/bpmn/zeebe-placement.ts`. Wire `zeebeProperties` and `modelerTemplate*` into the two start-event methods that drop them.
- [ ] **Step 4: Run the new file, then `pnpm --filter @bpmnkit/core test` and `pnpm --filter @bpmnkit/core check:placement`.** Expected: all PASS.
- [ ] **Step 5: Commit** `feat(core): start-event forms and user-task mappings in the builder`

### Task 2: Flow labels and explicit flow ids on branches

**Files:**
- Modify: `packages/core/src/bpmn/bpmn-builder.ts`: `BranchBuilder` (~1140-1300; `addElement` 1226, `connectTo` 1257)
- Modify: `packages/core/src/bpmn/stable-ids.ts` (preserve explicit ids; build the discriminator from the branch id, not the label)
- Test: `packages/core/tests/builder-branch-flows.test.ts` (new)

**Interfaces:**
- Produces: `BranchBuilder.label(text: string): this` and `BranchBuilder.flowId(id: string): this`. Both apply to the branch's first flow, like `condition()`.

- [ ] **Step 1: Write the failing tests**

```ts
const gw = () => Bpmn.createProcess("p").startEvent("s").exclusiveGateway("g", { name: "User satisfied?" })
it("names the flow with label() and keeps the id from the branch id", () => {
  const a = gw().branch("yes", b => b.condition("=ok").endEvent("e1")).branch("no", b => b.defaultFlow().endEvent("e2")).build()
  const b = gw().branch("yes", b => b.label("Yes").condition("=ok").endEvent("e1")).branch("no", b => b.label("No").defaultFlow().endEvent("e2")).build()
  const flows = (d) => d.processes[0].flowElements.filter(f => f.type === "sequenceFlow")
  expect(flows(b).map(f => f.name)).toContain("Yes")
  expect(flows(b).map(f => f.id).sort()).toEqual(flows(a).map(f => f.id).sort())
})
it("keeps an explicit flowId, also with connectTo", () => {
  const d = gw().branch("no", b => b.flowId("Flow_No").label("No").condition("=x").connectTo("g")).branch("yes", b => b.defaultFlow().endEvent("e")).build()
  expect(d.processes[0].flowElements.some(f => f.id === "Flow_No" && f.name === "No")).toBe(true)
})
it("throws when a flowId collides", () => {
  expect(() => gw().branch("x", b => b.flowId("g").endEvent("e")).build()).toThrow(/Flow id "g" .*already used/)
})
```

- [ ] **Step 2: Run, expect 3 failures** (`label is not a function`).
- [ ] **Step 3: Implement.** Add `pendingLabel` and `pendingFlowId` beside `pendingCondition`. Use `this.pendingLabel ?? this.branchName` at 1226 and 1257. Mark explicit ids so that `assignStableFlowIds` adds them to its `preserve` set. The discriminator keeps using the branch id: store it on the flow before naming, for example in a builder-private map, and do not write it into the XML.
- [ ] **Step 4: Run the new file plus `tests/stable-ids.test.ts` and `tests/bpmn-builder.test.ts`.** Expected: PASS, with no snapshot changes.
- [ ] **Step 5: Commit** `feat(core): branch label() and flowId()`

### Task 3: `applyTemplates`, in-process template values with did-you-mean

**Files:**
- Create: `packages/core/src/connectors/apply-many.ts`
- Modify: `packages/core/src/connectors/index.ts` (export it), `packages/core/src/connectors/catalog.ts` (version lookup when needed)
- Test: `packages/core/tests/connectors/apply-many.test.ts`

**Interfaces:**
- Consumes: `applyTemplateToElement(definitions, elementId, template, values)` from `apply-element.ts:329`; `getTemplate(id)` from `catalog.ts`; `CONNECTOR_ALIASES` from `aliases.ts`.
- Produces:
```ts
export interface TemplateApplication {
  elementId: string
  /** "io.camunda.connectors.HttpJson.v2", "io.camunda.connectors.HttpJson.v2@18", or an alias such as "http" */
  template: string | ElementTemplate
  values: Record<string, string | number | boolean>
}
export interface TemplateApplicationProblem { elementId: string; message: string; key?: string; suggestion?: string }
export function applyTemplates(definitions: BpmnDefinitions, entries: TemplateApplication[]):
  { definitions: BpmnDefinitions; problems: TemplateApplicationProblem[] }
```

- [ ] **Step 1: Write the failing tests.** Use the spec's literal values:
  - `retryCount: 3, retryBackoff: "PT0S", url: "https://jsonplaceholder.typicode.com/users"` on `LookupSampleUsers` with `HttpJson.v2@18`. After export the XML contains `zeebe:modelerTemplateVersion="18"` and `<zeebe:taskDefinition type="io.camunda:http-json:1" retries="3"/>`.
  - The system prompt from the spec as a JS string with `"\n\n"` between the paragraphs. `Bpmn.parse(Bpmn.export(d))` returns an input source that contains a real two-newline paragraph break. The string never contains a backslash followed by `n`.
  - A FEEL value holding `"`, `'`, `&` and `>` (the `SearchRecipes` result expression) round-trips unchanged.
  - Key `retries` returns a problem with `key: "retries"` and `suggestion: "retryCount"`. Nearest property id by edit distance; also match on the binding name, since `retries` is the `zeebe:taskDefinition` property.
  - `HttpJson.v2@17` returns a problem whose message names `18`. The element is left untouched.
  - `boolean`/`number` values are stringified (`true` becomes `"true"`).
  - The AI Agent v2 template applied to an `adHocSubProcess` gives `isAgentic` true in `lintDiagram` (via the `io.camunda.agenticai.toolContainer` property).
- [ ] **Step 2: Run, expect failures** (module not found).
- [ ] **Step 3: Implement.** Resolve the template (id, then `id@version`, then alias) and apply the entries in order through `applyTemplateToElement`. Collect problems and add `elementId`. Pick suggestions with a small Levenshtein helper. Use an existing one if `grep -rn levenshtein packages/core/src` finds it.
- [ ] **Step 4: Run the test file and `tests/connectors/`.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(core/connectors): applyTemplates with version pinning and key suggestions`

### Task 4: Layout hints for tool grids and annotation sides

**Files:**
- Modify: `packages/core/src/bpmn/bpmn-builder.ts`: `AdHocSubProcessOptions` (~333-366), the three `annotate()` methods (~1295, ~1958, ~3102), and `build()` where `applyAutoLayout` is called (~3240, ~3284)
- Modify: `packages/core/src/bpmn/auto-layout.ts:725` (`applyAutoLayout(defs, engine, hints?)`), `packages/core/src/layout/semantic/place.ts` (`placeGrid`), `packages/core/src/layout/annotations.ts` (`naturalSide`)
- Test: `packages/core/tests/adhoc-grid-layout.test.ts` (extend), `packages/core/tests/annotation-side.test.ts` (new)

**Interfaces:**
- Produces:
```ts
AdHocSubProcessOptions.toolGrid?: { columns?: number; fill?: "row" | "column" }
annotate(elementId: string, text: string, options?: { side?: "above" | "below" }): this
export interface LayoutHints { grids?: Map<string, { columns?: number; fill?: "row" | "column" }>; annotationSides?: Map<string, "above" | "below"> }
applyAutoLayout(defs: BpmnDefinitions, engine?: LayoutEngine, hints?: LayoutHints): BpmnDefinitions
```
Hints exist only during the build. They are not written to the model or the XML.

- [ ] **Step 1: Write the failing tests.**
  - Declare four tools in the spec's order (users, recipes, joke, products) with `toolGrid: { columns: 2, fill: "column" }`. Then `x(users) === x(recipes) < x(joke) === x(products)` and `y(users) === y(joke) < y(recipes) === y(products)`.
  - `annotate("FetchSafeJoke", text, { side: "below" })` gives annotation bounds with `y` greater than the sub-process's bottom edge.
  - Without hints, the existing grid tests at `adhoc-grid-layout.test.ts:64` and `:81` still pass.
- [ ] **Step 2: Run, expect failures.**
- [ ] **Step 3: Implement.** `placeGrid` takes `fill`: column-major fills each column top to bottom, with `rows = ceil(n / columns)`. `naturalSide` uses the hint when there is one. `packAnnotations` keeps avoiding collisions on the chosen side.
- [ ] **Step 4: Run `tests/adhoc-grid-layout.test.ts tests/annotation-side.test.ts tests/semantic-layout.test.ts tests/builder-layout-integration.test.ts`.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(core): tool grid and annotation side hints for auto layout`

### Task 5: Fix `buildAiAgentSubProcess` and mark it v1

**Files:**
- Modify: `packages/core/src/bpmn/agentic.ts` (doc block 160-180, return 210-221)
- Test: `packages/core/tests/agentic.test.ts`

**Interfaces:**
- Produces: `AiAgentBuild` gains `id: string`, which echoes `AiAgentOptions.id`, with `"Agent_1"` when it is absent.

- [ ] **Step 1: Write the failing test:** `expect(buildAiAgentSubProcess({ id: "AI_Agent", tools: [...] }).id).toBe("AI_Agent")`.
- [ ] **Step 2: Run, expect failure.**
- [ ] **Step 3: Return `id`, and fix the doc example.** Add a doc sentence: this helper builds the v1 job-worker agent; for Camunda 8.10's `ai-agent-subprocess.v2`, build the ad-hoc sub-process and apply that template with `applyTemplates`. Link the Task 7 recipe.
- [ ] **Step 4: Run `tests/agentic.test.ts`.** Expected: PASS.
- [ ] **Step 5: Commit** `fix(core): buildAiAgentSubProcess returns its id; document v1 scope`

### Task 6: Bake-off acceptance fixture

**Files:**
- Create: `packages/core/tests/fixtures/bakeoff/spec.md` (the bake-off spec, verbatim, with its MIT attribution line)
- Create: `packages/core/tests/fixtures/bakeoff/build.ts` (the reference builder script an agent should be able to write; also the recipe's code sample in Task 7)
- Create: `packages/core/tests/bakeoff-ai-agent-chat.test.ts`

**Interfaces:**
- Consumes: Tasks 1–4 (`formId`, user-task `ioMapping`, `label`/`flowId`, `applyTemplates`, `toolGrid`, `annotate` side).
- Produces: `export function buildAiAgentChat(): BpmnDefinitions` from `build.ts`.

- [ ] **Step 1: Write `build.ts`.** One fluent chain plus one `applyTemplates` call: 1 entry for `AI_Agent` and 4 for the tools, with every value in the spec. Use no shell and no string escaping beyond JS literals. Target at most 70 lines. The CLI winner wrote 61.
- [ ] **Step 2: Write the test.** Assert each spec line as a fact on the parsed export:
  - The ids `StartEvent_TaskReceived`, `Gateway_RunAgent`, `AI_Agent`, `UserTask_ReviewAgentResponse`, `Gateway_UserSatisfied`, `EndEvent_UserSatisfied` and the four tool ids.
  - Both form ids and the `responseText` input.
  - Flow names exactly `"Yes"`/`"No"`, with conditions `=userSatisfied` and `=userSatisfied = null or userSatisfied = false`.
  - Template ids/versions `…ai-agent-subprocess.v2`/`1` and `…HttpJson.v2`/`18`.
  - A system prompt with a real blank line.
  - `retries="3"` and `retryBackoff` `PT0S` on all 5 templated elements.
  - Three annotations attached to the right elements.
  - The 2 × 2 column order from Task 4.
  - `lintDiagram(defs, { forceEngineRules: true }).diagnostics.filter(d => d.severity === "error")` equals `[]`.
  - `isExecutable` is true and the platform version is `8.10.0`.
- [ ] **Step 3: Run it.** Expected: PASS. If it fails, the failure points at a Task 1–4 gap: fix it there, not in the fixture.
- [ ] **Step 4: Render it once with `renderBpmnAscii` and commit the text as `fixtures/bakeoff/expected.txt`, and commit `Bpmn.export(buildAiAgentChat())` as `fixtures/bakeoff/expected.bpmn`.** Assert both are equal to fresh output, so layout or XML regressions show up in review. Other packages read `expected.bpmn` and never import the test file.
- [ ] **Step 5: Commit** `test(core): bake-off AI Agent Chat With Tools acceptance fixture`

## Phase B — agents find the answer fast

### Task 7: `bpmnkit-docs` works from the repo root, plus a recipe page with ranking tests

**Files:**
- Modify: root `package.json`: add `"@bpmnkit/docspack": "workspace:*"` and `"@bpmnkit/camunda-docspack": "workspace:*"` to `devDependencies`, then `pnpm install`
- Create: `apps/landing/src/content/docs/guides/executable-camunda-process.md`. Each section is headed with the question an agent asks:
  - "How do I put a form on a start event?"
  - "How do I map a user task's input?"
  - "How do I label a gateway's Yes and No flows?"
  - "How do I apply an element template (connector) to a task?"
  - "Which keys does a template take?"
  - "How do I build an AI Agent sub-process (8.10, v2)?"
  - "How do I lay out the agent's tools in a grid?"
  - "How do I check the file is executable before tests?"

  Each section has one code block taken from `fixtures/bakeoff/build.ts`, plus the rule that omitted template properties keep their defaults.
- Modify: `apps/landing/src/content/docs/packages/core.md` and `connectors.md`: one link each to the recipe
- Create: `packages/docspack/tests/recipe-ranking.test.ts`

- [ ] **Step 1: Write the failing ranking test.** Build the pack in a temp dir. For each query below, the top `search` hit is the matching recipe chunk:
  - "set a form on a start event"
  - "apply an element template to a service task"
  - "user task input mapping"
  - "AI agent sub-process with tools"
  - "flow label different from branch"
  - "lint before running tests"

  Read the chunk ids from `bpmnkit-docs search` after Step 3. Do not guess them here.
- [ ] **Step 2: From the repo root, run `npx bpmnkit-docs list`.** Expected now: "No documentation packages found".
- [ ] **Step 3: Add the devDependencies and the recipe page, then run `pnpm install && pnpm --filter @bpmnkit/docspack build`.**
- [ ] **Step 4: Run `npx bpmnkit-docs list`** (expect both packs) **and `pnpm --filter @bpmnkit/docspack test`** (expect PASS). If a query ranks the wrong chunk, fix the heading wording first, and the ranker only if that fails.
- [ ] **Step 5: Commit** `docs: executable Camunda process recipe; bpmnkit-docs resolves from repo root`

### Task 8: `casen connector apply` and `casen connector show --filter --condensed`

**Files:**
- Modify: `apps/cli/src/commands/connector.ts` (`showCmd` ~109; register `applyCmd` in the subcommand list ~629)
- Test: `apps/cli/src/commands/connector-apply.test.ts` (new), plus extend the existing `show` test if there is one

**Interfaces:**
- Consumes: `applyTemplates` (Task 3).
- Produces: the commands
  - `casen connector apply <file.bpmn> <elementId> <template[@version]|alias> [--values <file.json>] [--set key=value]... [--dry-run]`. It writes the file in place. Problems go to stderr with suggestions, and the command exits 1 when any problem is found.
  - `casen connector show <template> --filter <text> --condensed`. It prints one line per property: `key  type  default  [required]  condition`.

- [ ] **Step 1: Write failing tests.**
  - `--values` with a JSON file whose system prompt contains `\n\n` writes a real blank line.
  - `--set retries=3` exits 1 with `did you mean "retryCount"?`.
  - `show io.camunda.connectors.HttpJson.v2 --filter timeout --condensed` prints exactly the two timeout keys.
- [ ] **Step 2: Run them, expect failures:** `pnpm --filter @bpmnkit/cli exec vitest run src/commands/connector-apply.test.ts`.
- [ ] **Step 3: Implement.** Help text says: "Omitted properties keep the template default. Prefer --values for multi-line or quoted FEEL."
- [ ] **Step 4: Run the CLI tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(cli): connector apply and filtered show`

### Task 9: Claude skill targets the v2 agent and the builder path

**Files:**
- Modify: `plugins-claude/bpmnkit-claude/skills/agent/SKILL.md` and its `references/agentic.md`
- Modify: `plugins-claude/bpmnkit-claude/skills/connect/SKILL.md` (mention `casen connector apply` and `show --filter`)

- [ ] **Step 1: Replace the v1 job-worker guidance with the v2 sub-process flow.** The flow is `adHocSubProcess` + `applyTemplates`, using `ai-agent-subprocess.v2@1` and job type `io.camunda.agenticai:aiagent:subprocess:2`. Keep v1 as a short "older Camunda" note. Point to the recipe chunk ids from Task 7.
- [ ] **Step 2: Add a gate checklist.** Run `casen lint lint <file> --profile deploy` (0 errors), then `renderBpmnAscii` for a layout check, then tests.
- [ ] **Step 3: Verify.** `grep -n "aiagent-job-worker" plugins-claude/bpmnkit-claude/skills/agent/SKILL.md` matches only the v1 note.
- [ ] **Step 4: Commit** `docs(skills): agent skill uses AI Agent sub-process v2`

## Phase C — drop says what it made, and can make it executable

### Task 10: Process-text DSL: forms, mappings and platform version

**Files:**
- Modify: `packages/core/src/bpmn/process-text.ts` (`PROCESS_TEXT_GUIDE` 37, attribute parsing), `process-text-writer.ts`, `compact.ts` (`expand`: `formId` ~55, ioMapping ~127/~250, platform version, `zeebe:userTask`)
- Test: `packages/core/tests/process-text.test.ts`, `process-text-writer.test.ts`

**Interfaces:**
- Produces this DSL syntax, taught in `PROCESS_TEXT_GUIDE`:
  - `form=<formId>` on `start` and `user`. A `user` with a form gets `zeebe:userTask`.
  - `in.<target>=<FEEL>` and `out.<target>=<FEEL>`, repeatable. The value runs up to the next ` <word>=` or the end of the line.
  - `# Name | camunda=8.10` on the first line. It sets `executionPlatformVersion` `8.10.0`.

- [ ] **Step 1: Write failing tests.**
  - `parseProcessText` on `start[start Task received | form=ai-agent-chat-initial-request] > fb[user User Feedback | form=ai-agent-chat-user-feedback in.responseText=agent.responseText] > e[end Done]` expands to XML with both form definitions, `zeebe:userTask` and the input. There are no `problems`.
  - Writer round trip: `writeProcessText(parse(x))` equals `x`.
  - The guide example still parses with no problems. That test already exists.
- [ ] **Step 2: Run, expect failures.**
- [ ] **Step 3: Implement the parser, `expand` and the writer.** Each guide addition is at most one line, since the guide is in drop's prompt and every token costs latency.
- [ ] **Step 4: Run the `process-text*` and `compact*` tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(core): process text forms, mappings and platform version`

### Task 11: Process-text DSL: ad-hoc containers and annotations

**Files:**
- Modify: `packages/core/src/bpmn/process-text.ts` (`KINDS` ~118), `process-text-writer.ts`, `compact.ts` (`expand` sets `textAnnotations: []` at ~829)
- Test: same files as Task 10

**Interfaces:**
- Produces:
  - kind `adhoc` (`adHocSubProcess`), and attribute `inside=<adhoc id>` on a task that lives in it with no flows. Children are declared on their own lines as `users[service Find sample users | inside=agent]`.
  - line `note <elementId>: <text>`, which gives a text annotation and an association.

- [ ] **Step 1: Write failing tests.**
  - The bake-off main flow plus four `inside=agent` tools and three `note` lines expands to an `adHocSubProcess` with 4 flowless children and 3 associations. Its layout passes `tests/adhoc-grid-layout.test.ts`-style checks.
  - An `inside=` that names a non-adhoc node reports a problem and leaves the node at the top level.
  - Writer round trip.
- [ ] **Step 2: Run, expect failures.** **Step 3: Implement.** **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(core): process text ad-hoc sub-processes and notes`

### Task 12: Drop executability verdict and visible notation

**Files:**
- Create: `apps/drop/src/lib/readiness.ts`
- Modify: `apps/drop/src/client/generate.ts` (after `generate()` ~598 resolves; `showCheck` ~313 runs for every draft)
- Test: `apps/drop/tests/readiness.test.ts`

**Interfaces:**
- Produces:
```ts
export type Readiness =
  | { state: "ready"; version: string }
  | { state: "shape-only"; missing: { elementId: string; what: string }[] }
  | { state: "invalid"; errors: { elementId: string; message: string }[] }
export function readiness(defs: BpmnDefinitions, camundaVersion?: string): Readiness
```
It is based on `lintDiagram(defs, { forceEngineRules: true, camundaVersion })`. Deploy and connector errors give `invalid`. Missing job types, forms or connector config give `shape-only`.

- [ ] **Step 1: Write failing tests.** A plain DSL draft with a `service` task and no job type gives `shape-only`, with that element listed. `packages/core/tests/fixtures/bakeoff/expected.bpmn` (Task 6), read with `readFileSync` and `Bpmn.parse`, gives `ready`.
- [ ] **Step 2: Run, expect failure.** **Step 3: Implement it, and show it in the UI.** The badge reads "Ready to deploy (8.10)", "Shape only — N steps need configuration" or "N deploy errors". Add a collapsible "Diagram text" panel that shows the streamed process text. A failed or 404 connect pass sets a visible "Connectors not configured" note instead of staying silent.
- [ ] **Step 4: Run `pnpm --filter @bpmnkit/drop test`.** Expected: PASS. Check the UI by hand with the `run` skill on the dev server.
- [ ] **Step 5: Commit** `feat(drop): executability verdict and visible diagram text`

### Task 13: Drop connects the AI Agent and its tools

**Files:**
- Modify: `apps/drop/src/lib/connect.ts` (`CONNECTABLE` 45; `connectTasks` ~70), `packages/core/src/connectors/lines.ts` (`CONNECT_GUIDE` 33; `==` values decode `\n` as a newline)
- Test: `apps/drop/tests/connect-route.test.ts`, `packages/core/tests/connectors/lines.test.ts`

- [ ] **Step 1: Write failing tests.**
  - `adHocSubProcess` is connectable. The line `with agent: ai-agent-subprocess | provider.type=openai | data.systemPrompt.prompt=="A\n\nB"` gives a source that contains a real blank line.
  - Tools inside the agent accept `http` lines.
- [ ] **Step 2: Run, expect failures.** **Step 3: Implement.** **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(drop): connect AI Agent sub-processes and their tools`

### Task 14: Golden prompt for the bake-off process

**Files:**
- Create: `scripts/eval-generation/prompts/28-ai-agent-chat-with-tools/{prompt.md,expected.json,fixture.plan.json}`
- Modify: the `expected.json` assertion support in `scripts/eval-generation/run-eval.mjs` and `apps/drop/scripts/bench-generate.mjs`. Add `mustContainFormIds`, `mustContainInputTargets`, `mustContainAnnotations`, `mustContainFlowNames`, `mustBeReady`. The last one uses `readiness()` from Task 12.
- Modify: the drop bench default skip list, so it runs 03 and 28.

- [ ] **Step 1: Write `prompt.md`** (the bake-off spec's prose) **and `expected.json`.** Use the spec's ids, form ids, `responseText`, `["Yes","No"]`, 3 annotations and `mustBeReady: true`.
- [ ] **Step 2: Run the plan-level eval:** `node scripts/eval-generation/run-eval.mjs --only 28`. Expected: PASS for the plan path.
- [ ] **Step 3: Run the drop bench with its connect mode:** `pnpm --filter @bpmnkit/drop bench:generate -- --only 28 --connect`. Record the time to first shape, the total time and the assertions in `apps/drop/bench-results/`. A miss is data, not a blocker. Write it into the analysis doc.
- [ ] **Step 4: Commit** `test(eval): AI Agent Chat With Tools golden prompt`

## Phase D — rerun the bake-off

### Task 15: Reproduce and publish the numbers

**Files:**
- Create: `doc/agent-bpmn-bakeoff-rerun.md`
- Modify: `doc/agent-bpmn-bakeoff-analysis.md` (results section), `doc/progress.md`, `doc/features.md`

- [ ] **Step 1: Set up the external runs.** Clone `HanselIdes/bpmn-js-cli`, branch `camunda-executable`, into a scratch dir. Copy its spec, gate and scorer. Do not vendor them into this repo.
- [ ] **Step 2: Run two trials with Sonnet 5.5.** Use a brief that says only "use `@bpmnkit/core`; ask `npx bpmnkit-docs` first", and no hand-tuning between trials. Record time to first passing gate, cost, closeness and layout the same way the report does.
- [ ] **Step 3: Compare with the targets in the analysis:** ≤ 100 s, ≤ $0.45, closeness ≥ 90. Write per-run tables and the gaps that remain. Any miss becomes a new task proposal, not a silent retune.
- [ ] **Step 4: Commit** `docs: bake-off rerun results`
