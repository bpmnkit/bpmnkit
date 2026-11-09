import { readFileSync, writeFileSync } from "node:fs"
import { Bpmn, exportPreserving, lintDiagram, placeNewShapes } from "@bpmnkit/core"

// 1. Create. The process id is the deploy key: same id = new version of that process.
const definitions = Bpmn.createProcess("order")
	.name("Order")
	.withAutoLayout()
	.startEvent("received", { name: "Order received" })
	.businessRuleTask("score", { name: "Score risk", decisionId: "risk", resultVariable: "risk" })
	.exclusiveGateway("check", { name: "Risky?" })
	.branch("yes", (b) =>
		b
			.condition('=risk = "high"')
			.label("Yes")
			.userTask("review", { name: "Review order", formId: "review-order", zeebeUserTask: true })
			.connectTo("ship"),
	)
	.branch("no", (b) => b.defaultFlow().label("No").connectTo("ship"))
	.serviceTask("ship", { name: "Ship order", taskType: "ship-order", retries: "3" })
	.endEvent("done", { name: "Order shipped" })
	.build()

// 2. Export.
writeFileSync("order.bpmn", Bpmn.export(definitions))

// 3. Edit an existing file: change the model, draw only the new elements, write with
//    exportPreserving. Existing shapes keep their positions and the file its formatting.
const original = readFileSync("order.bpmn", "utf8")
const edited = Bpmn.continueProcess(Bpmn.parse(original), "order")
	.insertAfter("ship")
	.serviceTask("notify", { name: "Notify customer", taskType: "notify-customer" })
	.build()
const ship = edited.processes[0]?.flowElements.find((e) => e.id === "ship")
if (ship) ship.name = "Ship parcel"
const { definitions: drawn, unplaced } = placeNewShapes(edited)
if (unplaced.length > 0) console.log("not drawn:", unplaced)
writeFileSync("order.bpmn", exportPreserving(original, drawn))

// 4. Validate: Camunda 8 deployability and modelling rules.
const report = lintDiagram(Bpmn.parse(readFileSync("order.bpmn", "utf8")))
for (const d of report.diagnostics.filter((d) => d.severity !== "info"))
	console.log(`${d.severity} ${d.elementIds.join(",")}: ${d.message}`)
if (report.counts.error > 0) process.exit(1)
