# Camunda Process-Test JSON on reebe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `casen test <file.bpmn> --scenarios <cases.json>` runs a Camunda process-test (CPT) JSON file on reebe-wasm and gives the same pass/fail as real CPT, with no Java, Maven or Docker.

**Architecture:** reebe-wasm gains one call, `complete_job_with_result`, so a test can complete an ad-hoc sub-process job with a result. A pure-TS runner in `@bpmnkit/engine/cpt` validates the CPT file, then runs each test case on a fresh reebe-wasm engine, mapping each instruction to engine calls and each assertion to `snapshot()`. `casen test` routes to it when the file's `$schema` names `cpt-test-cases`.

**Tech Stack:** Rust (reebe-engine, reebe-wasm, wasm-bindgen, wasm-pack v0.15.0), TypeScript strict, Vitest, Biome.

**Spec:** `docs/superpowers/specs/2026-10-18-cpt-json-on-reebe-design.md`

## Global Constraints

- No new runtime dependencies. No CI changes (CI already builds reebe-wasm: `.github/workflows/ci.yml`).
- Existing `casen test` scenario files and `runScenarioWasm` behave exactly as before.
- Zero type errors, zero Biome findings, all tests green (`pnpm verify`); `cargo test` green in `apps/reebe`.
- Unsupported instruction types or selector fields fail loudly by name ("not supported by casen test yet"), never pass silently.
- Changesets for the published packages touched: `@bpmnkit/engine`, `@bpmnkit/cli`, `@bpmnkit/reebe-wasm`.
- Every commit adds a dated entry at the top of `doc/progress.md`; Task 4 adds the feature to `doc/features.md`.
- Comments explain why, not what. Backend code: ESM, `.js` relative imports, `node:` imports.
- No model identifiers in commits or files.

## Decisions taken here (where the spec left a choice)

1. **Forms:** reebe's deployment (`reebe-engine/src/processor/deployment.rs`) parses every resource as BPMN/DMN XML and never resolves a user task's `formId`. Per the spec's "otherwise" branch, the runner takes **no** `forms` input and the CLI does not read `*.form` files. The gap is recorded in `doc/cpt-on-reebe-parity.md` (Task 5).
2. **Rust tests:** reebe-wasm's exported functions return `JsValue`, which cannot be exercised by native `cargo test`. The payload building is a pure helper with native Rust tests. The spec's three behaviour tests run on the built wasm in Vitest (Task 1).
3. **wasm init:** `ensureWasmInit` moves from `wasm-runner.ts` to a new, unexported module `packages/engine/src/wasm-init.ts`, so the runner does not add a public export to `wasm-runner`.
4. **Instance selection:** a `processInstanceSelector`/`processDefinitionId` matches the **first created** instance of that process id in the case (CPT cases create one). A job or user task selector matches the lowest-key open one whose given fields all match.
5. **`IS_COMPLETED_IN_ORDER`:** every listed element has an `ELEMENT_COMPLETED` event, and the positions of each element's *first* completion are strictly increasing in the listed order. Task 5's parity run may revise this; the final rule goes in the runner's doc comment.
6. **The bake-off brief template** lives outside the repo (the scratchpad), so the spec's "swap `run-cpt.sh` in the brief" is not a repo change. Task 6 updates the in-repo docs only.

## Review Focus

1. **A selector that matches nothing after draining:** for example, a job type typo, or a user task that never became active. The run must fail at that instruction, and the message must name the selector and list the active elements, open jobs and open user tasks. It must never hang or pass.
2. **An engine rejection:** for example, an ad-hoc result that both activates elements and fulfils the completion condition, or that activates an unknown element. The case fails at that instruction with reebe's message. The rejection must not escape as a thrown error that aborts the remaining cases.
3. **An incident during a case:** for example, a FEEL error in a condition. Assertions see the real state: a later `ASSERT_PROCESS_INSTANCE IS_COMPLETED` fails, and the message includes the incident's element and error.
4. **`variables` given as a non-object or omitted:** an omitted value means `{}`. Any other non-object is a validation failure before running.
5. **A test file without `$schema`, or one that is not CPT:** the old scenario path runs unchanged. A file with the CPT `$schema` and no `testCases` array is reported as invalid, not as "No scenarios found."

