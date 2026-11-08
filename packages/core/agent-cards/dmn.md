# DMN agent card

Write a Camunda 8 DMN decision table with `@bpmnkit/core` in one script: create, export, edit, validate. Run it with `node --experimental-strip-types build.ts` (Node 22.6+) or `npx tsx build.ts`. Never write DMN XML by hand.

<!-- docspack: tags=agent-card,cheat-sheet,build-script,dmn,decision,decision-table,rules,create,write,script -->

## Minimal DMN build script: create, export, edit, validate

```ts
import { readFileSync, writeFileSync } from "node:fs"
import { Dmn, exportDmnPreserving } from "@bpmnkit/core"

// 1. Create. "risk" is the decision id a BPMN businessRuleTask references as decisionId.
const definitions = Dmn.createDecisionTable("risk")
	.name("Order risk")
	.hitPolicy("FIRST")
	.input({ label: "Amount", expression: "amount", typeRef: "number" })
	.input({ label: "Country", expression: "country", typeRef: "string" })
	.output({ label: "Risk", name: "risk", typeRef: "string" })
	.rule({ inputs: ["> 1000", "-"], outputs: ['"high"'], description: "Large order" })
	.rule({ inputs: ["-", 'not("DE", "AT")'], outputs: ['"medium"'] })
	.rule({ inputs: ["-", "-"], outputs: ['"low"'] })
	.build()

// 2. Export.
writeFileSync("risk.dmn", Dmn.export(definitions))

// 3. Edit an existing file: parse, change, write with exportDmnPreserving to keep the diagram.
const original = readFileSync("risk.dmn", "utf8")
const edited = Dmn.parse(original)
const decision = edited.decisions.find((d) => d.id === "risk")
if (decision) decision.name = "Order risk level"
writeFileSync("risk.dmn", exportDmnPreserving(original, edited))

// 4. Validate: it parses back and the decision id the process calls is there.
const check = Dmn.parse(readFileSync("risk.dmn", "utf8"))
if (!check.decisions.some((d) => d.id === "risk")) {
	console.error("decision 'risk' missing")
	process.exit(1)
}
```

`npm i @bpmnkit/core`. The script writes `risk.dmn` with its diagram, re-opens it, renames the decision without touching the layout, and checks the decision id.

## Several decisions in one file: `Dmn.drd()`

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

## Top builder options

- `Dmn.createDecisionTable(decisionId)` … `.build()` returns `DmnDefinitions`; `Dmn.export(defs)` gives the XML with DMNDI shapes.
- `.name(text)` is the display name; `.hitPolicy("UNIQUE" | "FIRST" | "ANY" | "COLLECT" | "RULE ORDER" | "OUTPUT ORDER" | "PRIORITY")`.
- `.input({ label, expression, typeRef })`: `expression` is a FEEL expression over process variables (`amount`, `order.total`).
- `.output({ label, name, typeRef })`: `name` is the key in the result.
- `.rule({ inputs, outputs, description })`: one entry per column, in column order, or `build` throws.
- `typeRef`: `"string" | "number" | "boolean" | "date"`.
- Read or change an existing file: `Dmn.parse(xml)` → `defs.decisions[i].decisionTable`.

## Traps

- **The process calls the decision id.** A BPMN `businessRuleTask(id, { decisionId: "risk", resultVariable: "risk" })` must use the argument of `createDecisionTable("risk")`, not the DMN `definitions` id, the file name or `.name()`. Ids are unique across the cluster: a second file with decision `risk` deploys as a new version of the same decision.
- **Deploy the `.dmn` before an instance reaches the task.** The call binds to the latest deployed version: `casen deploy deploy risk.dmn` first.
- **Hit policy `UNIQUE` is the default.** Two matching rules is a runtime incident. Use `FIRST` for a catch-all last row, or `COLLECT` for a list.
- **Input entries are FEEL unary tests, outputs are FEEL expressions,** and neither starts with `=`. `-` matches anything; `> 1000`, `[1..10]`, `"DE"`, `not("DE", "AT")`. A string output needs quotes: `'"high"'`, not `"high"`.
- **Result shape.** With one output column the result variable holds the value; with several it holds an object keyed by output `name`; `COLLECT` gives a list.
- **Edit with the preserving writer.** Write `exportDmnPreserving(original, edited)`; `Dmn.export` alone reformats the file and its diagram.

## Validate

```sh
casen check risk.dmn order.bpmn --deploy   # DMN lint + every decisionId in the BPMN resolves
```

`casen check <files...>` takes `.bpmn`, `.dmn` and `.form` together and exits 1 on errors; add `--json` for an agent loop. The script above also re-parses the file and checks the decision id.

Related cards: `casen agent-card bpmn`, `casen agent-card form`. More: `npx bpmnkit-docs ask "decision table hit policy"`.
