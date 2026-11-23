# BPMN Kit Fluent — the fluent builder — What it is

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

---
Source: https://bpmnkit.com/docs/guides/fluent-builder
