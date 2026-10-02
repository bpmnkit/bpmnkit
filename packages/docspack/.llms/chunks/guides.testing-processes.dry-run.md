# Testing Processes — Dry run

`dryRun(definitions)` runs a process once from start to end with every outside call
mocked. It needs no test file and no mocks. It proves that a diagram, such as one an AI
generated, is executable and not only well-formed:

```typescript
import { dryRun } from "@bpmnkit/engine/testing"

const result = await dryRun(definitions)
result.reachedEnd   // true when every token finished
result.path         // elements entered, in order
result.connectors   // connector tasks passed, each mocked
result.stoppedAt    // where it stopped, when it did not reach the end
result.error        // why: the incident, or what it still waited for
```

- **Connectors.** Each connector answers an empty HTTP 200, `{ status: 200, headers: {}, body: {} }`,
  mapped by its result headers. Pass `response` for another answer.
- **Other jobs.** Service tasks, user tasks and agents complete with no variables.
- **Gateways.** A gateway takes the branch its conditions pick, which is the default flow
  when none holds. Pass `variables` to start with others.
- **Multi-instance.** A multi-instance over a variable (`=recipients`) runs over a one-item
  list, unless `variables` gives the list.
- **Waits.** When the run waits, the message it waits for is delivered. Otherwise the clock
  moves on a day, which fires due timers. `steps` lists what was done.

A process that cannot finish does not throw: `reachedEnd` is false, and `stoppedAt` and
`error` say where and why. For example, a gateway with no matching condition and no default
flow. `casen synth --check` and Drop's generator run it on what they produce.

---
Source: https://bpmnkit.com/docs/guides/testing-processes
