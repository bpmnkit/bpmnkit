# @bpmnkit/editor — Applying a change script

`applyProcessDelta` applies a change script (`parseProcessDelta` from `@bpmnkit/core`) to a
diagram someone drew, without laying it out again. It goes through the same modelling functions
a person's edit does, so only what the change touches moves:

- a new node is placed beside the node it follows, below anything in its way;
- new nodes written between two connected nodes (`a > new > b`) replace the flow `a > b`, keep
  its condition or default, and sit in the gap — the shapes right of it move along if the gap is
  too narrow, and pools and lanes widen with them;
- a new node joins the lane it is drawn in;
- removing a node with one way in and one way out joins its neighbours, unless the script
  connected them itself;
- a retyped node keeps its centre, extensions and flows.

```typescript
import { parseProcessDelta, writeProcessText } from "@bpmnkit/core";
import { applyProcessDelta } from "@bpmnkit/editor/headless";

const { text, aliases } = writeProcessText(defs);
const result = applyProcessDelta(defs, parseProcessDelta(modelOutput), { aliases });
// result.definitions, created, changed, removed, addressed, fixes, problems
```

It never throws on the script and never mutates `defs`. Ids that name nothing, kinds that
cannot be created and attributes the Zeebe schema forbids are reported in `problems` and left
out. Like the editor's other modelling functions, it acts on the first process. Pass
`ids: createIdFactory(seed)` for a result that replays identically.

A script's `with` lines configure connectors, on existing nodes or ones the script adds. They
need the connector catalog, which this package does not carry. Pass `applyConnectorLines` from
`@bpmnkit/core/connectors` as `applyConnectors`. Required inputs the lines left out come back as
`result.questions`.

```typescript
import { applyConnectorLines, connectorLineFor } from "@bpmnkit/core/connectors";

const { text, aliases } = writeProcessText(defs, { connectorLine: connectorLineFor });
const result = applyProcessDelta(defs, parseProcessDelta(modelOutput), {
  aliases,
  applyConnectors: applyConnectorLines,
});
```

---
Source: https://bpmnkit.com/docs/packages/editor
