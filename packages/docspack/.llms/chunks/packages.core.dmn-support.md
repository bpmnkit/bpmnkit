# @bpmnkit/core — DMN Support

```typescript
import { Dmn } from "@bpmnkit/core";

// Parse DMN XML
const dmnDefs = Dmn.parse(dmnXmlString);

// Create a minimal empty decision table
const empty = Dmn.makeEmpty();

// Export back to XML
const dmnXml = Dmn.export(dmnDefs);
```

### Multi-decision DRDs: `Dmn.drd()`

`decision()` returns a typed handle. A decision that depends on another lists the handle
(or a `drgId("id")`) in `requires`. Use ids, never names or labels: an unknown ref throws a
`ValidationError` at `build()` that lists the valid ids, and a label that matches a decision
name gets the right id suggested. The output has `informationRequirement` hrefs and DMNDI
shapes and edges with automatic layout.

```typescript
import { Dmn } from "@bpmnkit/core";

const drd = Dmn.drd("Approval");
const risk = drd.decision("riskScore", (t) =>
  t.name("Risk Score")
    .input({ expression: "age", typeRef: "number" })
    .output({ name: "risk", typeRef: "string" })
    .rule({ inputs: ["< 18"], outputs: ['"low"'] }),
);
drd.decision(
  "approval",
  (t) =>
    t.name("Approval")
      .input({ expression: "risk" })
      .output({ name: "approved" })
      .rule({ inputs: ['"low"'], outputs: ["true"] }),
  { requires: [risk] }, // handle or drgId("riskScore"), not "Risk Score"
);
const xml = drd.toXml();
```

`Dmn.expand()` (compact DMN) also throws on a `requires` entry that is not a decision or
input data id.

---
Source: https://bpmnkit.com/docs/packages/core
