# @bpmnkit/core — Installation — `writeProcessText(defs)` and `parseProcessDelta(text)`

The other direction, for changing a diagram that already exists. `writeProcessText` writes one
process of a document in the line format, so a model can read it: the executable one
(`primaryProcess`), which in a Modeler collaboration is not always first. Each node, lane and
pool is written under a short readable alias (`review_application` for `Activity_0x9k2lm`), and
the map back to the real ids comes with the text. Only what the format can express is written:
flow nodes and sequence flows, with names, triggers, `job=` and conditions, the tasks of an
ad-hoc sub-process, notes and documentation; one `lane` line per leaf lane with the nodes it
holds; one `pool` line per other participant of the collaboration, as a black box; and a `msg`
line for each message flow between a node of the process and such a pool. Parent lanes of nested
lanes, the content of other pools, messages that touch the process's own pool or another pool's
nodes, data objects and the inside of other sub-processes are left out, so a change cannot reach
them. A diagram without lanes or other pools is written exactly as before.

```
lane inside_sales[Inside sales]: start, review
lane operations[Operations]: ship, done
pool customer[Customer]
msg ship >(Confirmation) customer
```

The model answers with a **change script** (`PROCESS_DELTA_GUIDE`): the same line format, but
only what changes. An existing node is named by its id; declaring it again changes its kind or
name; `- x` and `- a > b` remove; `@2 x y` says which feedback item a change answers.
Swimlanes take their own lines: `lane sales: a, b` moves `a` and `b` into lane `sales`, and
`lane ops[Operations]: c` adds the lane or renames it (a bare lane line keeps the name; a lane
line with a name and no members only adds or renames). `pool bank[Bank]` adds or renames a partner
pool, `msg pay >(Payment) bank` adds a message flow between a node and a pool (the label is kept
as written, colons included), and `- msg pay > bank` removes one. `- x` removes any id, a lane or
a pool included. Lane lines are flat: nested lanes are not written, and the applier keeps the
ones a diagram already has.

```typescript
import { PROCESS_DELTA_GUIDE, PROCESS_TEXT_GUIDE, parseProcessDelta, writeProcessText } from "@bpmnkit/core";

const { text, aliases } = writeProcessText(defs);
// system: PROCESS_TEXT_GUIDE + PROCESS_DELTA_GUIDE; user: text + the feedback
const delta = parseProcessDelta(modelOutput);
// { nodes, flows, removedNodes, removedFlows, addressed, lanes, pools,
//   messageFlows, removedMessageFlows, connectors, notes, docs, problems }
```

`parseProcessDelta` never throws and resolves nothing: it reads the script. Apply it with
`applyProcessDelta` from `@bpmnkit/editor/headless`, which keeps the diagram's layout.

---
Source: https://bpmnkit.com/docs/packages/core
