import { describe, expect, it } from "vitest"
import { Bpmn, applyAutoLayout, makeRoom, placeNewShapes } from "../src/index.js"
import { buildSemanticGraph } from "../src/layout/semantic/graph.js"
import { laneOrder, leafLanes } from "../src/layout/semantic/lanes.js"

/** Three lanes, a chain that hands over customer → sales → finance; invented data. */
function laned(order: Array<"customer" | "sales" | "finance"> = ["customer", "sales", "finance"]) {
	const lane = (id: string, refs: string[]) =>
		`<bpmn:lane id="${id}" name="${id}">${refs.map((r) => `<bpmn:flowNodeRef>${r}</bpmn:flowNodeRef>`).join("")}</bpmn:lane>`
	const lanes: Record<string, string> = {
		customer: lane("customer", ["s", "ask"]),
		sales: lane("sales", ["quote"]),
		finance: lane("finance", ["bill", "e"]),
	}
	return Bpmn.parse(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">
<bpmn:process id="p" isExecutable="true"><bpmn:laneSet id="ls">${order.map((o) => lanes[o]).join("")}</bpmn:laneSet>
<bpmn:startEvent id="s"/><bpmn:userTask id="ask"/><bpmn:userTask id="quote"/><bpmn:userTask id="bill"/><bpmn:endEvent id="e"/>
<bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="ask"/><bpmn:sequenceFlow id="f2" sourceRef="ask" targetRef="quote"/>
<bpmn:sequenceFlow id="f3" sourceRef="quote" targetRef="bill"/><bpmn:sequenceFlow id="f4" sourceRef="bill" targetRef="e"/>
</bpmn:process></bpmn:definitions>`)
}

const shapes = (defs: ReturnType<typeof laned>) =>
	new Map((defs.diagrams[0]?.plane.shapes ?? []).map((s) => [s.bpmnElement, s.bounds]))

describe("laned layout (P4)", () => {
	it("hands over between adjacent lanes in a straight vertical flow", () => {
		const defs = applyAutoLayout(laned())
		const edge = defs.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === "f2")
		expect(edge?.waypoints).toHaveLength(2)
		expect(edge?.waypoints[0]?.x).toBe(edge?.waypoints[1]?.x)
	})

	it("orders lanes so hand-overs stay between neighbours", () => {
		const defs = laned(["customer", "finance", "sales"])
		const process = defs.processes[0]
		if (!process?.laneSet) throw new Error("fixture has no lanes")
		const graph = buildSemanticGraph(process.flowElements, process.sequenceFlows)
		const { leaves, leafOf, flat } = leafLanes(process.laneSet)
		expect(laneOrder(graph, leaves, leafOf, flat)).toEqual(["customer", "sales", "finance"])
		// ties and already-cheapest orders keep what the author wrote
		const kept = laned()
		const keptGraph = buildSemanticGraph(
			kept.processes[0]?.flowElements ?? [],
			kept.processes[0]?.sequenceFlows ?? [],
		)
		const k = leafLanes(kept.processes[0]?.laneSet as never)
		expect(laneOrder(keptGraph, k.leaves, k.leafOf, k.flat)).toBe(k.leaves)
	})

	it("keeps declared order when it is already the cheapest", () => {
		const b = shapes(applyAutoLayout(laned()))
		expect(b.get("ask")?.y ?? 0).toBeLessThan(b.get("quote")?.y ?? 0)
		expect(b.get("quote")?.y ?? 0).toBeLessThan(b.get("bill")?.y ?? 0)
	})

	it("is deterministic", () => {
		const a = Bpmn.export(applyAutoLayout(laned()), { validate: false })
		expect(Bpmn.export(applyAutoLayout(laned()), { validate: false })).toBe(a)
	})
})

describe("edit path in a laned pool (P4)", () => {
	it("moves the successor that sits under the anchor right of the inserted task", () => {
		const base = Bpmn.parse(Bpmn.export(applyAutoLayout(laned()), { validate: false }))
		const edited = Bpmn.continueProcess(base, "p")
			.insertAfter("quote")
			.serviceTask("check", { name: "Check", taskType: "check" })
			.build()
		const { definitions } = makeRoom(edited)
		const placed = placeNewShapes(definitions)
		expect(placed.unplaced).toEqual([])
		const b = shapes(placed.definitions)
		const check = b.get("check")
		const bill = b.get("bill")
		expect(check?.x ?? 0).toBeGreaterThan((b.get("quote")?.x ?? 0) + 100)
		// the successor is stacked under the new task, not left behind under `quote`
		expect((bill?.x ?? 0) + (bill?.width ?? 0) / 2).toBeCloseTo(
			(check?.x ?? 0) + (check?.width ?? 0) / 2,
			0,
		)
	})
})
