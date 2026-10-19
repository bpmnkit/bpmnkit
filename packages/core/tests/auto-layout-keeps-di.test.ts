import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import { Bpmn } from "../src/bpmn/index.js"

function gatewayProcess(): string {
	return Bpmn.export(
		Bpmn.createProcess("p")
			.startEvent("start")
			.exclusiveGateway("gw", { name: "Approved?" })
			.branch("yes", (b) => b.flowId("yes").condition("= approved").task("t1").endEvent("e1"))
			.branch("no", (b) => b.defaultFlow().task("t2").endEvent("e2"))
			.withAutoLayout()
			.build(),
	)
}

/** The opening tag of the DI element bound to `id`. */
function diTag(xml: string, tag: "BPMNShape" | "BPMNEdge", id: string): string {
	const match = xml.match(new RegExp(`<bpmndi:${tag}[^>]*bpmnElement="${id}"[^>]*>`))
	if (!match) throw new Error(`no ${tag} for ${id}`)
	return match[0]
}

describe("auto-layout — exclusive gateway marker (#250)", () => {
	it("writes isMarkerVisible on a freshly laid-out exclusive gateway", () => {
		expect(diTag(gatewayProcess(), "BPMNShape", "gw")).toContain('isMarkerVisible="true"')
	})

	it("does not mark other element types", () => {
		expect(diTag(gatewayProcess(), "BPMNShape", "t1")).not.toContain("isMarkerVisible")
	})

	it("keeps an explicit isMarkerVisible=false from the source", () => {
		const hidden = gatewayProcess().replace('isMarkerVisible="true"', 'isMarkerVisible="false"')
		expect(diTag(Bpmn.autoLayout(hidden), "BPMNShape", "gw")).toContain('isMarkerVisible="false"')
	})
})

describe("auto-layout — re-layout keeps non-geometric DI (#250)", () => {
	it("keeps shape colours and the marker, as the issue's repro shows", () => {
		const saved = gatewayProcess()
			.replace(
				"<bpmn:definitions ",
				'<bpmn:definitions xmlns:color="http://www.omg.org/spec/BPMN/non-normative/color/1.0" ',
			)
			.replace(
				'bpmnElement="gw" isMarkerVisible="true"',
				'bpmnElement="gw" isMarkerVisible="true" color:background-color="#ffe0b2"',
			)
		const shape = diTag(Bpmn.autoLayout(saved), "BPMNShape", "gw")
		expect(shape).toContain('isMarkerVisible="true"')
		expect(shape).toContain('color:background-color="#ffe0b2"')
	})

	it("keeps edge colours and label attributes", () => {
		const defs = Bpmn.parse(gatewayProcess())
		const plane = defs.diagrams[0]?.plane
		const edge = plane?.edges.find((e) => e.bpmnElement === "yes")
		const task = plane?.shapes.find((s) => s.bpmnElement === "t1")
		if (!edge || !task) throw new Error("fixture lost its DI")
		edge.unknownAttributes = { "color:border-color": "#e53935" }
		task.label = { unknownAttributes: { "color:color": "#1e88e5" } }

		const out = applyAutoLayout(defs).diagrams[0]?.plane
		expect(out?.edges.find((e) => e.bpmnElement === "yes")?.unknownAttributes).toEqual({
			"color:border-color": "#e53935",
		})
		const label = out?.shapes.find((s) => s.bpmnElement === "t1")?.label
		expect(label?.unknownAttributes).toEqual({ "color:color": "#1e88e5" })
	})

	it("keeps the source's DI ids instead of renaming them", () => {
		const renamed = gatewayProcess()
			.replace('id="gw_di"', 'id="Gateway_custom"')
			.replace(/id="yes_di"/, 'id="Flow_custom"')
		const out = Bpmn.autoLayout(renamed)
		expect(diTag(out, "BPMNShape", "gw")).toContain('id="Gateway_custom"')
		expect(diTag(out, "BPMNEdge", "yes")).toContain('id="Flow_custom"')
	})

	it("keeps the diagram's and plane's own attributes", () => {
		const defs = Bpmn.parse(gatewayProcess())
		const diagram = defs.diagrams[0]
		if (!diagram) throw new Error("fixture lost its diagram")
		diagram.unknownAttributes = { name: "Approval" }
		diagram.plane.unknownAttributes = { "vendor:zoom": "1.5" }

		const out = applyAutoLayout(defs).diagrams[0]
		expect(out?.unknownAttributes).toEqual({ name: "Approval" })
		expect(out?.plane.unknownAttributes).toEqual({ "vendor:zoom": "1.5" })
	})

	it("still recomputes the geometry", () => {
		const defs = Bpmn.parse(gatewayProcess())
		const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === "gw")
		if (!shape) throw new Error("fixture lost the gateway shape")
		const laidOut = { ...shape.bounds }
		shape.bounds = { x: 9000, y: 9000, width: 50, height: 50 }

		const out = applyAutoLayout(defs).diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === "gw")
		expect(out?.bounds).toEqual(laidOut)
	})
})

