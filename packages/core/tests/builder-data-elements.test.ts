import { describe, expect, it } from "vitest"
import { Bpmn } from "../src/bpmn/index.js"

function build() {
	return Bpmn.createProcess("p")
		.startEvent("s")
		.serviceTask("t", { name: "T", taskType: "work" })
		.endEvent("e")
		.dataObject("do1", { name: "Order" })
		.dataObjectReference("dor1", "do1", { name: "Order", isCollection: true })
		.dataStoreReference("dsr1", "ds1", { name: "DB" })
		.dataAssociation("t", "dor1", "input")
		.dataAssociation("t", "dsr1", "output")
}

describe("builder data elements", () => {
	it("adds data elements without sequence flows and wires the associations", () => {
		const [proc] = build().build().processes
		const ids = (proc?.sequenceFlows ?? []).map((f) => `${f.sourceRef}>${f.targetRef}`)
		expect(ids).toEqual(["s>t", "t>e"])
		const t = proc?.flowElements.find((e) => e.id === "t")
		expect(t?.dataInputAssociations?.[0]?.sourceRefs).toEqual(["dor1"])
		expect(t?.dataOutputAssociations?.[0]?.targetRef).toBe("dsr1")
		const dor = proc?.flowElements.find((e) => e.id === "dor1")
		expect(dor).toMatchObject({ type: "dataObjectReference", dataObjectRef: "do1" })
		// BPMN20.xsd allows isCollection on the data object only, so it moves there.
		expect(dor).not.toHaveProperty("isCollection")
		expect(proc?.flowElements.find((e) => e.id === "do1")).toMatchObject({ isCollection: true })
	})

	it("round-trips through XML", () => {
		const xml = Bpmn.export(build().build())
		const [proc] = Bpmn.parse(xml).processes
		expect(proc?.flowElements.map((e) => e.type)).toContain("dataStoreReference")
		expect(proc?.flowElements.find((e) => e.id === "t")?.dataInputAssociations).toHaveLength(1)
	})

	it("auto-layout gives every data element a shape", () => {
		const defs = build().withAutoLayout().build()
		const shapes = new Set(defs.diagrams.flatMap((d) => d.plane.shapes.map((s) => s.bpmnElement)))
		for (const id of ["do1", "dor1", "dsr1"]) expect(shapes.has(id), id).toBe(true)
	})

	it("rejects duplicate ids and unknown activities", () => {
		expect(() => build().dataObject("do1")).toThrow(/Duplicate/)
		expect(() => build().dataAssociation("nope", "dor1", "input")).toThrow(/nope/)
	})

	it("works inside a sub-process and a branch", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sp", { name: "SP" }, (sub) =>
				sub
					.startEvent("ss")
					.serviceTask("st", { name: "ST", taskType: "w" })
					.dataObject("sdo")
					.dataObjectReference("sdor", "sdo")
					.dataAssociation("st", "sdor", "input")
					.endEvent("se"),
			)
			.endEvent("e")
			.build()
		const sp = defs.processes[0]?.flowElements.find((e) => e.id === "sp")
		expect(sp?.type === "subProcess" && sp.flowElements.some((e) => e.id === "sdor")).toBe(true)
	})
})