---

### Task 1: reebe-wasm `complete_job_with_result`

**Files:**
- Modify: `apps/reebe/crates/reebe-wasm/src/lib.rs` (next to `complete_job`, line 153; add `#[cfg(test)] mod tests` at the end)
- Rebuild: `apps/reebe-wasm/` (wasm-pack output, as CI builds it)
- Test: `packages/engine/tests/cpt/wasm-job-result.test.ts`, fixture `packages/engine/tests/cpt/fixtures/ad-hoc-tools.bpmn`

**Interfaces:**
- Produces (Rust): `fn job_complete_payload(job_key: i64, variables: &str, result: Option<&str>) -> Result<serde_json::Value, String>`. It returns `{"jobKey": "<key>", "variables": <object or {}>}`, plus `"result": <parsed>` when a result is given. Invalid result JSON is an `Err`.
- Produces (wasm/JS): `complete_job_with_result(key: number, variables: string, result: string): unknown`. It throws reebe's rejection message as a string. `complete_job` now delegates to `job_complete_payload(key, variables, None)` and behaves as before.

- [ ] **Step 1: Set up the local wasm toolchain** (once per sandbox): `rustup target add wasm32-unknown-unknown`, and wasm-pack **v0.15.0** (`cargo install wasm-pack --version 0.15.0 --locked`). Confirm with `wasm-pack --version`, which must print `wasm-pack 0.15.0`.

- [ ] **Step 2: Write the failing Rust tests** in `lib.rs` `mod tests`:
  - `payload_without_result_matches_complete_job`: `job_complete_payload(7, "{\"a\":1}", None)` == `json!({"jobKey":"7","variables":{"a":1}})`.
  - `payload_carries_result`: with `Some("{\"activateElements\":[{\"elementId\":\"T1\"}]}")`, `payload["result"]["activateElements"][0]["elementId"] == "T1"`.
  - `payload_rejects_invalid_result_json`: `Some("{")` is `Err`.
  - `payload_defaults_bad_variables_to_empty_object`: `job_complete_payload(7, "not json", None)` gives `variables == json!({})`. This is today's `complete_job` behaviour.

- [ ] **Step 3: Run them and confirm they fail:** `cd apps/reebe && cargo test -p reebe-wasm`. Expected: a compile error, because `job_complete_payload` does not exist yet.

- [ ] **Step 4: Implement** `job_complete_payload` and `complete_job_with_result`. The latter calls `submit_and_drain("JOB", "COMPLETE", payload, "<default>")`. Change `complete_job` to call the helper with `None`.

- [ ] **Step 5: Run `cargo test -p reebe-wasm`.** Expected: PASS. Also run `cargo test -p reebe-engine ad_hoc`; it must still pass.

- [ ] **Step 6: Rebuild the wasm package** with CI's command. From the repo root:
  ```bash
  WASM_VERSION=$(node -p "require('./apps/reebe-wasm/package.json').version")
  wasm-pack build apps/reebe/crates/reebe-wasm --target web --scope bpmnkit --out-dir "$PWD/apps/reebe-wasm"
  node scripts/patch-wasm-pkg.mjs "$WASM_VERSION"
  ```
  Expected: `apps/reebe-wasm/reebe_wasm.d.ts` declares `complete_job_with_result(key: number, variables: string, result: string): any`. Check with `git status` which generated files are tracked, and commit only those.

