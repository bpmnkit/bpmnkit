# @bpmnkit/flow — Steps

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

---
Source: https://bpmnkit.com/docs/packages/flow
