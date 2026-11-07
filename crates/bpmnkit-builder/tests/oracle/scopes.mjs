// Dumps TS results for BranchBuilder / SubProcessContentBuilder scenarios into scopes.json.
// Run from the repo root: node crates/bpmnkit-builder/tests/oracle/scopes.mjs
// (CORE_DIST=/path/to/packages/core/dist/index.js overrides the built core to use.)
import { writeFileSync } from "node:fs"

const { Bpmn, resetIdCounter } = await import(
	process.env.CORE_DIST ?? "../../../../packages/core/dist/index.js"
)

const svc = (name) => ({ name, taskType: "work" })

const scenarios = {
	branches: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("gw")
			.branch("yes", (b) =>
				b
					.condition("= x > 1")
					.label("Yes")
					.flowId("F_yes")
					.serviceTask("t1", svc("T1"))
					.withBoundary("bd", { timerDuration: "PT1S" }, (x) => x.endEvent("e2"))
					.exclusiveGateway("inner")
					.branch("a", (c) => c.defaultFlow().task("ta").textAnnotation("note"))
					.branch("b", (c) => c.userTask("tb").connectTo("end")),
			)
			.branch("no", (b) =>
				b
					.defaultFlow()
					.intermediateThrowEvent("lt", { linkName: "L" })
					.textAnnotation("after throw")
					.intermediateCatchEvent("lc", { linkName: "L" })
					.dataObject("d1", { name: "D" })
					.dataObjectReference("dr", "d1")
					.dataAssociation("lc", "dr", "input"),
			)
			.endEvent("end")
			.build(),
	subProcesses: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess(
				"sp",
				(sub) =>
					sub
						.startEvent("ss", { isInterrupting: false })
						.task("a")
						.withBoundary("sb", { timerDuration: "PT5S" }, (x) => x.task("onTimeout"))
						.exclusiveGateway("g")
						.branch("one", (b) => b.task("b1"))
						.branch("two", (b) => b.defaultFlow().task("b2"))
						.task("join")
						.element("a")
						.connectTo("join")
						.endEvent("se")
						.eventSubProcess("esp", (e) =>
							e.startEvent("es", { timerDuration: "PT1H" }).endEvent("ee"),
						),
				{ multiInstance: { collection: "= items", elementVariable: "item" } },
			)
			.transaction("tx", (t) => t.task("x1").task("x2"))
			.adHocSubProcess(
				"ah",
				(h) =>
					h
						.serviceTask("tool1", svc("Tool 1"))
						.serviceTask("tool2", svc("Tool 2"))
						.connectTo("tool1"),
				{ toolGrid: { columns: 2 } },
			)
			.exclusiveGateway("gw")
			.branch("x", (b) =>
				b.eventSubProcess("ev", (e) => e.startEvent("evs").endEvent("eve")).endEvent("xe"),
			)
			.build(),
	dupInSub: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sp", (sub) => sub.task("a").task("a"))
			.build(),
	elementMissing: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sp", (sub) => sub.element("nope"))
			.build(),
	annotationNoCursor: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sp", (sub) => sub.textAnnotation("x"))
			.build(),
	boundaryNoTask: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sp", (sub) => sub.withBoundary("b", { timerDuration: "PT1S" }, () => {}))
			.build(),
	branchWithoutGateway: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sp", (sub) => sub.task("a").branch("x", () => {}))
			.build(),
	boundaryAtGateway: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("gw")
			.branch("x", (b) => b.withBoundary("b", { timerDuration: "PT1S" }, () => {}))
			.build(),
	dupEventSubInBranch: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("gw")
			.branch("x", (b) =>
				b
					.task("t")
					.eventSubProcess("t", (e) => e.startEvent("a", { timerDuration: "PT1H" }))
					.endEvent("e"),
			)
			.build(),
	dupAcrossBranches: () =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("gw")
			.branch("x", (b) => b.task("t"))
			.branch("y", (b) => b.task("t"))
			.build(),
}

const out = {}
for (const [name, run] of Object.entries(scenarios)) {
	resetIdCounter()
	try {
		out[name] = { ok: JSON.parse(JSON.stringify(run())) }
	} catch (error) {
		out[name] = { error: error.message }
	}
}
writeFileSync(new URL("./scopes.json", import.meta.url), JSON.stringify(out, null, "\t"))