- [ ] **Step 7: Write the failing Vitest behaviour tests** in `wasm-job-result.test.ts`. The fixture `ad-hoc-tools.bpmn` contains: start → ad-hoc sub-process `Agent`, with job type `agent` and service tasks `T1` (type `t1`) and `T2` (type `t2`) inside; no completion condition; then end. Each test inits wasm the way `wasm-runner.ts` does. Write one helper that does init → `new WasmEngine()` → `deploy` → `create_process_instance("ad-hoc-tools", "{}")`.
  - `activates two tools, then completes on the fulfilled condition`. Complete the `agent` job with `{"activateElements":[{"elementId":"T1"},{"elementId":"T2"}]}`. Expect activatable jobs of type `t1` and `t2`. Complete both. Then activate the next `agent` job and complete it with `{"isCompletionConditionFulfilled":true}`. Expect the process instance state `COMPLETED`.
  - `rejects a result that both activates and fulfils`. Expect a throw whose message contains `both activates elements and fulfils the completion condition`.
  - `ignores the result on a non-ad-hoc job`. In a second process (one service task `S`, type `s`), complete it with a result; expect the instance `COMPLETED`.

- [ ] **Step 8: Run** `pnpm --filter @bpmnkit/engine test -- wasm-job-result`. Expected: PASS.

- [ ] **Step 9: Commit** the Rust change, the tracked wasm output, the tests, the fixture, a changeset for `@bpmnkit/reebe-wasm` and a `doc/progress.md` entry. Message: `feat(reebe-wasm): complete a job with an ad-hoc sub-process result`.

---

### Task 2: CPT file types and validation

**Files:**
- Create: `packages/engine/src/cpt/types.ts`, `packages/engine/src/cpt/validate.ts`
- Test: `packages/engine/tests/cpt/validate.test.ts`

**Interfaces:**
- Produces in `types.ts`:
  ```ts
  export type CptInstruction =
    | { type: "CREATE_PROCESS_INSTANCE"; processDefinitionSelector: { processDefinitionId: string }; variables: Record<string, unknown> }
    | { type: "COMPLETE_JOB"; jobSelector: CptJobSelector; variables: Record<string, unknown> }
    | { type: "COMPLETE_JOB_AD_HOC_SUB_PROCESS"; jobSelector: CptJobSelector; variables: Record<string, unknown>;
        activateElements: { elementId: string; variables?: Record<string, unknown> }[];
        completionConditionFulfilled: boolean; cancelRemainingInstances: boolean }
    | { type: "COMPLETE_USER_TASK"; userTaskSelector: CptUserTaskSelector; variables: Record<string, unknown> }
    | { type: "ASSERT_ELEMENT_INSTANCES"; processInstanceSelector: { processDefinitionId: string };
        elementSelectors: { elementId: string }[]; state: "IS_ACTIVE" | "IS_COMPLETED" | "IS_COMPLETED_IN_ORDER" }
    | { type: "ASSERT_PROCESS_INSTANCE"; processInstanceSelector: { processDefinitionId: string }; state: "IS_ACTIVE" | "IS_COMPLETED" }
  export interface CptJobSelector { jobType?: string; elementId?: string; processDefinitionId?: string } // at least one
  export interface CptUserTaskSelector { elementId?: string; processDefinitionId?: string } // at least one
  export interface CptTestCase { name: string; description?: string; instructions: CptInstruction[] }
  export interface CptFile { $schema: string; testCases: CptTestCase[] }
  export interface CptFailure { index: number; type: string; message: string }
  export interface CptCaseResult { name: string; passed: boolean; failure?: CptFailure }
  export interface CptReport { cases: CptCaseResult[] }
  ```
- Produces in `validate.ts`: `export function isCptFile(json: unknown): boolean`, which is true when `$schema` is a string containing `cpt-test-cases`. Also `export function parseCptFile(json: unknown): { file: CptFile } | { errors: string[] }`. Defaults: `variables` is `{}`, booleans are `false`, `activateElements` is `[]`.

