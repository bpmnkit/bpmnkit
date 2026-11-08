# Camunda process-test JSON on reebe — design

Date: 2026-10-18. Status: draft for review.

## Why

Agents (and our bake-off reruns) prove "the BPMN runs" with the Camunda tutorial's test suite through
Camunda Process Test (CPT): Java 21, Maven and a Docker Camunda container. BPMN Kit users and the
agents we brief should not need that toolchain. The goal is a BPMN Kit command that runs the same
test file and gives the same pass/fail, so it can replace CPT in an agent's done-gate.

Scope decided with the user: the **agents' done-gate** only. Not CI, not drop's verdict.
Engine decided with the user: **reebe** (BPMN Kit's Rust port of Zeebe), through reebe-wasm,
because a pass on reebe is the closest stand-in for a pass on Camunda, and `casen test` already
runs on reebe-wasm.

## Success criteria

1. `casen test <file.bpmn> --scenarios <cases.json>` runs a Camunda process-test JSON file
   (`$schema` …`/cpt-test-cases/<version>/schema.json`) on reebe-wasm, with no Java, Maven or Docker.
2. Exit code 0 when every test case passes, 1 otherwise; output names each case and, for a failure,
   the instruction (index and type) and why.
3. **Parity:** for every file × scenario in the parity matrix below, reebe's pass/fail equals real
   CPT's pass/fail. Measured once in this session (CPT runs in the sandbox) and recorded in the repo.
4. Instruction types or selector fields the runner does not support fail loudly by name, never
   silently pass.

## What the test files contain

Camunda's documented format (camunda-docspack chunks `apis-tools.testing.json-test-cases*`):
`{ $schema, testCases: [{ name, description?, instructions: [{ type, … }] }] }`. Instructions run in
order. The tutorial suite (6 cases) uses six types; v1 supports exactly these:

| Instruction | Fields used | reebe mapping |
|---|---|---|
| `CREATE_PROCESS_INSTANCE` | `processDefinitionSelector.processDefinitionId`, `variables` | `create_process_instance(id, json)` |
| `COMPLETE_JOB_AD_HOC_SUB_PROCESS` | `jobSelector.{jobType \| elementId}`, `variables`, `completionConditionFulfilled`, `cancelRemainingInstances?`, `activateElements[{elementId, variables}]` | find the activatable job, `activate_job`, then the new `complete_job_with_result` with `{activateElements, isCompletionConditionFulfilled, isCancelRemainingInstances}` |
| `COMPLETE_JOB` | `jobSelector.{jobType \| elementId}`, `variables` | find, `activate_job`, `complete_job` |
| `COMPLETE_USER_TASK` | `userTaskSelector.elementId`, `variables` | find the CREATED user task in `snapshot().userTasks`, `complete_user_task` |
| `ASSERT_ELEMENT_INSTANCES` | `processInstanceSelector`, `elementSelectors[{elementId}]`, `state: IS_ACTIVE \| IS_COMPLETED \| IS_COMPLETED_IN_ORDER` | from `snapshot()` element instances and the event log's `ELEMENT_COMPLETED` order |
| `ASSERT_PROCESS_INSTANCE` | `processInstanceSelector`, `state: IS_ACTIVE \| IS_COMPLETED` | from `snapshot()` process instances |

Semantics follow Camunda's docs for each type; where the docs leave a choice (e.g. what
`IS_COMPLETED_IN_ORDER` means with repeated elements in a loop), the parity run decides and the
choice is written down in the runner's doc comment. CPT waits (with a timeout) for a selector to
match; reebe-wasm drains synchronously, so "not found after draining" is a failure with a message
naming the selector and listing what *is* there (active elements, open jobs and user tasks).

Out of v1 (fail loudly, "not supported by casen test yet"): every other documented type (message,
signal, timers, decisions, variables assertions, listeners, conditional behaviour, mocks) and any
unknown selector field. Forms are not filled by the tutorial; see "Forms" below.

## Components

1. **reebe-wasm** (`apps/reebe/crates/reebe-wasm/src/lib.rs`):
   `complete_job_with_result(key: f64, variables: &str, result: &str) -> Result<JsValue, JsValue>`.
   It submits `JOB COMPLETE` with `{ jobKey, variables, result }`; the engine already applies an
   ad-hoc result (`reebe-engine/src/processor/job.rs:155`, `ad_hoc::job_result`) and rejects an
   invalid one. Existing `complete_job` stays unchanged. Rust tests cover: activate two tools, then
   fulfil the completion condition; both-at-once is rejected; a non-ad-hoc job ignores `result`.
   No new query API unless `snapshot()` lacks something the assertions need (then the smallest
   read-only getter, with a test).