describe("auto-layout — DI ids stay unique (#250)", () => {
	function allDiIds(defs: ReturnType<typeof applyAutoLayout>): string[] {
		return defs.diagrams.flatMap((d) => [...d.plane.shapes, ...d.plane.edges].map((s) => s.id))
	}

	it("does not hand a generated id to an element when another element's source DI already has it", () => {
		const defs = Bpmn.parse(gatewayProcess())
		const plane = defs.diagrams[0]?.plane
		const t1 = plane?.shapes.find((s) => s.bpmnElement === "t1")
		if (!plane || !t1) throw new Error("fixture lost its DI")
		// t1 was renamed from t2 in a modeler that kept the DI id; t2 is new and has no DI.
		t1.id = "t2_di"
		plane.shapes = plane.shapes.filter((s) => s.bpmnElement !== "t2")

		const out = applyAutoLayout(defs)
		const ids = allDiIds(out)
		expect(new Set(ids).size).toBe(ids.length)
		expect(out.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === "t1")?.id).toBe("t2_di")
	})

	it("reuses a source id once when two source shapes claim it", () => {
		const defs = Bpmn.parse(gatewayProcess())
		const plane = defs.diagrams[0]?.plane
		const t2 = plane?.shapes.find((s) => s.bpmnElement === "t2")
		if (!plane || !t2) throw new Error("fixture lost its DI")
		t2.id = "t1_di"

		const ids = allDiIds(applyAutoLayout(defs))
		expect(new Set(ids).size).toBe(ids.length)
	})
})

describe("auto-layout — kept DI on collapsed sub-process planes (#250)", () => {
	it("keeps the child diagram's attributes and its shapes' ids and colours", () => {
		const built = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sub", (c) => {
				c.startEvent("ss").task("inner").endEvent("se")
			})
			.endEvent("e")
			.withAutoLayout()
			.build()
		const sub = built.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === "sub")
		if (!sub) throw new Error("fixture lost the sub-process shape")
		sub.isExpanded = false
		const collapsed = applyAutoLayout(built)
		const child = collapsed.diagrams.find((d) => d.plane.bpmnElement === "sub")
		const inner = child?.plane.shapes.find((s) => s.bpmnElement === "inner")
		if (!child || !inner) throw new Error("no child plane for the collapsed sub-process")
		child.unknownAttributes = { name: "Sub" }
		inner.id = "Inner_custom"
		inner.unknownAttributes = { "color:background-color": "#ffe0b2" }

		const relaid = applyAutoLayout(collapsed).diagrams.find((d) => d.plane.bpmnElement === "sub")
		expect(relaid?.unknownAttributes).toEqual({ name: "Sub" })
		const out = relaid?.plane.shapes.find((s) => s.bpmnElement === "inner")
		expect(out?.id).toBe("Inner_custom")
		expect(out?.unknownAttributes).toEqual({ "color:background-color": "#ffe0b2" })
	})
})

describe("auto-layout — output is independent of the input (#250)", () => {
	it("does not share kept attribute objects with the input", () => {
		const defs = Bpmn.parse(gatewayProcess())
		const diagram = defs.diagrams[0]
		const gw = diagram?.plane.shapes.find((s) => s.bpmnElement === "gw")
		if (!diagram || !gw) throw new Error("fixture lost its DI")
		gw.unknownAttributes = { "color:background-color": "#ffe0b2" }
		diagram.unknownAttributes = { name: "Approval" }

		const out = applyAutoLayout(defs).diagrams[0]
		const outGw = out?.plane.shapes.find((s) => s.bpmnElement === "gw")
		if (!out?.unknownAttributes || !outGw) throw new Error("layout lost the kept attributes")
		outGw.unknownAttributes["color:background-color"] = "#000000"
		out.unknownAttributes.name = "Changed"
		expect(gw.unknownAttributes).toEqual({ "color:background-color": "#ffe0b2" })
		expect(diagram.unknownAttributes).toEqual({ name: "Approval" })
	})
})