- [ ] **Step 1: Write the failing tests** in `validate.test.ts`:
  - `isCptFile`: true for `{"$schema":"https://camunda.com/json-schema/cpt-test-cases/8.10/schema.json"}`; false for an array, `{}`, and a `$schema` without `cpt-test-cases`.
  - `parses the six supported types with defaults`. Use a one-case file with one instruction of each type and `variables` omitted. Expect `file.testCases[0].instructions[0].variables` to equal `{}`, and the ad-hoc instruction to have `completionConditionFulfilled: false`, `cancelRemainingInstances: false` and `activateElements: []`.
  - `names an unsupported type`. `{type:"PUBLISH_MESSAGE"}` in case "c" at index 2 gives an errors entry equal to `case "c", instruction 2: PUBLISH_MESSAGE is not supported by casen test yet`.
  - `names an unsupported selector field`. `jobSelector: {jobType:"a", tenantId:"x"}` gives `case "c", instruction 0: jobSelector.tenantId is not supported by casen test yet`. The same rule applies to `userTaskSelector.taskName` and `elementSelectors[].elementName`.
  - `names an unsupported state`. `ASSERT_ELEMENT_INSTANCES` with `state:"IS_TERMINATED"` gives `... state IS_TERMINATED is not supported by casen test yet`.
  - `names an unsupported instruction field`. `COMPLETE_JOB` with `useExampleData:true` gives `... COMPLETE_JOB.useExampleData is not supported by casen test yet`. The same rule applies to `CREATE_PROCESS_INSTANCE` with `startInstructions` or `runtimeInstructions`, and to `ASSERT_PROCESS_INSTANCE` with `hasActiveIncidents`.
  - `rejects an empty selector`. `jobSelector: {}` gives `... jobSelector needs one of jobType, elementId, processDefinitionId`.
  - `rejects non-object variables`. `variables: [1]` gives `... variables must be an object`.
  - `rejects a CPT file without testCases`. The errors equal `["testCases must be a non-empty array"]`.

- [ ] **Step 2: Run** `pnpm --filter @bpmnkit/engine test -- cpt/validate`. Expected: FAIL, because the module is missing.

- [ ] **Step 3: Implement** `types.ts` and `validate.ts`. Use one allow-list per instruction type, listing its fields and the allowed fields of each selector. Collect every error rather than stopping at the first.

- [ ] **Step 4: Run** the same command. Expected: PASS.

- [ ] **Step 5: Commit** with a `doc/progress.md` entry. Message: `feat(engine): validate Camunda process-test JSON files`.

---

### Task 3: Runner `runCptTestCases` and the `@bpmnkit/engine/cpt` export

**Files:**
- Create: `packages/engine/src/wasm-init.ts` (moved `ensureWasmInit`), `packages/engine/src/cpt/run.ts`, `packages/engine/src/cpt/index.ts`
- Modify: `packages/engine/src/wasm-runner.ts:130-156` (import `ensureWasmInit` from `./wasm-init.js`), `packages/engine/package.json` (`exports["./cpt"]`, after `./wasm-runner`), the api-surface snapshot (`node scripts/api-surface.mjs`)
- Test: `packages/engine/tests/cpt/run.test.ts`, fixtures `packages/engine/tests/cpt/fixtures/` (`bakeoff.test.json`, plus small BPMNs as needed)

**Interfaces:**
- Consumes: Task 1's `complete_job_with_result`; Task 2's `parseCptFile`, `CptFile`, `CptReport`.
- Produces: `export async function runCptTestCases(input: { bpmn: string; cases: unknown; select?: string[] }): Promise<CptReport>`. `index.ts` re-exports it together with `isCptFile`, `parseCptFile` and the Task 2 types.
  - Validation errors produce a report with one failed case per error: `{ name: "<file>", passed: false, failure: { index: -1, type: "VALIDATION", message } }`. Nothing runs in that case.
  - `select` keeps only cases whose `name` is in it. An unknown selected name is reported as a failed case: `no test case named "<x>"`.

