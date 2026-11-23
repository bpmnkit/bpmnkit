# BPMN Kit Fluent — the fluent builder — Branching and joins

- A gateway followed by `.branch(...)` calls splits the flow; each branch starts at the gateway.
- Branches that end at the same element merge there; the builder inserts a matching join gateway
  (parallel for parallel, inclusive for inclusive) when needed. Call `build({ explicitJoins: true })`
  to refuse inferred joins instead.
- Exactly one branch of an exclusive gateway should be `.defaultFlow()`.
- To close a branch on a node you declared yourself, use `.connectTo(id)`.

See [Gateways & Branching](/docs/guides/gateways).


## Continue mode

`Bpmn.continueProcess(Bpmn.parse(xml), "id")` edits an existing model: `.at(id)` continues from an
open node, `.insertAfter(id)` splices into an existing flow (the flow keeps its id). Continue mode never
infers gateways — use `.connectTo()` for joins — and existing diagram shapes are left as they are.

---
Source: https://bpmnkit.com/docs/guides/fluent-builder