2. **Runner** (`packages/engine/src/cpt/` — exported as `@bpmnkit/engine/cpt`):
   `runCptTestCases(input: { bpmn: string; forms?: Record<string, string>; cases: CptFile; select?: string[] }): Promise<CptReport>`.
   Pure TS over the same reebe-wasm loader `wasm-runner.ts` uses (`ensureWasmInit`). One fresh
   engine per test case (CPT isolates cases). Parses and validates the file (unknown `type` or
   selector field → a `CptReport` failure before running). `CptReport = { cases: [{ name, passed,
   failure?: { index, type, message } }] }`.
3. **CLI** (`apps/cli/src/commands/test.ts`): when the scenarios file's `$schema` contains
   `cpt-test-cases`, route to `runCptTestCases`; otherwise the existing BPMN Kit scenario path runs
   unchanged. Default scenarios lookup adds `<name>.test.json` (CPT's naming; `<name>` is the BPMN file name
   without `.bpmn`) after the existing `<file>.bpmn.tests.json`. New flag `--case <name>` (repeatable) selects cases. Sibling `*.form`
   files of the BPMN are read and passed as `forms`.
4. **Docs and agents:** recipe page (`guides/executable-camunda-process.md`) gains "Does it run?
   `casen test …`"; the Claude `agent` skill's gate checklist uses it; `casen.md` / CLI docs; the
   bake-off brief template swaps `run-cpt.sh` for `casen test`. Docspack rebuilt.

## Forms

Zeebe links a user task's `formId` to a deployed form. The runner deploys sibling `*.form` files when
reebe-wasm can deploy forms; if reebe does not deploy or check forms, the runner ignores them and the
gap is listed in the parity record (a case where CPT fails only because a form is missing would show
up there as a disagreement). No form-filling.

## Parity matrix (the trust check)

Run the tutorial's 6 cases on real CPT (Java, in this sandbox) and on `casen test`, same files:

| File | Expected (CPT) |
|---|---|
| `packages/core/tests/fixtures/bakeoff/expected.bpmn` | 6/6 pass (already measured) |
| rerun outputs bk3, bk4 (scratchpad, not committed) | 6/6 pass (already measured) |
| broken: `Flow_No` condition always false | loop case fails |
| broken: `SearchRecipes` tool removed | recipes case fails |
| broken: agent job type changed | all cases fail |
| broken: user task without `zeebe:userTask` | user-task cases fail or pass as CPT decides |
| broken: feedback form id changed / form missing | as CPT decides |

Every cell must agree. Disagreements are fixed in the runner or reebe, or — if the cause is an
intended reebe/Zeebe difference — documented next to the runner with the case that shows it. The
result table is committed as `doc/cpt-on-reebe-parity.md`. CI does not run CPT.

## Test material and licensing

The tutorial's test JSON comes from `camunda/camunda-8-tutorials`. Before committing any of it,
check that repository's licence. If it permits redistribution, commit it (with attribution) as the
runner's fixture; if not, write an equivalent BPMN Kit-authored CPT-format file for the bake-off
fixture and keep the tutorial file out of the repo (the parity run uses it from the scratchpad).

## Testing

- Rust: the three `complete_job_with_result` tests above.
- TS runner (Vitest): each supported instruction on small BPMN fixtures; the bake-off fixture's 6
  cases pass; each broken variant fails at the expected instruction with a useful message; unknown
  type / unknown selector field fails before running; one engine per case (state does not leak).
- CLI: format detection, `--case`, exit codes, default lookup of `<name>.test.json`.
- Parity: the one-off matrix above, recorded.

## Constraints

- No new runtime dependencies. The runner's tests need the built `@bpmnkit/reebe-wasm`; CI already
  builds it (`ci.yml`: wasm32 target + wasm-pack). Locally the implementer installs the same two
  tools; nothing new is added to CI.
- Existing `casen test` scenario files and `runScenarioWasm` behave exactly as before.
- Zero type errors, zero Biome findings, all tests green; changesets for the published packages
  touched (`@bpmnkit/engine`, `@bpmnkit/cli`, and `@bpmnkit/reebe-wasm` if it is published); `doc/progress.md`, `doc/features.md`.

## Not in scope

CI, drop's readiness verdict, other instruction types, form filling, retries/timers/messages,
connector execution (CPT runs with connectors disabled; jobs are completed by the test).