- [ ] **Step 1: Check the tutorial's licence.** Read `LICENSE` in `camunda/camunda-8-tutorials` with WebFetch on the raw GitHub URL. If it is Apache-2.0 or MIT, copy the scratchpad's `cpt-run/ai-agent-chat-with-tools.test.json` to `fixtures/bakeoff.test.json`, and put its source and licence in `packages/engine/tests/cpt/fixtures/README.md`. Otherwise, write `bakeoff.test.json` yourself: same six case names and instruction sequence, your own variable values, `$schema` `https://camunda.com/json-schema/cpt-test-cases/8.10/schema.json`. The tutorial file stays in the scratchpad either way.

- [ ] **Step 2: Write the failing tests** in `run.test.ts`. The BPMN is `packages/core/tests/fixtures/bakeoff/expected.bpmn`, read from disk.
  - `passes the bake-off fixture's six cases`: `report.cases` has length 6 and every case has `passed === true`.
  - `fails the loop case when Flow_No can never be taken`. Take a copy of the BPMN with `Flow_No`'s condition replaced by `=false`. Expect the loop case to fail at the index of its second `COMPLETE_JOB_AD_HOC_SUB_PROCESS`, with a message that contains `no open job` and `io.camunda.agenticai:aiagent:subprocess:2`. Expect the happy-path case to still pass.
  - `fails the recipes case when SearchRecipes is removed` (the element and its references are removed from the ad-hoc sub-process). The failure is at the first `COMPLETE_JOB_AD_HOC_SUB_PROCESS`, and the message contains reebe's `is not an element it can activate`. This covers Review Focus 2.
  - `reports a selector that matches nothing, listing what is open`. On a small service-task BPMN, a `COMPLETE_JOB` with `jobType:"nope"` gives a message that contains `jobType "nope"` and the open job's type. This covers Review Focus 1.
  - `reports an incident's element on a failed completion assertion`. A gateway with condition `=x.y.z` and no `x` leads to an incident. `ASSERT_PROCESS_INSTANCE IS_COMPLETED` then fails with a message that contains the gateway id. This covers Review Focus 3.
  - `IS_COMPLETED_IN_ORDER`: passes for `[Start, Task, End]` and fails for `[End, Task]`, with a message naming the actual completion order.
  - `isolates cases`. The first case leaves an instance active and the second asserts `IS_COMPLETED` on its own new instance. Expect the second to pass.
  - `runs only selected cases`: `select: ["Happy path — user satisfied on first response (no tool calls)"]` gives `report.cases.length === 1`. Use your fixture's actual first case name if you wrote it yourself.
  - `reports validation errors without running`. An unsupported type gives a single failed case with `failure.type === "VALIDATION"`.

- [ ] **Step 3: Run** `pnpm --filter @bpmnkit/engine test -- cpt/run`. Expected: FAIL, because the module is missing.

- [ ] **Step 4: Implement.**
  - Move `ensureWasmInit` (and the `wasmReady` flag) to `wasm-init.ts`, and export it from there only.
  - In `run.ts`, use one `new WasmEngine()` per case and deploy `bpmn`. Map each instruction as in the spec's table (spec §"What the test files contain") and follow decisions 4 and 5 above. Read element completion order from `snapshot().eventLog` records with `intent === "ELEMENT_COMPLETED"`; check the payload's element-id key against a real snapshot before relying on it.
  - Catch every engine throw per instruction and turn it into the case's `failure`.
  - A "not found" message lists the active element ids, the open jobs (`type@elementId`) and the open user tasks, plus any incidents (`elementId: errorMessage`).
  - Doc-comment `runCptTestCases` with the semantics of decisions 4 and 5.

- [ ] **Step 5: Run** the same command. Expected: PASS. Then run `pnpm --filter @bpmnkit/engine test` and expect it to pass in full, which includes the unchanged `wasm-runner.test.ts`.

