# @bpmnkit/core — Installation — `expand(compact)`

Builds a `BpmnDefinitions` object from a `CompactDiagram`. It restores only what the compact
form carries, so `expand(compactify(definitions))` is not `definitions` — use this to build a
model from a compact definition, not as a round trip for a file you need to keep.

```typescript
import { expand } from "@bpmnkit/core";

const definitions = expand(compactDiagram);
const xml = Bpmn.export(definitions);
```

Every element type the model knows expands to itself, data elements included. The switch is
exhaustive, so a new `BpmnElementType` fails the build here rather than silently arriving as a
`task` — which is how `dataObject`, `dataObjectReference` and `dataStoreReference` were lost.

`expand` throws when the diagram cannot be valid BPMN. The cases are:

- a flow that names an element outside its own scope (a sub-process's flows see only that
  sub-process's children)
- a boundary event without a host in the same scope
- a duplicate id, across elements, flows and processes
- a missing element or flow id
- an unknown `eventType`

The error lists every problem in one message. It does this so that a diagram written by a language
model can be sent back with the list instead of being turned into XML that a modeler rejects later.

---
Source: https://bpmnkit.com/docs/packages/core
