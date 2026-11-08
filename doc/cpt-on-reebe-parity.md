# `casen test` parity with Camunda Process Test

Date: 2026-10-18.

This record compares `casen test` (Camunda process-test JSON on reebe-wasm) with real Camunda Process
Test (CPT). Both engines ran the same test file on the same BPMN files. A case agrees when both engines
pass it or both fail it.

## Setup

- CPT: `camunda-process-test-spring` 8.10.0 with the `camunda/camunda:8.10.0` container, Java 21,
  Maven 3.9, connectors off. The Maven project also deploys the tutorial's two `.form` files.
- casen: `casen test test <file.bpmn> --scenarios ai-agent-chat-with-tools.test.json`, reebe-wasm from
  this repository.
- Test file: the six cases of `ai-agent-chat-with-tools.test.json` from Camunda's AI agent tutorial.
  It is not committed, because its repository states no licence.
  `packages/engine/tests/cpt/fixtures/bakeoff.test.json` is our own file with the same cases.

## Files

| # | File | Change |
|---|---|---|
| 1 | `expected` | `packages/core/tests/fixtures/bakeoff/expected.bpmn`, unchanged |
| 2 | `bk3` | bake-off rerun output bk3 (not committed) |
| 3 | `bk4` | bake-off rerun output bk4 (not committed) |
| 4 | `flow-no-false` | `expected` with the `Flow_No` condition set to `=false` |
| 5 | `no-searchrecipes` | `expected` without the `SearchRecipes` tool |
| 6 | `agent-type-v1` | `expected` with the agent job type `io.camunda.agenticai:aiagent:subprocess:1` |
| 7 | `no-zeebe-usertask` | `expected` without `<zeebe:userTask/>` on `UserTask_ReviewAgentResponse` |
| 8 | `form-missing` | `expected` with the feedback form id `missing-form` |

## Cases

| Case | Name in the test file |
|---|---|
| Happy | Happy path — user satisfied on first response (no tool calls) |
| Loop | Loop path — user not satisfied, then satisfied on second try |
| Users | LookupSampleUsers tool — agent calls LookupSampleUsers then responds |
| Recipes | SearchRecipes tool — agent searches for a recipe |
| Joke | FetchSafeJoke tool — agent fetches a random joke |
| Products | ListSampleTechnologyProducts tool — agent gets list of tech stuff |

## Matrix

Each cell is CPT / casen. ✓ is pass, ✗ is fail.

| File | Happy | Loop | Users | Recipes | Joke | Products | Agree |
|---|---|---|---|---|---|---|---|
| 1 `expected` | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | 6/6 |
| 2 `bk3` | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | 6/6 |
| 3 `bk4` | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | 6/6 |
| 4 `flow-no-false` | ✓ / ✓ | ✗ / ✗ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | 6/6 |
| 5 `no-searchrecipes` | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✗ / ✗ | ✓ / ✓ | ✓ / ✓ | 6/6 |
| 6 `agent-type-v1` | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | 6/6 |
| 7 `no-zeebe-usertask` | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ | 6/6 (after a runner fix) |
| 8 `form-missing` | ✗ / ✓ | ✗ / ✓ | ✗ / ✓ | ✗ / ✓ | ✗ / ✓ | ✗ / ✓ | 0/6, documented |

42 of 48 cells agree. The 6 cells of file 8 are a known difference (forms, below).

The failures also happen at the same step on both engines:

| File | CPT | casen |
|---|---|---|
| 4 | Loop: no `aiagent:subprocess:2` job for the second agent turn; incident `CONDITION_ERROR` at `Gateway_UserSatisfied` | Loop: instruction 4, no open job; incident at `Gateway_UserSatisfied` |
| 5 | Recipes: `AI_Agent` stays active with no incident, and no `aiagent:subprocess:2` job is available | Recipes: instruction 1, reebe rejects `SearchRecipes` as not an element the ad-hoc sub-process can activate |
| 6 | All: no `aiagent:subprocess:2` job | All: instruction 1, no open job; the open job is `aiagent:subprocess:1` |
| 7 | All: no user task `UserTask_ReviewAgentResponse` | All: the `COMPLETE_USER_TASK` instruction; the task has no `zeebe:userTask` |
| 8 | All: incident `FORM_NOT_FOUND` at `UserTask_ReviewAgentResponse`, so no user task | All pass |

## Differences

### Job-worker user tasks (fixed in the runner)

Zeebe runs a `userTask` without `<zeebe:userTask/>` as a job-worker user task. Camunda's user-task API
does not list it, so CPT's `COMPLETE_USER_TASK` finds nothing (file 7). reebe runs every user task as
a Camunda user task, so the first casen run passed all six cases.

The runner now skips user tasks without `zeebe:userTask` when it matches a user-task selector, and the
failure message says why. Regression test: "does not complete a user task without zeebe:userTask" in
`packages/engine/tests/cpt/run.test.ts`.

What is still different: CPT can complete a job-worker user task with `COMPLETE_JOB` on job type
`io.camunda.zeebe:userTask`. reebe creates no such job, so that instruction fails on casen. No case
in this matrix uses it.

### Forms (documented, not fixed)

Zeebe checks a user task's `formId` against the deployed forms when the task activates. A missing form
raises a `FORM_NOT_FOUND` incident, so the task never opens and CPT fails every case (file 8). reebe
does not deploy or check forms, and `casen test` ignores `.form` files, so all six cases pass. Check
form ids with the form files in Camunda, or with a CPT run, until reebe deploys forms.

## Run time

Wall time for the six cases of one file, including start-up.

| File | CPT | casen |
|---|---|---|
| 1 `expected` | 95 s | 0.6 s |
| 2 `bk3` | 57 s | 0.6 s |
| 3 `bk4` | 56 s | 0.6 s |
| 4 `flow-no-false` | 64 s | 0.7 s |
| 5 `no-searchrecipes` | 61 s | 0.6 s |
| 6 `agent-type-v1` | 106 s | 0.5 s |
| 7 `no-zeebe-usertask` | 112 s | 0.6 s |
| 8 `form-missing` | 111 s | 0.8 s |

CPT starts a Camunda container for each run. A missing job or user task costs about 10 s per case,
because CPT waits for it before it fails. reebe-wasm finishes each step at once, so casen fails at
once and lists what is open instead.