- [ ] **Step 6: Add the export** `"./cpt": { "types": "./dist/cpt/index.d.ts", "import": "./dist/cpt/index.js" }`. Then run `pnpm --filter @bpmnkit/engine build` and `node scripts/api-surface.mjs`, and commit the updated snapshot. `node scripts/api-surface.mjs --check` must exit 0.

- [ ] **Step 7: Commit** with an `@bpmnkit/engine` changeset and a `doc/progress.md` entry. Message: `feat(engine): run Camunda process-test JSON on reebe-wasm`.

---

### Task 4: `casen test` runs CPT files

**Files:**
- Modify: `apps/cli/src/commands/test.ts`
- Test: `apps/cli/src/commands/test.test.ts` (new; follow the setup style of `lint-templates.test.ts`)

**Interfaces:**
- Consumes: `runCptTestCases` and `isCptFile` from `@bpmnkit/engine/cpt`.
- Produces: an exported `export async function resolveScenariosPath(bpmnPath: string, flag?: string): Promise<string>`. It returns the flag value if given. Otherwise it returns `<file>.bpmn.tests.json` if that file exists, then `<dir>/<name>.test.json` if that exists, where `<name>` is the file name without `.bpmn`. If neither exists, it returns the first of the two, so the existing "Cannot read scenarios file" message is unchanged. The command gets a new flag `case` (string, repeatable; read it with `flagAll` from `apps/cli/src/args.ts`).

- [ ] **Step 1: Write the failing tests:**
  - `resolveScenariosPath`. Use a temp dir with `p.bpmn` and `p.test.json`, which returns `.../p.test.json`. Adding `p.bpmn.tests.json` makes it return that file instead. A flag always wins.
  - `runs a CPT file and passes`. Use the bake-off BPMN and the Task 3 fixture in a temp dir, and run the command with a recording `ctx.output`. The output contains `PASS` six times and `6/6 passed`, and the command does not throw.
  - `fails with the instruction`. With the `Flow_No=false` variant, the command throws `1 test case(s) failed`. The output contains `FAIL` and `instruction <n> (COMPLETE_JOB_AD_HOC_SUB_PROCESS)`.
  - `--case selects`. One `--case` value gives `1/1 passed`.
  - `old scenario files still work`. Use an array-format file with a single scenario from `packages/engine/tests/scenario.test.ts`'s style; it still passes through `runScenarioWasm`. This covers Review Focus 5.
  - `CPT file without testCases`. The output names `testCases must be a non-empty array`, the command throws, and the output does not contain "No scenarios found." This covers Review Focus 5.

- [ ] **Step 2: Run** `pnpm --filter @bpmnkit/cli test -- commands/test`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - After parsing the JSON, `isCptFile(json)` routes to `runCptTestCases({ bpmn, cases: json, select })`.
  - Print `PASS  <name>` or `FAIL  <name>`, then for a failure `       instruction <index> (<type>): <message>`. A validation failure prints `       <message>`.
  - Finish with `\n<passed>/<total> passed`, and throw `<n> test case(s) failed` when any case fails.
  - Update the flag descriptions to mention CPT JSON and `<name>.test.json`.

- [ ] **Step 4: Run** the CLI tests, then `pnpm biome check apps/cli packages/engine` and `pnpm turbo typecheck --filter @bpmnkit/cli --filter @bpmnkit/engine`. Expected: all clean.

- [ ] **Step 5: Commit** with an `@bpmnkit/cli` changeset, `doc/progress.md` and `doc/features.md` entries ("casen test runs Camunda process-test JSON on reebe"), and a tick in `doc/roadmap.md` if an item matches. Message: `feat(cli): casen test runs Camunda process-test JSON files`.

---

### Task 5: Parity run against real CPT

**Files:**
- Create: `doc/cpt-on-reebe-parity.md`
- Possibly modify: `packages/engine/src/cpt/run.ts` (fixes and the final `IS_COMPLETED_IN_ORDER` wording), and reebe if a disagreement is a reebe bug (with a Rust regression test)

