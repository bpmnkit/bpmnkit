---
title: BPMN Kit Fluent — the fluent builder
description: BPMN Kit Fluent (bpmnkit fluent) is the typed, chainable TypeScript API in @bpmnkit/core that builds BPMN 2.0 XML with Zeebe extensions and auto layout.
sidebar:
  order: 0
---

## What it is

**BPMN Kit Fluent** (short: *bpmnkit fluent*) is the typed, chainable TypeScript API for building
BPMN. It is MIT licensed, ships in [`@bpmnkit/core`](/docs/packages/core) and starts at
`Bpmn.createProcess(...)`. It produces BPMN 2.0 XML with Zeebe extensions and, with
`.withAutoLayout()`, a laid-out diagram. `build()` refuses a model Camunda 8 would not deploy
([deploy gate](/docs/guides/deploy-gate)).

## Install and quick example

```sh
pnpm add @bpmnkit/core
```

```typescript
import { Bpmn } from "@bpmnkit/core";

const xml = Bpmn.export(
  Bpmn.createProcess("order-process")
    .name("Order process")
    .startEvent("start", { name: "Order received" })
    .serviceTask("validate", { name: "Validate", taskType: "validate-order" })
    .exclusiveGateway("valid?", { name: "Valid?" })
    .branch("yes", (b) => b.condition("= valid").userTask("ship", { name: "Ship" }).endEvent("done"))
    .branch("no", (b) => b.defaultFlow().endEvent("rejected"))
    .withAutoLayout()
    .build(),
);
```

## Cheat sheet

| Method | What it does |
|---|---|
| `Bpmn.createProcess(id)` | Start a new `ProcessBuilder`; `.name(text)` names it |
| `Bpmn.continueProcess(defs, processId)` / `ProcessBuilder.from(defs, processId)` | Continue a parsed model instead of replacing it |
| `Bpmn.createDiagram(id?)` | `DiagramBuilder`: several processes in one document (`.process(id, p => …)`) |
| `.startEvent(id?, options?)` / `.endEvent(id?, options?)` | Start and end events |
| `.serviceTask(id, options)` / `.userTask(id, options?)` | Tasks; also `scriptTask`, `sendTask`, `receiveTask`, `businessRuleTask`, `manualTask`, `task`, `callActivity` |
| `.exclusiveGateway` / `.parallelGateway` / `.inclusiveGateway` `(id, options?)` | XOR, AND, OR gateways |
| `.branch(name, b => …)` | One outgoing path of the preceding gateway |
| `.condition(expr)` / `.defaultFlow()` | Inside a branch: FEEL condition, or the fallthrough flow |
| `.connectTo(targetId)` | Wire the current path to an existing element (loops, explicit joins) |
| `.lane(id, options?)` / `.participant(id, options?)` | Lanes and the pool the process is drawn in |
| `.withAutoLayout()` | Compute shapes and waypoints before `build()` |
| `.build(options?)` | Return the `BpmnDefinitions` (deploy-gated) |
| `.at(nodeId)` / `.insertAfter(nodeId)` | Continue mode: extend from an open node, or splice into the path after one |
| `Bpmn.export(defs)` / `Bpmn.parse(xml)` | Model → XML, XML → model |

Full option lists: [packages/core](/docs/packages/core).

## Branching and joins

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

## DMN and forms

DMN and forms are not fluent chains: use `Dmn.parse` / `Dmn.export` / `Dmn.drd()` and
`Form.parse` / `Form.export`. See [packages/core](/docs/packages/core).

## Fluent vs process text

Use the fluent builder when you write the model in TypeScript and want types and refactoring.
Use `parseProcessText` when a language model writes the process: it is a compact line format
that costs about a quarter of the output tokens, and both end in the same model.

## Next

[Building Processes](/docs/guides/building-processes) · [Gateways & Branching](/docs/guides/gateways) · [`@bpmnkit/core`](/docs/packages/core)
