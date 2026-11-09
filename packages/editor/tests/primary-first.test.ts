import { Bpmn, type BpmnDefinitions, parseProcessDelta, writeProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { createIdFactory } from "../src/id.js"
import { applyOp } from "../src/ops.js"
import { applyProcessDelta } from "../src/process-delta.js"
import { primaryPlane, withPrimaryFirst } from "../src/swimlanes.js"
import { documentOrder, expectFlowableKept, flowableFixture } from "./swimlane-helpers.js"

const NEW_TASK = { x: 420, y: 150, width: 100, height: 80 }

/** Two root processes and no pool: `P_other` first, the executable `P_exec` drawn on the second diagram. */
const TWO_ROOTS = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="t">
  <process id="P_other" isExecutable="false"><task id="T_other"/></process>
  <process id="P_exec" isExecutable="true"><task id="T_exec"/></process>
  <bpmndi:BPMNDiagram id="D_other"><bpmndi:BPMNPlane id="Plane_other" bpmnElement="P_other">
    <bpmndi:BPMNShape id="T_other_di" bpmnElement="T_other"><dc:Bounds x="0" y="0" width="100" height="80"/></bpmndi:BPMNShape>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
  <bpmndi:BPMNDiagram id="D_exec"><bpmndi:BPMNPlane id="Plane_exec" bpmnElement="P_exec">
    <bpmndi:BPMNShape id="T_exec_di" bpmnElement="T_exec"><dc:Bounds x="0" y="0" width="100" height="80"/></bpmndi:BPMNShape>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</definitions>`

const flowNodeIds = (defs: BpmnDefinitions, processId: string) =>
	defs.processes.find((p) => p.id === processId)?.flowElements.map((el) => el.id) ?? []

describe("applyOp on a file whose executable process is not first", () => {
	it("creates the shape in the executable process, and keeps the process order", () => {
		const defs = flowableFixture("second")
		const r = applyOp(defs, { kind: "createShape", type: "task", bounds: NEW_TASK, seed: "s" })
		const id = r.created[0] ?? ""
		expect(flowNodeIds(r.defs, "Process_exec")).toContain(id)
		expect(flowNodeIds(r.defs, "Process_partner")).toEqual([])
		expect(documentOrder(r.defs)).toEqual(documentOrder(defs))
		expectFlowableKept(defs, r.defs)
	})

	it("renames a node of the executable process", () => {
		const defs = flowableFixture("second")
		const r = applyOp(defs, { kind: "rename", id: "Task_review", name: "Check" })
		const task = r.defs.processes.find((p) => p.id === "Process_exec")?.flowElements[1]
		expect(task?.name).toBe("Check")
	})

	it("draws on the diagram that draws the executable process, and keeps the diagram order", () => {
		const defs = flowableFixture("second-diagram")
		const r = applyOp(defs, { kind: "createShape", type: "task", bounds: NEW_TASK, seed: "s" })
		const id = r.created[0] ?? ""
		const drawnOn = r.defs.diagrams.filter((d) => d.plane.shapes.some((s) => s.bpmnElement === id))
		expect(drawnOn.map((d) => d.id)).toEqual(["BPMNDiagram_order"])
		expect(documentOrder(r.defs)).toEqual(documentOrder(defs))
	})

	it("hands back the very same document when the op changes nothing", () => {
		const defs = flowableFixture("second-diagram")
		expect(applyOp(defs, { kind: "rename", id: "nothing", name: "x" }).defs).toBe(defs)
	})

	it("passes a snapshot through unreordered", () => {
		const defs = flowableFixture("second")
		expect(applyOp(flowableFixture(), { kind: "snapshot", defs }).defs).toBe(defs)
	})

	it("keeps the order after autoLayout drops the partner's own diagram", () => {
		const defs = flowableFixture("second-diagram")
		const next = applyOp(defs, { kind: "autoLayout" }).defs
		expect(documentOrder(next)).toEqual({
			processes: ["Process_partner", "Process_exec"],
			diagrams: ["BPMNDiagram_order"],
		})
		expect(primaryPlane(next)?.shapes.some((s) => s.bpmnElement === "Task_review")).toBe(true)
		expectFlowableKept(defs, next)
	})

	it("keeps the order after autoLayout draws a root process on a plane of its own", () => {
		const defs = Bpmn.parse(TWO_ROOTS)
		const next = applyOp(defs, { kind: "autoLayout" }).defs
		expect(documentOrder(next)).toEqual({
			processes: ["P_other", "P_exec"],
			diagrams: ["D_other", "D_exec"],
		})
		const execPlane = next.diagrams.find((d) => d.id === "D_exec")?.plane
		expect(execPlane?.shapes.map((s) => s.bpmnElement)).toEqual(["T_exec"])
	})
})

describe("withPrimaryFirst", () => {
	it("returns its input when the function returns what it was given", () => {
		const defs = flowableFixture("second-diagram")
		expect(withPrimaryFirst(defs, (first) => first)).toBe(defs)
	})

	it("hands the function the primary process and its diagram first", () => {
		const defs = flowableFixture("second-diagram")
		withPrimaryFirst(defs, (first) => {
			expect(documentOrder(first)).toEqual({
				processes: ["Process_exec", "Process_partner"],
				diagrams: ["BPMNDiagram_order", "BPMNDiagram_partner"],
			})
			return first
		})
	})

	it("puts the primary back by id when the function removed the process before it", () => {
		// By index, the primary would go back to index 1 and land after P_last.
		const [other, exec] = Bpmn.parse(TWO_ROOTS).processes
		if (!other || !exec) throw new Error("fixture")
		const defs: BpmnDefinitions = {
			...Bpmn.parse(TWO_ROOTS),
			processes: [{ ...other, id: "P_first", flowElements: [] }, exec, { ...other, id: "P_last" }],
		}
		const next = withPrimaryFirst(defs, (first) => ({
			...first,
			processes: first.processes.filter((p) => p.id !== "P_first"),
		}))
		expect(documentOrder(next).processes).toEqual(["P_exec", "P_last"])
	})
})

describe("applyProcessDelta on a file whose executable process is not first", () => {
	it("moves a node of the executable process to another lane, keeping the order", () => {
		const defs = flowableFixture("second-diagram")
		const { aliases } = writeProcessText(defs)
		const r = applyProcessDelta(defs, parseProcessDelta("lane operations: pay"), {
			aliases,
			ids: createIdFactory("delta"),
		})
		expect(r.problems).toEqual([])
		const exec = r.definitions.processes.find((p) => p.id === "Process_exec")
		expect(exec?.laneSet?.lanes[2]?.flowNodeRefs).toContain("Task_pay")
		expect(documentOrder(r.definitions)).toEqual(documentOrder(defs))
		expectFlowableKept(defs, r.definitions)
	})
})

describe("autoLayout of a laned process with no pool", () => {
	it("keeps one shape per lane and adds no pool", () => {
		const pooled = flowableFixture()
		const exec = pooled.processes.find((p) => p.id === "Process_exec")
		if (!exec) throw new Error("fixture")
		const defs: BpmnDefinitions = { ...pooled, collaborations: [], processes: [exec], diagrams: [] }
		const next = applyOp(defs, { kind: "autoLayout" }).defs
		expect(next.collaborations).toEqual([])
		for (const lane of ["Lane_sales", "Lane_finance", "Lane_ops"]) {
			const shapes = next.diagrams.flatMap((d) =>
				d.plane.shapes.filter((s) => s.bpmnElement === lane),
			)
			expect(shapes, lane).toHaveLength(1)
		}
		expectFlowableKept(defs, next)
	})
})
