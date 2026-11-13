import { describe, expect, it } from "vitest"
import { Bpmn, lintDiagram } from "../src/index.js"

const P = () => Bpmn.createProcess("p").startEvent("s")

describe("data elements and the flow lint", () => {
	it("does not flag a dataStoreReference as unreachable or dead-end", () => {
		const defs = P()
			.serviceTask("t", { taskType: "x" })
			.dataStoreReference("ds", "store1", { name: "HR" })
			.endEvent("e")
			.build()
		const ids = lintDiagram(defs)
			.diagnostics.filter((d) => d.elementIds.includes("ds"))
			.map((d) => d.id)
		expect(ids).toEqual([])
	})

	it("does not flag a dataObject or its reference", () => {
		const defs = P().dataObjectReference("dr", "do1").endEvent("e").build()
		const hits = lintDiagram(defs).diagnostics.filter(
			(d) =>
				d.id.startsWith("flow/") && (d.elementIds.includes("dr") || d.elementIds.includes("do1")),
		)
		expect(hits).toEqual([])
	})

	it("still flags a genuinely unreachable task", () => {
		const defs = P().endEvent("e").build()
		defs.processes[0]?.flowElements.push(
			...(Bpmn.createProcess("q")
				.startEvent("x")
				.userTask("lost", { name: "L", formId: "f" })
				.build()
				.processes[0]?.flowElements.filter((e) => e.id === "lost") ?? []),
		)
		const hits = lintDiagram(defs).diagnostics.filter((d) => d.id === "flow/unreachable")
		expect(hits.map((d) => d.elementIds[0])).toContain("lost")
	})
})

describe("dataObjectReference", () => {
	it("declares the missing dataObject so the reference resolves", () => {
		const defs = P()
			.dataObjectReference("dr", "do_x", { name: "List" })
			.userTask("t", { name: "T", formId: "f" })
			.endEvent("e")
			.build()
		const els = defs.processes[0]?.flowElements ?? []
		expect(els.filter((e) => e.id === "do_x" && e.type === "dataObject")).toHaveLength(1)
		expect(Bpmn.export(defs)).toContain('dataObjectRef="do_x"')
	})

	it("adopts a later explicit dataObject instead of colliding", () => {
		const defs = P()
			.dataObjectReference("dr", "do_x")
			.dataObject("do_x", { name: "Named", isCollection: true })
			.endEvent("e")
			.build()
		const objects = (defs.processes[0]?.flowElements ?? []).filter((e) => e.id === "do_x")
		expect(objects).toHaveLength(1)
		expect(objects[0]?.name).toBe("Named")
	})

	it("keeps an explicit earlier dataObject untouched", () => {
		const defs = P().dataObject("do_x").dataObjectReference("dr", "do_x").endEvent("e").build()
		expect((defs.processes[0]?.flowElements ?? []).filter((e) => e.id === "do_x")).toHaveLength(1)
	})
})

describe("data associations", () => {
	it("get ids and a DI edge under auto layout", () => {
		const defs = P()
			.serviceTask("t", { taskType: "x" })
			.dataObjectReference("dr", "do1", { name: "D" })
			.dataStoreReference("ds", "store1")
			.dataAssociation("t", "dr", "input")
			.dataAssociation("t", "ds", "output")
			.endEvent("e")
			.withAutoLayout()
			.build()
		const t = defs.processes[0]?.flowElements.find((e) => e.id === "t")
		const ids = [
			...(t?.dataInputAssociations ?? []).map((a) => a.id),
			...(t?.dataOutputAssociations ?? []).map((a) => a.id),
		]
		expect(ids).toHaveLength(2)
		expect(ids.every((i) => typeof i === "string")).toBe(true)
		const edges = defs.diagrams[0]?.plane.edges.map((e) => e.bpmnElement) ?? []
		for (const id of ids) expect(edges).toContain(id)
	})
})

describe("dataStoreReference", () => {
	it("emits one root dataStore, deduped across uses, and round-trips", () => {
		const defs = P()
			.dataStoreReference("a", "store1", { name: "HR" })
			.dataStoreReference("b", "store1", { name: "HR" })
			.endEvent("e")
			.build()
		const xml = Bpmn.export(defs)
		expect(xml.match(/<bpmn:dataStore /g)).toHaveLength(1)
		expect(xml).toContain('<bpmn:dataStore id="store1"')
		const again = Bpmn.export(Bpmn.parse(xml))
		expect(again.match(/<bpmn:dataStore /g)).toHaveLength(1)
	})

	it("is shared by two pools", () => {
		const defs = Bpmn.createDiagram()
			.process("p1", (p) => p.startEvent("s1").dataStoreReference("d1", "st").endEvent("e1"))
			.process("p2", (p) => p.startEvent("s2").dataStoreReference("d2", "st").endEvent("e2"))
			.participant("a", { name: "A", processId: "p1" })
			.participant("b", { name: "B", processId: "p2" })
			.build()
		expect(Bpmn.export(defs).match(/<bpmn:dataStore /g)).toHaveLength(1)
	})
})

describe("DiagramBuilder id uniqueness", () => {
	it("names both pools when an id repeats", () => {
		const make = () =>
			Bpmn.createDiagram()
				.process("p1", (p) => p.startEvent("s").serviceTask("x", { taskType: "a" }).endEvent("e1"))
				.process("p2", (p) => p.startEvent("s").serviceTask("x", { taskType: "a" }).endEvent("e2"))
				.participant("a", { name: "A", processId: "p1" })
				.participant("b", { name: "B", processId: "p2" })
		expect(() => make().build()).toThrow(
			/Duplicate element ID "s" in processes "p1" and "p2": ids are global in a collaboration; prefix them per pool \(e\.g\. "p2_s"\)/,
		)
	})

	it("accepts prefixed ids", () => {
		const defs = Bpmn.createDiagram()
			.process("p1", (p) => p.startEvent("p1_s").endEvent("p1_e"))
			.process("p2", (p) => p.startEvent("p2_s").endEvent("p2_e"))
			.participant("a", { name: "A", processId: "p1" })
			.participant("b", { name: "B", processId: "p2" })
			.build()
		expect(defs.processes).toHaveLength(2)
	})
})
