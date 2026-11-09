import { describe, expect, it } from "vitest"
import type { BpmnBounds, BpmnDefinitions, BpmnDiShape } from "../src/bpmn/bpmn-model.js"
import { checkDiCompleteness } from "../src/bpmn/di-check.js"
import { Bpmn } from "../src/bpmn/index.js"
import { exportPreserving } from "../src/bpmn/preserving-writer.js"
import { placeMissingShapes } from "../src/index.js"

const shape = (id: string, x: number, y: number, w: number, h: number, extra = "") =>
	`<bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}"${extra}><dc:Bounds x="${x}" y="${y}" width="${w}" height="${h}" /></bpmndi:BPMNShape>`
const edge = (id: string, points: Array<[number, number]>) =>
	`<bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}">${points.map(([x, y]) => `<di:waypoint x="${x}" y="${y}" />`).join("")}</bpmndi:BPMNEdge>`

/** Two pools; the first has two lanes. Every element is drawn. */
const BASE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="defs" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="collab">
    <bpmn:participant id="pool_a" name="Shop" processRef="shop" />
    <bpmn:participant id="pool_b" name="Carrier" processRef="carrier" />
    <bpmn:messageFlow id="mf_ship" sourceRef="ship" targetRef="carrier_start" />
  </bpmn:collaboration>
  <bpmn:process id="shop" isExecutable="true">
    <bpmn:laneSet id="ls">
      <bpmn:lane id="lane_sales" name="Sales"><bpmn:flowNodeRef>start</bpmn:flowNodeRef><bpmn:flowNodeRef>check</bpmn:flowNodeRef></bpmn:lane>
      <bpmn:lane id="lane_ops" name="Ops"><bpmn:flowNodeRef>ship</bpmn:flowNodeRef><bpmn:flowNodeRef>done</bpmn:flowNodeRef></bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="start" />
    <bpmn:userTask id="check" name="Check order" />
    <bpmn:sendTask id="ship" name="Ship" />
    <bpmn:endEvent id="done" />
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="check" />
    <bpmn:sequenceFlow id="f2" sourceRef="check" targetRef="ship" />
    <bpmn:sequenceFlow id="f3" sourceRef="ship" targetRef="done" />
  </bpmn:process>
  <bpmn:process id="carrier" isExecutable="false">
    <bpmn:startEvent id="carrier_start" />
    <bpmn:task id="deliver" name="Deliver" />
    <bpmn:sequenceFlow id="c1" sourceRef="carrier_start" targetRef="deliver" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="diagram">
    <bpmndi:BPMNPlane id="plane" bpmnElement="collab">
      ${shape("pool_a", 0, 0, 900, 300, ' isHorizontal="true"')}
      ${shape("lane_sales", 30, 0, 870, 150, ' isHorizontal="true"')}
      ${shape("lane_ops", 30, 150, 870, 150, ' isHorizontal="true"')}
      ${shape("start", 100, 57, 36, 36)}
      ${shape("check", 190, 35, 100, 80)}
      ${shape("ship", 340, 185, 100, 80)}
      ${shape("done", 492, 207, 36, 36)}
      ${shape("pool_b", 0, 330, 900, 200, ' isHorizontal="true"')}
      ${shape("carrier_start", 372, 412, 36, 36)}
      ${shape("deliver", 460, 390, 100, 80)}
      ${edge("f1", [
				[136, 75],
				[190, 75],
			])}
      ${edge("f2", [
				[240, 115],
				[240, 225],
				[340, 225],
			])}
      ${edge("f3", [
				[440, 225],
				[492, 225],
			])}
      ${edge("c1", [
				[408, 430],
				[460, 430],
			])}
      ${edge("mf_ship", [
				[390, 265],
				[390, 412],
			])}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`

function shapesOf(defs: BpmnDefinitions): Map<string, BpmnDiShape> {
	const out = new Map<string, BpmnDiShape>()
	for (const d of defs.diagrams) for (const s of d.plane.shapes) out.set(s.bpmnElement, s)
	return out
}

function within(inner: BpmnBounds, outer: BpmnBounds): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

function overlap(a: BpmnBounds, b: BpmnBounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/** The edit the agent card describes: a branch in the Ops lane, a boundary escalation, a reply from the carrier. */
function edit(defs: BpmnDefinitions): void {
	const shop = defs.processes.find((p) => p.id === "shop")
	const carrier = defs.processes.find((p) => p.id === "carrier")
	const collab = defs.collaborations[0]
	if (!shop || !carrier || !collab) throw new Error("fixture")
	const base = { extensionElements: [], unknownAttributes: {} }
	const node = { ...base, incoming: [], outgoing: [] }

	// A new task after `done`'s predecessor, in the Ops lane.
	shop.flowElements.push({ ...node, id: "invoice", type: "serviceTask", name: "Send invoice" })
	shop.flowElements.push({ ...node, id: "invoiced", type: "endEvent", eventDefinitions: [] })
	shop.laneSet?.lanes[1]?.flowNodeRefs.push("invoice", "invoiced")
	shop.sequenceFlows.push({ ...base, id: "f4", sourceRef: "ship", targetRef: "invoice" })
	shop.sequenceFlows.push({ ...base, id: "f5", sourceRef: "invoice", targetRef: "invoiced" })

	// A timer boundary on `check` leading to a new end event (lane inferred).
	shop.flowElements.push({
		...node,
		id: "late",
		type: "boundaryEvent",
		attachedToRef: "check",
		eventDefinitions: [{ type: "timer", timeDuration: "PT1H" }],
	} as never)
	shop.flowElements.push({ ...node, id: "escalated", type: "endEvent", eventDefinitions: [] })
	shop.sequenceFlows.push({ ...base, id: "f6", sourceRef: "late", targetRef: "escalated" })

	// The carrier answers: a new throw event in its pool, a message flow back.
	carrier.flowElements.push({
		...node,
		id: "notify",
		type: "intermediateThrowEvent",
		eventDefinitions: [],
	})
	carrier.sequenceFlows.push({ ...base, id: "c2", sourceRef: "deliver", targetRef: "notify" })
	collab.messageFlows.push({
		...base,
		id: "mf_delivered",
		sourceRef: "notify",
		targetRef: "invoice",
	})
}

describe("placeMissingShapes", () => {
	const before = Bpmn.parse(BASE)
	const edited = Bpmn.parse(BASE)
	edit(edited)
	const placed = placeMissingShapes(edited)
	const shapes = shapesOf(placed)

	it("draws every element and connection the edit added", () => {
		expect(checkDiCompleteness(edited).missingShapes.length).toBeGreaterThan(0)
		expect(checkDiCompleteness(placed)).toEqual({ missingShapes: [], missingEdges: [] })
	})

	it("keeps every existing shape and edge byte-equal", () => {
		const oldPlane = before.diagrams[0]?.plane
		const newPlane = placed.diagrams[0]?.plane
		for (const s of oldPlane?.shapes ?? []) {
			const now = newPlane?.shapes.find((n) => n.bpmnElement === s.bpmnElement)
			expect(JSON.stringify(now), s.bpmnElement).toBe(JSON.stringify(s))
		}
		for (const e of oldPlane?.edges ?? []) {
			const now = newPlane?.edges.find((n) => n.bpmnElement === e.bpmnElement)
			expect(JSON.stringify(now), e.bpmnElement).toBe(JSON.stringify(e))
		}
	})

	it("does not modify its input", () => {
		expect(checkDiCompleteness(edited).missingShapes).toContain("invoice")
	})

	it("puts a new task inside its lane, right of the task it follows", () => {
		const invoice = shapes.get("invoice")?.bounds
		const lane = shapes.get("lane_ops")?.bounds
		const ship = shapes.get("ship")?.bounds
		if (!invoice || !lane || !ship) throw new Error("missing shape")
		expect(within(invoice, lane)).toBe(true)
		expect(invoice.x).toBeGreaterThan(ship.x + ship.width)
		expect(within(shapes.get("invoiced")?.bounds ?? invoice, lane)).toBe(true)
	})

	it("adds an unlaned element to its neighbour's lane", () => {
		const sales = placed.processes[0]?.laneSet?.lanes[0]
		expect(sales?.flowNodeRefs).toContain("escalated")
		const escalated = shapes.get("escalated")?.bounds
		const lane = shapes.get("lane_sales")?.bounds
		if (!escalated || !lane) throw new Error("missing shape")
		expect(within(escalated, lane)).toBe(true)
	})

	it("places a new element in the right pool", () => {
		const notify = shapes.get("notify")?.bounds
		const pool = shapes.get("pool_b")?.bounds
		if (!notify || !pool) throw new Error("missing shape")
		expect(within(notify, pool)).toBe(true)
	})

	it("hangs a boundary event on its host's lower edge", () => {
		const late = shapes.get("late")?.bounds
		const check = shapes.get("check")?.bounds
		if (!late || !check) throw new Error("missing shape")
		expect(late.y + late.height / 2).toBe(check.y + check.height)
		expect(late.x).toBeGreaterThanOrEqual(check.x)
		expect(late.x + late.width).toBeLessThanOrEqual(check.x + check.width)
	})

	it("routes new sequence flows and message flows between their ends", () => {
		const edges = new Map(placed.diagrams[0]?.plane.edges.map((e) => [e.bpmnElement, e]))
		for (const [id, source, target] of [
			["f4", "ship", "invoice"],
			["f6", "late", "escalated"],
			["mf_delivered", "notify", "invoice"],
		] as const) {
			const wp = edges.get(id)?.waypoints ?? []
			expect(wp.length, id).toBeGreaterThanOrEqual(2)
			const s = shapes.get(source)?.bounds
			const t = shapes.get(target)?.bounds
			const first = wp[0]
			const last = wp[wp.length - 1]
			if (!s || !t || !first || !last) throw new Error(id)
			const onBorder = (p: { x: number; y: number }, b: BpmnBounds) =>
				p.x >= b.x - 1 && p.x <= b.x + b.width + 1 && p.y >= b.y - 1 && p.y <= b.y + b.height + 1
			expect(onBorder(first, s), `${id} start`).toBe(true)
			expect(onBorder(last, t), `${id} end`).toBe(true)
			for (let i = 1; i < wp.length; i++) {
				const a = wp[i - 1]
				const b = wp[i]
				if (a && b) expect(a.x === b.x || a.y === b.y, `${id} orthogonal`).toBe(true)
			}
		}
		// A boundary event leaves downwards.
		const late = shapes.get("late")?.bounds
		const f6 = edges.get("f6")?.waypoints[0]
		if (!late || !f6) throw new Error("f6")
		expect(f6.y).toBe(late.y + late.height)
	})

	it("overlaps no other flow node", () => {
		const nodes = [...shapes.entries()].filter(
			([id]) => !["pool_a", "pool_b", "lane_sales", "lane_ops", "late"].includes(id),
		)
		for (const id of ["invoice", "invoiced", "escalated", "notify"]) {
			const b = shapes.get(id)?.bounds
			if (!b) throw new Error(id)
			for (const [other, s] of nodes) {
				if (other !== id) expect(overlap(b, s.bounds), `${id} vs ${other}`).toBe(false)
			}
		}
	})

	it("writes through exportPreserving with the original shapes' lines untouched", () => {
		const xml = exportPreserving(BASE, placed)
		for (const line of BASE.split("\n").filter((l) => l.includes("BPMNShape"))) {
			expect(xml).toContain(line.trim())
		}
		expect(checkDiCompleteness(Bpmn.parse(xml))).toEqual({ missingShapes: [], missingEdges: [] })
	})

	it("returns the same definitions when nothing is missing", () => {
		expect(placeMissingShapes(before)).toBe(before)
	})

	it("widens a full lane and its pool to the right instead of overlapping", () => {
		const full = Bpmn.parse(BASE)
		const shop = full.processes[0]
		if (!shop) throw new Error("fixture")
		const base = { extensionElements: [], unknownAttributes: {}, incoming: [], outgoing: [] }
		const ids = Array.from({ length: 8 }, (_, i) => `extra${i}`)
		let prev = "done"
		shop.flowElements = shop.flowElements.filter((e) => e.id !== "done")
		shop.flowElements.push({ ...base, id: "done", type: "task" } as never)
		for (const id of ids) {
			shop.flowElements.push({ ...base, id, type: "task" } as never)
			shop.laneSet?.lanes[1]?.flowNodeRefs.push(id)
			shop.sequenceFlows.push({
				id: `to_${id}`,
				sourceRef: prev,
				targetRef: id,
				extensionElements: [],
				unknownAttributes: {},
			})
			prev = id
		}
		const out = shapesOf(placeMissingShapes(full))
		const pool = out.get("pool_a")?.bounds
		const lane = out.get("lane_ops")?.bounds
		const other = out.get("lane_sales")?.bounds
		if (!pool || !lane || !other) throw new Error("missing")
		expect(pool.width).toBeGreaterThan(900)
		expect(lane.x + lane.width).toBe(pool.x + pool.width)
		expect(other.x + other.width).toBe(pool.x + pool.width)
		expect(pool.x).toBe(0)
		for (const id of ids) {
			const b = out.get(id)?.bounds
			if (!b) throw new Error(id)
			expect(within(b, lane), id).toBe(true)
		}
	})

	it("re-routes a flow insertAfter re-pointed, and only that one", () => {
		const source = Bpmn.parse(BASE)
		const spliced = Bpmn.continueProcess(source, "shop")
			.insertAfter("ship")
			.serviceTask("notify", { name: "Notify", taskType: "notify" })
			.build({ validate: false })
		const out = placeMissingShapes(spliced)
		const outShapes = shapesOf(out)
		const edges = new Map(out.diagrams[0]?.plane.edges.map((e) => [e.bpmnElement, e]))
		const notify = outShapes.get("notify")?.bounds
		const done = outShapes.get("done")?.bounds
		if (!notify || !done) throw new Error("missing shape")
		// f3 now runs notify → done: it must start on notify, not on ship.
		const f3 = edges.get("f3")?.waypoints ?? []
		const first = f3[0]
		const last = f3[f3.length - 1]
		if (!first || !last) throw new Error("f3")
		expect(first.x >= notify.x && first.x <= notify.x + notify.width).toBe(true)
		expect(first.y >= notify.y && first.y <= notify.y + notify.height).toBe(true)
		expect(last.x >= done.x && last.x <= done.x + done.width).toBe(true)
		// Every other edge and every shape is as it was.
		const old = source.diagrams[0]?.plane
		for (const e of old?.edges ?? []) {
			if (e.bpmnElement === "f3") continue
			expect(JSON.stringify(edges.get(e.bpmnElement)), e.bpmnElement).toBe(JSON.stringify(e))
		}
		for (const s of old?.shapes ?? []) {
			expect(JSON.stringify(outShapes.get(s.bpmnElement)), s.bpmnElement).toBe(JSON.stringify(s))
		}
		expect(checkDiCompleteness(out)).toEqual({ missingShapes: [], missingEdges: [] })
	})
})
