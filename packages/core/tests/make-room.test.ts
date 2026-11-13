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
	it("moves what is right of an insertion as far as the new nodes need, nothing left of it", () => {
		const original = base()
		const edited = Bpmn.continueProcess(original, "p")
			.insertAfter("a")
			.serviceTask("n", { name: "N", taskType: "n" })
			.build()
		const { definitions, shifted } = makeRoom(edited)
		// N's width and gap (150) and a gap before b, less the 60 already free between a and b.
		expect(shifted).toEqual([{ after: "a", dx: 140 }])
		expect(x(definitions, "s")).toBe(x(original, "s"))
		expect(x(definitions, "a")).toBe(x(original, "a"))
		expect(x(definitions, "b")).toBe(x(original, "b") + 140)
		expect(x(definitions, "e")).toBe(x(original, "e") + 140)
		// The input is not changed.
		expect(x(edited, "b")).toBe(x(original, "b"))
		const placed = placeNewShapes(definitions)
		expect(placed.unplaced).toEqual([])
		const n = x(placed.definitions, "n")
		expect(n).toBeGreaterThan(x(original, "a"))
		expect(n).toBeLessThan(x(definitions, "b"))
	})

	it("moves nothing when the row right of the insertion is already free", () => {
		const original = base()
		for (const shape of original.diagrams[0]?.plane.shapes ?? [])
			if (shape.bpmnElement === "b" || shape.bpmnElement === "e") shape.bounds.x += 300
		const edited = Bpmn.continueProcess(original, "p")
			.insertAfter("a")
			.serviceTask("n", { name: "N", taskType: "n" })
			.build()
		const { definitions, shifted } = makeRoom(edited)
		expect(shifted).toEqual([])
		expect(x(definitions, "b")).toBe(x(original, "b"))
	})

	it("counts the longest new path, not every branch of a new split", () => {
		const edited = Bpmn.continueProcess(base(), "p")
			.insertAfter("a")
			.parallelGateway("fork", { name: "Fork" })
			.branch("x", (b) => b.serviceTask("t1", { name: "T1", taskType: "t1" }))
			.branch("y", (b) => b.serviceTask("t2", { name: "T2", taskType: "t2" }))
			.parallelGateway("join", { name: "Join" })
			.build()
		const [shift] = makeRoom(edited).shifted
		// fork, one task, join: 100 + 150 + 100, a gap before b, less the 60 free.
		expect(shift).toEqual({ after: "a", dx: 340 })
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
		expect(width(definitions, "pool")).toBe(width(parsed, "pool") + 140)
		expect(width(definitions, "l1")).toBe(width(parsed, "l1") + 140)
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