**Interfaces:**
- Consumes: the built `casen` (`pnpm --filter @bpmnkit/cli build`) and the scratchpad's CPT harness (`/tmp/claude-0/-home-user-bpmnkit/af528bf5-1e0b-51e1-9469-66aad1175bac/scratchpad/trials/gate/run-cpt.sh` and `cpt-template/`). It needs Docker, Java 21 and Maven, as in the earlier gate runs.

- [ ] **Step 1: Build the seven files** in the scratchpad:
  - `expected.bpmn`.
  - The bk3 and bk4 rerun outputs, from `trials/runs/`.
  - Five broken variants of `expected.bpmn`:
    - `Flow_No` with the condition `=false`;
    - `SearchRecipes` removed;
    - the agent job type changed to `io.camunda.agenticai:aiagent:subprocess:1`;
    - `zeebe:userTask` removed from `UserTask_ReviewAgentResponse`;
    - the feedback form id changed to `missing-form`.

- [ ] **Step 2: Run each file on both engines** with the tutorial's `.test.json`. Record each case's pass/fail as a matrix of 7 files × 6 cases on each engine.
  - Real CPT: `run-cpt.sh <file>`.
  - reebe: `node apps/cli/dist/index.js test <file> --scenarios <json>`.

- [ ] **Step 3: Resolve every disagreement.** Fix it in the runner or in reebe, with a regression test in Task 3's or Task 1's test file. If the difference is intended, document it with the case that shows it. Forms are expected to disagree (decision 1); record what CPT did. Re-run until every cell agrees or is documented.

- [ ] **Step 4: Write `doc/cpt-on-reebe-parity.md`.** It holds the date, the CPT version, the matrix (file × case: CPT, casen, agree?), each documented difference, and the run time per file on each engine.

- [ ] **Step 5: Run** `pnpm verify` and expect it to be green. Then commit with a `doc/progress.md` entry. Message: `docs: record casen test parity with Camunda Process Test`.

---

### Task 6: Docs and the agent skill

**Files:**
- Modify:
  - `apps/landing/src/content/docs/guides/executable-camunda-process.md`: a new section after line 199, `## Does it run? Test it with casen test`;
  - the `casen test` CLI reference page (find it with `grep -rl "casen test" apps/landing/src/content/docs/cli`);
  - `apps/landing/src/content/docs/guides/testing-processes.md` (a short subsection, linking to the recipe);
  - `plugins-claude/bpmnkit-claude/skills/agent/SKILL.md` (its done-gate checklist).
- Rebuild: `pnpm --filter @bpmnkit/docspack build`
- Test: `packages/docspack/tests/recipe-ranking.test.ts`

**Interfaces:** none new.

- [ ] **Step 1: Add the failing ranking case** to `CASES` in `recipe-ranking.test.ts`: `["run camunda process test json without java", \`${RECIPE}.does-it-run-test-it-with-casen-test\`]`.

- [ ] **Step 2: Run** `pnpm --filter @bpmnkit/docspack test -- recipe-ranking`. Expected: FAIL for the new case.

- [ ] **Step 3: Write the docs.**
  - **Recipe section:** the command, `<name>.test.json` lookup, `--case`, the six supported instruction types, the forms gap, and a link to `doc/cpt-on-reebe-parity.md`'s result in one sentence.
  - **CLI page:** the new flag and both file formats.
  - **Skill gate:** replace "run Camunda Process Test" with `casen test <file>.bpmn` (exit 0 = done).
  - Then rebuild the docspack.

- [ ] **Step 4: Run** the docspack tests, then `pnpm verify`. Expected: all green.

- [ ] **Step 5: Commit** with a `doc/progress.md` entry. Message: `docs: casen test runs Camunda process-test JSON`. Then push to `docspack/tag-field-ranking`.
