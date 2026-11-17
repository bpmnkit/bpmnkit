# @bpmnkit/core — Installation — ProcessBuilder — lanes and pools

```typescript
const defs = Bpmn.createProcess("order")
  .name("Order")
  .startEvent("start").userTask("review").serviceTask("ship", { taskType: "ship" }).endEvent("end")
  .lane("Lane_sales", { name: "Sales" })
  .lane("Lane_inside", { name: "Inside sales", parent: "Lane_sales", flowNodes: ["start", "review"] })
  .lane("Lane_ops", { name: "Operations", flowNodes: ["ship", "end"] })
  .participant("Pool_company", { name: "Company" })   // optional
  .withAutoLayout()
  .build();
```

`.lane(id, { name?, flowNodes?, parent? })` declares a lane; `parent` makes it a child lane, and
only leaf lanes take `flowNodes`. Refs are written verbatim, boundary events follow their host,
an inferred join gateway follows its first predecessor, and parent lanes list the union of their
children's refs. Once any lane exists every top-level flow node must sit in exactly one leaf
lane: `build()` throws `Invalid lanes:` listing every problem at once — an unknown or
sub-process ref, a node in two lanes, flow nodes on a parent lane, an undeclared or cyclic
parent, an id already in use, an unassigned node.

Lanes imply a pool: without `.participant(id, { name? })` the build adds
`Participant_<processId>` named after the process. `.participant()` without lanes just pools
the process. With neither call the output is exactly what it was before lanes existed — no
collaboration. With `.withAutoLayout()` nodes sit inside their lanes, lanes tile the pool, and
the plane draws the collaboration.

---
Source: https://bpmnkit.com/docs/packages/core
