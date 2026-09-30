# @bpmnkit/core — Installation — `parseProcessText(text)` and `createProcessTextStream()`

A line format for a model to write a new process in. It costs about a quarter of the output
tokens of minified compact JSON. A path is written once as `a > b > c`, a node is declared inline
the first time it is used, and the parser adds what the model would otherwise spend tokens on.
`PROCESS_TEXT_GUIDE` is the part of a system prompt that teaches the format (~250 tokens,
example included).

```text
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay] > notice[end:error Failure notified]
```

```typescript
import { expand, Bpmn, parseProcessText, PROCESS_TEXT_GUIDE } from "@bpmnkit/core";

const { diagram, problems, fixes } = parseProcessText(modelOutput);
const xml = Bpmn.export(expand(diagram));
```

`parseProcessText` never throws, and its diagram always expands. Text it cannot use is returned
in `problems` with its line number, and it does not appear in the diagram. What it adds is listed
in `fixes`:

- flow ids are generated
- an id used but never declared becomes a task named from it
- an id declared again after an arrow, with a different kind or name, is a new node (`done_2`),
  and later bare references mean the newest; restated at the start of a line, it is the node
  already there
- branches that meet at a task or event are joined by an exclusive gateway first
- a condition that is not FEEL (`applicant is eligible`) moves into the branch label and is
  reported, so it cannot fail at deploy time
- the only unconditioned branch of an xor/or split becomes its default
- a missing start event is added
- an end event is added after every path that stops elsewhere
- a service or send task without `job=` takes its id as job type, and a rule task its id as
  decision id

`createProcessTextStream()` reads the same format while it arrives. It reads each finished line
as it arrives, so every frame is built from whole facts. `push(chunk)` returns a laid-out frame,
or `null` when nothing new is drawable. `end()` returns what `parseProcessText` would.

---
Source: https://bpmnkit.com/docs/packages/core
