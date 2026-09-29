---
title: "@bpmnkit/flow"
description: Code-first durable flows — one TypeScript definition yields the BPMN, the job types, the message correlation and the worker.
sidebar:
  order: 7
---

`@bpmnkit/flow` lets you write a durable workflow as a chain of TypeScript steps. From that
one definition it derives the executable BPMN process, a job type for every step, the message
correlation of every wait, and a worker that serves the handler steps. The model and the code
cannot drift apart, because there is only one of them.

The engine holds the run state, not your process. An instance survives a crash or a reboot and
continues at the step it reached. That makes a flow a good home for agent work: an LLM decides
what to do, and the engine remembers what is done. See
[Durable Agent Flows](/docs/guides/durable-agent-flows) for the end-to-end guide.

The package is [Experimental](/docs/getting-started/stability#product-tiers).

## Installation

```sh
npm install @bpmnkit/flow
```

## Quick start

```typescript
import { writeFileSync } from "node:fs"
import { defineFlow } from "@bpmnkit/flow"

const review = defineFlow("pr-review", { name: "PR review" })
  .input<{ prKey: string }>()
  .run("fetch-diff", async ({ prKey }) => ({ diff: await gh.diff(prKey) }))
  .agent("review", { role: "pr-review", prompt: "Review this diff:\n{{diff}}", result: "verdict" })
  .waitFor("ci-green", { correlationKey: "prKey" })
  .approve("approve-merge", { candidateGroups: "maintainers" })
  .run("merge", async ({ prKey, verdict }) => ({ merged: await gh.merge(prKey, verdict) }))
  .build()

writeFileSync("pr-review.bpmn", review.toXml()) // deploy with `casen deploy deploy pr-review.bpmn`
const worker = review.worker() // serves fetch-diff and merge
```

## Steps

`defineFlow(id, { name? })` starts a flow. Chain steps, then call `build()`. Every method
returns a new builder, so a builder you keep a reference to never changes.

| Method | BPMN element | Adds to the variables |
|---|---|---|
| `.input<I>()` | — | `I` |
| `.run(id, handler, { name?, retries? })` | service task, job type `<flowId>.<id>` | what the handler returns |
| `.agent(id, { role, rank?, prompt, result? })` | service task, job type `agent:<role>` or `agent:<rank>:<role>` | `{ [result]: string }` — default `result` |
| `.waitFor<P>(id, { correlationKey, message? })` | message catch event, correlated on `=<correlationKey>` | `P` |
| `.approve<P>(id, { name?, assignee?, candidateGroups? })` | Camunda user task | `P` |

Step ids must be unique in the flow and must not be `start` or `end`, which the flow uses for
its own events. `retries` defaults to 3. A wait's `message` defaults to its id.

### Typed data flow

Each step's output joins the variables that later steps see. These are compile errors:

```typescript
defineFlow("t")
  .input<{ a: string }>()
  .run("one", (v) => ({ c: v.b }))                           // no variable `b`
  .agent("two", { role: "r", prompt: "Summarise {{b}}" })     // no variable `b` in the prompt
  .waitFor("three", { correlationKey: "b" })                  // no variable `b` to correlate on
```

A step that returns an existing variable name replaces its type for the steps after it.

### Handlers

A handler gets the instance's variables and a context, and returns the variables it adds, or
nothing:

```typescript
.run("charge", async ({ orderId, amount }, { jobKey }) => {
  await payments.charge(orderId, amount, { idempotencyKey: jobKey })
  return { charged: true }
})
```

Delivery is at least once. If the worker crashes after the handler finished but before the
engine heard about it, the handler runs again. Use `jobKey` (or a business key) to make the
side effect idempotent. A handler that throws fails the job; the engine retries it until the
step's retries run out and then raises an incident.

## `Flow`

| Member | Description |
|---|---|
| `toXml()` | The laid-out BPMN XML to deploy |
| `definitions()` | The same process as a `BpmnDefinitions` object |
| `jobTypes` | Job types of the `.run()` steps |
| `agentJobTypes` | Job types the agent workforce must serve |
| `steps` | The steps, in order |
| `worker(options?)` | Starts polling the `.run()` job types |

### `flow.worker(options?)`

Returns `{ done, stop() }` at once. `done` settles when every poll has ended: it resolves after
`stop()` and rejects with the first error polling cannot recover from, such as rejected
credentials. `stop()` resolves once the jobs in progress are settled.

| Option | Default | Description |
|---|---|---|
| `address`, `clientId`, … | environment | [`@bpmnkit/worker-client`](/docs/packages/worker-client) connection options |
| `maxJobs` | `1` | Jobs activated per poll. A step's jobs run one after another |
| `timeout` | `300_000` | Job lock timeout, in ms |
| `onError` | warning on stderr | Transient poll errors, and jobs the engine would not settle |
| `signal` | — | Stops the worker when it aborts |
| `client` | — | A `WorkerClient` to use instead of creating one |

## Testing a flow on the simulator

`definitions()` deploys straight into [`@bpmnkit/engine`](/docs/packages/engine), and each
`run` step exposes its job type and handler:

```typescript
import { Engine } from "@bpmnkit/engine"

const engine = new Engine()
engine.deploy({ bpmn: review.definitions() })
for (const step of review.steps) {
  if (step.kind !== "run") continue
  engine.registerJobWorker(step.jobType, async (job) => {
    job.complete({ ...(await step.handler(job.variables, { jobKey: job.id, processInstanceKey: "1", retries: 3 })) })
  })
}
engine.registerJobWorker("agent:pr-review", (job) => job.complete({ verdict: "approve" }))
```

## The agent contract

An `.agent()` step is a service task with two task headers: `prompt` (the template) and
`resultVariable` (where the output goes). `casen agent work` serves it — see
[Durable Agent Flows](/docs/guides/durable-agent-flows). To write your own agent worker, use
the same helpers:

| Export | Description |
|---|---|
| `agentJobType(role, rank?)` | `agent:<role>`, or `agent:<rank>:<role>` |
| `agentJobTypes(roles, rank?)` | Every type a worker with these roles serves: each role, then each role at its rank |
| `renderPrompt(template, variables)` | Fills `{{name}}` — strings as is, anything else as JSON. Throws on a missing variable |
| `promptVariables(template)` | The variable names a template refers to |
| `AGENT_PROMPT_HEADER`, `AGENT_RESULT_HEADER`, `DEFAULT_AGENT_RESULT` | `"prompt"`, `"resultVariable"`, `"result"` |
