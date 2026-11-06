# DMN agent card — Several decisions in one file: `Dmn.drd()`

```ts
import { writeFileSync } from "node:fs"
import { Dmn } from "@bpmnkit/core"

// Two decisions in one file: "approval" reads the result of "riskScore".
const drd = Dmn.drd("Order approval")
const riskScore = drd.decision("riskScore", (t) =>
	t
		.name("Risk score")
		.hitPolicy("FIRST")
		.input({ label: "Amount", expression: "amount", typeRef: "number" })
		.output({ label: "Risk", name: "risk", typeRef: "string" })
		.rule({ inputs: ["> 1000"], outputs: ['"high"'] })
		.rule({ inputs: ["-"], outputs: ['"low"'] }),
)
drd.decision(
	"approval",
	(t) =>
		t
			.name("Approval")
			.input({ label: "Risk", expression: "risk", typeRef: "string" })
			.output({ label: "Approved", name: "approved", typeRef: "boolean" })
			.rule({ inputs: ['"low"'], outputs: ["true"] })
			.rule({ inputs: ["-"], outputs: ["false"] }),
	{ requires: [riskScore] }, // pass the handle; a name or label is a type error
)
writeFileSync("approval.dmn", drd.toXml())
```

`drd.decision(id, table, { requires })` returns a handle; `requires` takes handles (or `drd.inputData(id, name)` handles), never names. A `requires` that points at an unknown id throws at `build()`/`toXml()`.

---
Source: https://bpmnkit.com/docs/agent-cards/dmn
