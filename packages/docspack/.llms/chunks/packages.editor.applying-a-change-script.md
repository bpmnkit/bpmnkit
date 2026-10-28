# @bpmnkit/editor — Applying a change script

`applyProcessDelta` applies a change script (`parseProcessDelta` from `@bpmnkit/core`) to a
diagram someone drew, without laying it out again. It goes through the same modelling functions
a person's edit does, so only what the change touches moves:

- a new node is placed beside the node it follows, below anything in its way;
- new nodes written between two connected nodes (`a > new > b`) replace the flow `a > b`, keep
  its condition or default, and sit in the gap — the shapes right of it move along if the gap is
  too narrow, and pools and lanes widen with them;
- a new node joins the lane it is drawn in, else its predecessor's (a boundary event its host's);
- removing a node with one way in and one way out joins its neighbours, unless the script
  connected them itself;
- a retyped node keeps its centre, extensions and flows;
- `lane x: a, b` moves `a` and `b` into lane `x` — straight up or down into its band, their
  message edges following — and renames it when the line names it differently; a new id adds a
  lane band at the bottom of the pool, shifting what is below. On a process without lanes the
  first lane line draws the pool around it and puts every node in that lane (listed in `fixes`).
  New lanes are never nested; a line naming a parent lane is a problem;
- `- x` naming a lane removes it: the lane drawn above it (below, for the first) takes its band
  and its nodes; the last lane's removal leaves the pool;
- `pool p[Name]` renames a pool, or adds a black-box partner below the diagram; `- p` removes a
  black box and its messages (never the process's own pool or one that draws a process);
- `msg a >(Label) p` adds a message between a node and a partner pool with a vertical edge,
  under the same rules as the process text; `- msg a > p` removes it. A message whose node is
  removed goes with it.

```typescript
import { parseProcessDelta, writeProcessText } from "@bpmnkit/core";
import { applyProcessDelta } from "@bpmnkit/editor/headless";

const { text, aliases } = writeProcessText(defs);
const result = applyProcessDelta(defs, parseProcessDelta(modelOutput), { aliases });
// result.definitions, created, changed, removed, addressed, fixes, problems
```

It never throws on the script and never mutates `defs`. Ids that name nothing, kinds that
cannot be created and attributes the Zeebe schema forbids are reported in `problems` and left
out. It acts on the primary process (`primaryProcess`: the executable one, as
`writeProcessText` writes it) and the diagram that draws it, even when they are not the first;
other processes, their `isExecutable` and `flowable:*` content are left as they were. Pass
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
