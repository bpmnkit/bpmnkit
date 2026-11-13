import { describe, expect, it } from "vitest"
import { Bpmn, applyAutoLayout, createFlowElement, makeRoom, placeNewShapes } from "../src/index.js"

const base = () =>
	Bpmn.parse(
		Bpmn.export(
			Bpmn.createProcess("p")
				.withAutoLayout()
				.startEvent("s", { name: "S" })
				.serviceTask("a", { name: "A", taskType: "a" })
				.serviceTask("b", { name: "B", taskType: "b" })
				.endEvent("e", { name: "E" })
				.build(),
		),
	)

const x = (defs: ReturnType<typeof base>, id: string) =>
	defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.bounds.x ?? Number.NaN

describe("makeRoom", () => {
	it("moves what is right of an insertion by the new nodes' width, nothing left of it", () => {
		const original = base()
		const edited = Bpmn.continueProcess(original, "p")
			.insertAfter("a")
			.serviceTask("n", { name: "N", taskType: "n" })
			.build()
		const { definitions, shifted } = makeRoom(edited)
		expect(shifted).toEqual([{ after: "a", dx: 150 }])
		expect(x(definitions, "s")).toBe(x(original, "s"))
		expect(x(definitions, "a")).toBe(x(original, "a"))
		expect(x(definitions, "b")).toBe(x(original, "b") + 150)
		expect(x(definitions, "e")).toBe(x(original, "e") + 150)
		// The input is not changed.
		expect(x(edited, "b")).toBe(x(original, "b"))
		const placed = placeNewShapes(definitions)
		expect(placed.unplaced).toEqual([])
		const n = x(placed.definitions, "n")
		expect(n).toBeGreaterThan(x(original, "a"))
		expect(n).toBeLessThan(x(definitions, "b"))
	})

	it("needs no room for an exception path below a task", () => {
		const edited = base()
		const process = edited.processes[0]
		if (!process) throw new Error("no process")
		const timer = createFlowElement("t", "boundaryEvent", { name: "Late?" })
		if (timer.type === "boundaryEvent") {
			timer.attachedToRef = "a"
			timer.eventDefinitions = [{ type: "timer", timeDuration: "PT1H" }]
		}
		process.flowElements.push(timer, createFlowElement("late", "endEvent", { name: "Late" }))
		process.sequenceFlows.push({
			id: "f_late",
			sourceRef: "t",
			targetRef: "late",
			unknownAttributes: {},
		} as (typeof process.sequenceFlows)[number])
		expect(makeRoom(edited).shifted).toEqual([])
	})

	it("widens the pool and lanes that span the insertion point", () => {
		const defs = applyAutoLayout(
			Bpmn.createDiagram("d")
				.process("p", (p) =>
					p
						.inLane("l1", { name: "L1" })
						.startEvent("s", { name: "S" })
						.serviceTask("a", { name: "A", taskType: "a" })
						.endEvent("e", { name: "E" }),
				)
				.participant("pool", { name: "Pool", processId: "p" })
				.build(),
		)
		const parsed = Bpmn.parse(Bpmn.export(defs))
		const width = (d: typeof parsed, id: string) =>
			d.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.bounds.width ?? 0
		const edited = Bpmn.continueProcess(parsed, "p")
			.insertAfter("a")
			.serviceTask("n", { name: "N", taskType: "n" })
			.build()
		const { definitions } = makeRoom(edited)
		expect(width(definitions, "pool")).toBe(width(parsed, "pool") + 150)
		expect(width(definitions, "l1")).toBe(width(parsed, "l1") + 150)
	})
})

describe("auto-layout puts lane data under its task", () => {
	it("keeps a data reference inside its task's lane", () => {
		const defs = Bpmn.createProcess("p")
			.withAutoLayout()
			.inLane("l1", { name: "L1" })
			.startEvent("s", { name: "S" })
			.serviceTask("t", { name: "T", taskType: "t" })
			.dataObjectReference("d", "obj", { name: "D" })
			.dataAssociation("t", "d", "output")
			.inLane("l2", { name: "L2" })
			.endEvent("e", { name: "E" })
			.build()
		const shape = (id: string) =>
			defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.bounds
		const d = shape("d")
		const t = shape("t")
		const lane = shape("l1")
		expect(d && t && lane).toBeTruthy()
		if (!d || !t || !lane) return
		expect(d.y).toBeGreaterThan(t.y + t.height)
		expect(d.y + d.height).toBeLessThanOrEqual(lane.y + lane.height)
		expect(Math.abs(d.x + d.width / 2 - (t.x + t.width / 2))).toBeLessThan(1)
		expect(shape("obj")).toBeUndefined()
	})
})
