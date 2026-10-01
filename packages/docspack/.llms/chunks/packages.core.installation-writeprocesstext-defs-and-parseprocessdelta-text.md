# @bpmnkit/core — Installation — `writeProcessText(defs)` and `parseProcessDelta(text)`

The other direction, for changing a diagram that already exists. `writeProcessText` writes the
first process of a document in the line format, so a model can read it. Each node is written
under a short readable alias (`review_application` for `Activity_0x9k2lm`), and the map back to
the real ids comes with the text. Only what the format can express is written: flow nodes and
sequence flows, with names, triggers, `job=` and conditions. Lanes, data objects, annotations
and the inside of a sub-process are left out, so a change cannot reach them.

The model answers with a **change script** (`PROCESS_DELTA_GUIDE`): the same line format, but
only what changes. An existing node is named by its id; declaring it again changes its kind or
name; `- x` and `- a > b` remove; `@2 x y` says which feedback item a change answers.

```typescript
import { PROCESS_DELTA_GUIDE, PROCESS_TEXT_GUIDE, parseProcessDelta, writeProcessText } from "@bpmnkit/core";

const { text, aliases } = writeProcessText(defs);
// system: PROCESS_TEXT_GUIDE + PROCESS_DELTA_GUIDE; user: text + the feedback
const delta = parseProcessDelta(modelOutput);
// { nodes, flows, removedNodes, removedFlows, addressed, problems }
```

`parseProcessDelta` never throws and resolves nothing: it reads the script. Apply it with
`applyProcessDelta` from `@bpmnkit/editor/headless`, which keeps the diagram's layout.

---
Source: https://bpmnkit.com/docs/packages/core
