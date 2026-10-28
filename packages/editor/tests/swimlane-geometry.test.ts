/**
 * WP8c geometry: resizing pools and lanes through the `resize` op. A lane's
 * shared edge moves its neighbour's, an outer edge moves the pool's; every
 * band keeps its own nodes (critique I9), so no lane ref goes stale. Every op
 * runs through the Flowable guard.
 */
import { Bpmn, type BpmnBounds, type BpmnDefinitions } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { type EditorOp, applyOp } from "../src/ops.js"
import {
	MIN_BAND,
	POOL_HEADER,
	primaryFirst,
	resizableSwimlanes,
	swimlaneResizeBounds,
} from "../src/swimlanes.js"
import {
	type FlowableOrder,
	boundsOf,
	documentOrder,
	expectFlowableKept,
	expectSwimlanesSound,
	expectUnmoved,
	fixture,
	flowableFixture,
	flowableWithBankAt,
	flowableXml,
	hasShape,
	lanesOf,
	lockedPartnerXml,
	overlapping,
	poolLessFlowable,
	verticalPoolXml,
} from "./swimlane-helpers.js"

const FIXTURE_08 = "08-flowable-lanes-pools.bpmn"

/** Resizes `id` to `bounds`, holding the result to the Flowable guard and to sound swimlanes. */
function resize(defs: BpmnDefinitions, id: string, bounds: BpmnBounds): BpmnDefinitions {
	const next = applyOp(defs, { kind: "resize", id, bounds }).defs
	expectFlowableKept(defs, next)
	expectSwimlanesSound(next)
	return primaryFirst(next)
}

/** `op` changes nothing: the very same document, and nothing created. */
function expectRefused(defs: BpmnDefinitions, op: EditorOp): void {
	const r = applyOp(defs, op)
	expect(r.defs, JSON.stringify(op)).toBe(defs)
	expect(r.created).toEqual([])
}

/** The lane refs of every lane, by lane id. */
function refsOf(defs: BpmnDefinitions): Record<string, string[]> {
	return Object.fromEntries(lanesOf(defs).map((lane) => [lane.id, lane.flowNodeRefs]))
}

/** The bounds of each of `ids`, by id. */
function boundsOfAll(defs: BpmnDefinitions, ids: string[]): Record<string, BpmnBounds> {
	return Object.fromEntries(ids.map((id) => [id, boundsOf(defs, id)]))
}

/** The waypoints of the edge of `flowId` on the first diagram. */
function waypointsOf(defs: BpmnDefinitions, flowId: string) {
	return defs.diagrams[0]?.plane.edges.find((e) => e.bpmnElement === flowId)?.waypoints
}

const FLAT_BANDS = ["Participant_own", "Lane_sales", "Lane_finance", "Lane_ops"]
const NESTED_BANDS = ["Participant_company", "Lane_sales", "Lane_inside", "Lane_desk", "Lane_ops"]

describe("8c.1 lane resize: shared edges balance", () => {
	it("grows a lane's bottom by 40 and shrinks the lane below by 40, nodes unmoved", () => {
		const defs = flowableFixture()
		const next = resize(defs, "Lane_finance", { x: 30, y: 120, width: 610, height: 160 })
		expect(boundsOfAll(next, FLAT_BANDS)).toEqual({
			Participant_own: { x: 0, y: 0, width: 640, height: 360 },
			Lane_sales: { x: 30, y: 0, width: 610, height: 120 },
			Lane_finance: { x: 30, y: 120, width: 610, height: 160 },
			Lane_ops: { x: 30, y: 280, width: 610, height: 80 },
		})
		expectUnmoved(defs, next, ["Lane_finance", "Lane_ops"])
		expect(refsOf(next)).toEqual(refsOf(defs))
	})

	it("moves the lane above's bottom when a lane's top moves up", () => {
		const next = resize(flowableFixture(), "Lane_ops", { x: 30, y: 220, width: 610, height: 140 })
		expect(boundsOf(next, "Lane_finance")).toEqual({ x: 30, y: 120, width: 610, height: 100 })
		expect(boundsOf(next, "Lane_ops")).toEqual({ x: 30, y: 220, width: 610, height: 140 })
	})

	it("stops a shared edge at the nodes of the lane it shrinks (I9)", () => {
		const defs = flowableFixture()
		// Task_pay reaches y=220 in Finance; End_1 starts at y=282 in Operations.
		const up = resize(defs, "Lane_finance", { x: 30, y: 120, width: 610, height: 40 })
		expect(boundsOf(up, "Lane_finance")).toEqual({ x: 30, y: 120, width: 610, height: 100 })
		expect(boundsOf(up, "Lane_ops")).toEqual({ x: 30, y: 220, width: 610, height: 140 })
		const down = resize(defs, "Lane_finance", { x: 30, y: 120, width: 610, height: 230 })
		expect(boundsOf(down, "Lane_ops")).toEqual({ x: 30, y: 282, width: 610, height: 78 })
		expect(refsOf(up)).toEqual(refsOf(defs))
		expect(refsOf(down)).toEqual(refsOf(defs))
	})

	it(`keeps an empty lane at least ${MIN_BAND}px high`, () => {
		const laned = applyOp(flowableFixture(), {
			kind: "addLane",
			refId: "Lane_ops",
			where: "below",
			seed: "l",
		})
		const added = laned.created[0] ?? ""
		const band = boundsOf(laned.defs, added)
		const next = resize(laned.defs, added, { ...band, height: 10 })
		expect(boundsOf(next, added)).toEqual({ ...band, height: MIN_BAND })
		expect(boundsOf(next, "Participant_own").height).toBe(360 + MIN_BAND)
		// Its top edge, shared with Operations, stops MIN_BAND above its bottom.
		const top = resize(laned.defs, added, { ...band, y: band.y + 100, height: band.height - 100 })
		expect(boundsOf(top, added)).toEqual({
			...band,
			y: band.y + band.height - MIN_BAND,
			height: MIN_BAND,
		})
	})
})

describe("8c.1 lane resize: outer edges move the pool", () => {
	it("grows the pool with the last lane and pushes the pools below, messages docked", () => {
		const defs = flowableFixture()
		const next = resize(defs, "Lane_ops", { x: 30, y: 240, width: 610, height: 160 })
		expect(boundsOf(next, "Participant_own")).toEqual({ x: 0, y: 0, width: 640, height: 400 })
		expect(boundsOf(next, "Lane_ops")).toEqual({ x: 30, y: 240, width: 610, height: 160 })
		expect(boundsOf(next, "Participant_partner")).toEqual({ x: 0, y: 440, width: 640, height: 60 })
		expect(boundsOf(next, "Participant_bank")).toEqual({ x: 0, y: 530, width: 640, height: 60 })
		expect(waypointsOf(next, "Message_pay")).toEqual([
			{ x: 450, y: 220 },
			{ x: 450, y: 530 },
		])
		expectUnmoved(defs, next, [
			"Participant_own",
			"Lane_ops",
			"Participant_partner",
			"Participant_bank",
		])
	})

	it("shrinks the pool with the last lane and pulls the pools below up, messages docked", () => {
		const next = resize(flowableFixture(), "Lane_ops", { x: 30, y: 240, width: 610, height: 100 })
		expect(boundsOf(next, "Participant_own").height).toBe(340)
		expect(boundsOf(next, "Participant_partner").y).toBe(380)
		expect(boundsOf(next, "Participant_bank").y).toBe(470)
		expect(waypointsOf(next, "Message_pay")?.at(-1)).toEqual({ x: 450, y: 470 })
	})

	it("moves the pool's top with the first lane's", () => {
		const next = resize(flowableFixture(), "Lane_sales", { x: 30, y: -40, width: 610, height: 160 })
		expect(boundsOf(next, "Participant_own")).toEqual({ x: 0, y: -40, width: 640, height: 400 })
	})

	it("widens the pool and every lane from a lane's right edge", () => {
		const next = resize(flowableFixture(), "Lane_finance", {
			x: 30,
			y: 120,
			width: 700,
			height: 120,
		})
		expect(boundsOf(next, "Participant_own").width).toBe(730)
		for (const lane of ["Lane_sales", "Lane_finance", "Lane_ops"]) {
			expect(boundsOf(next, lane)).toMatchObject({ x: 30, width: 700 })
		}
	})
})

/** `after` draws every shape and edge of `before` where `before` does, but for float noise. */
function expectSameDrawing(before: BpmnDefinitions, after: BpmnDefinitions): void {
	const plane = before.diagrams[0]?.plane
	for (const s of plane?.shapes ?? []) {
		const b = boundsOf(after, s.bpmnElement)
		for (const key of ["x", "y", "width", "height"] as const) {
			expect(b[key], `${s.bpmnElement}.${key}`).toBeCloseTo(s.bounds[key], 6)
		}
	}
	for (const edge of plane?.edges ?? []) {
		const points = waypointsOf(after, edge.bpmnElement) ?? []
		expect(points.length, edge.bpmnElement).toBe(edge.waypoints.length)
		edge.waypoints.forEach((p, k) => {
			expect(points[k]?.x, `${edge.bpmnElement}[${k}].x`).toBeCloseTo(p.x, 6)
			expect(points[k]?.y, `${edge.bpmnElement}[${k}].y`).toBeCloseTo(p.y, 6)
		})
	}
}

/** No shape of `after` overlaps one it did not overlap in `before`: nothing landed on anything. */
function expectNothingLanded(before: BpmnDefinitions, after: BpmnDefinitions): void {
	const shapes = after.diagrams[0]?.plane.shapes ?? []
	for (const a of shapes) {
		for (const b of shapes) {
			if (a.bpmnElement >= b.bpmnElement || !overlapping(a.bounds, b.bounds)) continue
			const was = overlapping(boundsOf(before, a.bpmnElement), boundsOf(before, b.bpmnElement))
			expect(was, `${a.bpmnElement} landed on ${b.bpmnElement}`).toBe(true)
		}
	}
}

/**
 * {@link flowableXml} with `End_1` raised to y 250, so Operations can shrink to
 * 60, and the own process's annotation `Note_own` in Operations below it, at
 * y 320..355: below the pool's bottom once Operations shrinks.
 */
function flowableWithLowNote(): BpmnDefinitions {
	return Bpmn.parse(
		flowableXml()
			.replace('x="532" y="282"', 'x="532" y="250"')
			.replace(
				'<sequenceFlow id="Flow_4" sourceRef="Task_pay" targetRef="End_1"/>',
				'<sequenceFlow id="Flow_4" sourceRef="Task_pay" targetRef="End_1"/><textAnnotation id="Note_own"><text>Note</text></textAnnotation>',
			)
			.replace(
				'<bpmndi:BPMNEdge id="Message_pay_di"',
				'<bpmndi:BPMNShape id="Note_own_di" bpmnElement="Note_own"><omgdc:Bounds x="100" y="320" width="100" height="35"/></bpmndi:BPMNShape><bpmndi:BPMNEdge id="Message_pay_di"',
			),
	)
}

/** No two pools of `defs` overlap. */
function expectPoolsApart(defs: BpmnDefinitions): void {
	const pools = defs.collaborations.flatMap((c) => c.participants).map((p) => p.id)
	for (const a of pools) {
		for (const b of pools) {
			if (a < b) expect(overlapping(boundsOf(defs, a), boundsOf(defs, b)), `${a} ${b}`).toBe(false)
		}
	}
}

describe("8c.1 shrinking a band pulls up what is below", () => {
	/** Resizes `id` to `bounds`, checking the preview shows what the op does. */
	const previewed = (defs: BpmnDefinitions, id: string, bounds: BpmnBounds) => {
		const next = resize(defs, id, bounds)
		expect(swimlaneResizeBounds(defs, id, bounds)).toEqual(boundsOf(next, id))
		expectPoolsApart(next)
		expectNothingLanded(defs, next)
		return next
	}

	it("returns the own pool's grow-and-shrink to the original drawing", () => {
		const defs = flowableFixture()
		const grown = previewed(defs, "Participant_own", { x: 0, y: 0, width: 640, height: 437.5 })
		expect(boundsOf(grown, "Participant_bank").y).toBe(567.5)
		const back = previewed(grown, "Participant_own", { x: 0, y: 0, width: 640, height: 360 })
		expectSameDrawing(defs, back)
	})

	it("returns a last lane's grow-and-shrink to the original drawing, nested lanes too", () => {
		const flat = flowableFixture()
		const grown = previewed(flat, "Lane_ops", { x: 30, y: 240, width: 610, height: 180 })
		expectSameDrawing(
			flat,
			previewed(grown, "Lane_ops", { x: 30, y: 240, width: 610, height: 120 }),
		)
		const nested = primaryFirst(fixture(FIXTURE_08))
		const ops = boundsOf(nested, "Lane_ops")
		const deep = previewed(nested, "Lane_ops", { ...ops, height: ops.height + 55 })
		expectSameDrawing(nested, previewed(deep, "Lane_ops", ops))
	})

	it("pulls up what is below a black box that shrinks, its message following", () => {
		const defs = flowableFixture()
		const tall = previewed(defs, "Participant_partner", { x: 0, y: 400, width: 640, height: 110 })
		const back = previewed(tall, "Participant_partner", { x: 0, y: 400, width: 640, height: 60 })
		expect(boundsOf(back, "Participant_bank")).toEqual({ x: 0, y: 490, width: 640, height: 60 })
		expect(waypointsOf(back, "Message_pay")?.at(-1)).toEqual({ x: 450, y: 490 })
	})

	it("pulls up no further than the shapes above leave room for", () => {
		// The bank stands beside the own pool, its bottom at 390 over a partner widened under it.
		const defs = flowableWithBankAt({ x: 660, y: 300, width: 300, height: 90 })
		const partner = defs.diagrams[0]?.plane.shapes.find(
			(s) => s.bpmnElement === "Participant_partner",
		)
		if (partner) partner.bounds = { x: 0, y: 420, width: 1000, height: 60 }
		const next = previewed(defs, "Participant_own", { x: 0, y: 0, width: 640, height: 320 })
		expect(boundsOf(next, "Participant_own").height).toBe(320)
		expect(boundsOf(next, "Participant_partner").y).toBe(390)
		expect(boundsOf(next, "Participant_bank")).toEqual({ x: 660, y: 300, width: 300, height: 90 })
	})

	it("pulls up no further than an annotation the shrunk pool leaves below it", () => {
		const next = previewed(flowableWithLowNote(), "Lane_ops", {
			x: 30,
			y: 240,
			width: 610,
			height: 60,
		})
		expect(boundsOf(next, "Participant_own").height).toBe(300)
		expect(boundsOf(next, "Note_own").y).toBe(320)
		expect(boundsOf(next, "Participant_partner").y).toBe(355)
		expect(boundsOf(next, "Participant_bank").y).toBe(445)
	})

	it("pulls nothing up while a shape below already stands under one that stays", () => {
		// The partner stands beside the own pool, its start event above the line and its task below.
		const defs = Bpmn.parse(
			lockedPartnerXml()
				.replace(
					'x="0" y="400" width="640" height="60"',
					'x="660" y="200" width="400" height="400"',
				)
				.replace('x="80" y="412" width="36" height="36"', 'x="680" y="210" width="36" height="36"')
				.replace(
					'x="160" y="410" width="100" height="40"',
					'x="760" y="450" width="100" height="40"',
				),
		)
		const grown = previewed(defs, "Participant_own", { x: 0, y: 0, width: 640, height: 400 })
		expect(boundsOf(grown, "Participant_bank").y).toBe(530)
		// ponytail: one clamp for every shape below; the partner pushed under its own start event blocks the whole pull.
		const back = previewed(grown, "Participant_own", { x: 0, y: 0, width: 640, height: 360 })
		expect(boundsOf(back, "Participant_bank").y).toBe(530)
	})
})

describe("8c.1 pool resize", () => {
	it("applies a change in width to every lane", () => {
		const next = resize(flowableFixture(), "Participant_own", {
			x: 0,
			y: 0,
			width: 800,
			height: 360,
		})
		for (const lane of ["Lane_sales", "Lane_finance", "Lane_ops"]) {
			expect(boundsOf(next, lane)).toMatchObject({ x: POOL_HEADER, width: 800 - POOL_HEADER })
		}
	})

	it("applies a change in x to every lane, which keeps its header inset", () => {
		const next = resize(flowableFixture(), "Participant_own", {
			x: -60,
			y: 0,
			width: 700,
			height: 360,
		})
		for (const lane of ["Lane_sales", "Lane_finance", "Lane_ops"]) {
			expect(boundsOf(next, lane)).toMatchObject({ x: -30, width: 670 })
		}
	})

	it("gives a top change to the first lane and a bottom change to the last", () => {
		const defs = flowableFixture()
		const next = resize(defs, "Participant_own", { x: 0, y: -40, width: 640, height: 440 })
		expect(boundsOfAll(next, FLAT_BANDS)).toEqual({
			Participant_own: { x: 0, y: -40, width: 640, height: 440 },
			Lane_sales: { x: 30, y: -40, width: 610, height: 160 },
			Lane_finance: { x: 30, y: 120, width: 610, height: 120 },
			Lane_ops: { x: 30, y: 240, width: 610, height: 160 },
		})
		expect(refsOf(next)).toEqual(refsOf(defs))
	})

	it("covers its content: never narrower, shorter or further in than its nodes", () => {
		const defs = flowableFixture()
		// End_1 ends at x=568, Start_1 starts at x=80, Task_review at y=20, End_1 ends at y=318.
		const narrow = resize(defs, "Participant_own", { x: 0, y: 0, width: 300, height: 360 })
		expect(boundsOf(narrow, "Participant_own").width).toBe(568)
		const left = resize(defs, "Participant_own", { x: 200, y: 0, width: 440, height: 360 })
		expect(boundsOf(left, "Participant_own")).toEqual({
			x: 80 - POOL_HEADER,
			y: 0,
			width: 590,
			height: 360,
		})
		expect(boundsOf(left, "Lane_sales")).toMatchObject({ x: 80, width: 560 })
		const top = resize(defs, "Participant_own", { x: 0, y: 50, width: 640, height: 310 })
		expect(boundsOf(top, "Lane_sales")).toEqual({ x: 30, y: 20, width: 610, height: 100 })
		const short = resize(defs, "Participant_own", { x: 0, y: 0, width: 640, height: 250 })
		expect(boundsOf(short, "Participant_own").height).toBe(318)
		expect(boundsOf(short, "Lane_ops")).toEqual({ x: 30, y: 240, width: 610, height: 78 })
	})

	it("re-docks a message flow on a resized black box", () => {
		const next = resize(flowableFixture(), "Participant_bank", {
			x: 0,
			y: 470,
			width: 640,
			height: 80,
		})
		expect(boundsOf(next, "Participant_bank")).toEqual({ x: 0, y: 470, width: 640, height: 80 })
		expect(waypointsOf(next, "Message_pay")).toEqual([
			{ x: 450, y: 220 },
			{ x: 450, y: 470 },
		])
	})

	it("stops a pool growing up or sideways at the pool next to it", () => {
		const defs = flowableFixture()
		// The partner pool ends at y=460, right above the bank.
		const up = resize(defs, "Participant_bank", { x: 0, y: 400, width: 640, height: 150 })
		expect(boundsOf(up, "Participant_bank")).toEqual({ x: 0, y: 460, width: 640, height: 90 })
		const own = resize(defs, "Participant_partner", { x: 0, y: 300, width: 640, height: 160 })
		expect(boundsOf(own, "Participant_partner")).toEqual({ x: 0, y: 360, width: 640, height: 100 })
	})

	it("pushes a pool beside it right when it widens into it, and previews the full width", () => {
		const defs = flowableWithBankAt({ x: 660, y: 100, width: 300, height: 60 })
		const wide = { x: 0, y: 0, width: 800, height: 360 }
		expect(swimlaneResizeBounds(defs, "Participant_own", wide)).toEqual(wide)
		const next = resize(defs, "Participant_own", wide)
		expect(boundsOf(next, "Participant_own")).toEqual(wide)
		expect(boundsOf(next, "Participant_bank")).toEqual({ x: 800, y: 100, width: 300, height: 60 })
		expect(waypointsOf(next, "Message_pay")?.at(-1)).toEqual({ x: 800, y: 160 })
	})

	it("stops a black box widening into the own pool, which stays where it is", () => {
		const defs = flowableWithBankAt({ x: -400, y: 100, width: 300, height: 60 })
		const own = boundsOf(defs, "Participant_own")
		const wide = { x: -400, y: 100, width: 600, height: 60 }
		const stopped = { ...wide, width: own.x + 400 }
		expect(swimlaneResizeBounds(defs, "Participant_bank", wide)).toEqual(stopped)
		const next = resize(defs, "Participant_bank", wide)
		expect(boundsOf(next, "Participant_bank")).toEqual(stopped)
		expect(boundsOf(next, "Participant_own")).toEqual(own)
		expect(boundsOf(next, "Task_review")).toEqual(boundsOf(defs, "Task_review"))
	})

	it("pushes the pools beyond a pool it pushes, so none lands on another", () => {
		const defs = Bpmn.parse(
			flowableXml()
				.replace(
					'<omgdc:Bounds x="0" y="490" width="640" height="60"/>',
					'<omgdc:Bounds x="660" y="300" width="300" height="200"/>',
				)
				.replace(
					'<omgdc:Bounds x="0" y="400" width="640" height="60"/>',
					'<omgdc:Bounds x="965" y="420" width="300" height="60"/>',
				),
		)
		const next = resize(defs, "Participant_own", { x: 0, y: 0, width: 800, height: 360 })
		expect(boundsOf(next, "Participant_bank").x).toBe(800)
		expect(boundsOf(next, "Participant_partner").x).toBe(1105)
		expect(
			overlapping(boundsOf(next, "Participant_bank"), boundsOf(next, "Participant_partner")),
		).toBe(false)
	})

	it("stops a corner drag at every pool around the final rectangle, as its preview shows", () => {
		const banks: BpmnBounds[] = [
			{ x: -400, y: -200, width: 380, height: 160 },
			{ x: 700, y: -200, width: 300, height: 160 },
			{ x: 700, y: -100, width: 300, height: 150 },
			{ x: -400, y: -100, width: 380, height: 150 },
			{ x: -400, y: 380, width: 380, height: 60 },
		]
		const drags: BpmnBounds[] = [
			{ x: -300, y: -150, width: 940, height: 510 },
			{ x: 0, y: -150, width: 900, height: 510 },
			{ x: -300, y: 0, width: 940, height: 460 },
		]
		for (const bank of banks) {
			const defs = flowableWithBankAt(bank)
			for (const drag of drags) {
				const next = resize(defs, "Participant_own", drag)
				const own = boundsOf(next, "Participant_own")
				const label = JSON.stringify({ bank, drag })
				expect(swimlaneResizeBounds(defs, "Participant_own", drag), label).toEqual(own)
				for (const other of ["Participant_partner", "Participant_bank"]) {
					expect(overlapping(own, boundsOf(next, other)), `${other} ${label}`).toBe(false)
				}
			}
		}
		// Up and left past a pool off the top-left corner: the left edge goes, the top stops under it.
		const corner = resize(
			flowableWithBankAt({ x: -400, y: -200, width: 380, height: 160 }),
			"Participant_own",
			{ x: -300, y: -150, width: 940, height: 510 },
		)
		expect(boundsOf(corner, "Participant_own")).toEqual({
			x: -300,
			y: -40,
			width: 940,
			height: 400,
		})
	})

	it("pushes what is below a black box that grows down", () => {
		const next = resize(flowableFixture(), "Participant_partner", {
			x: 0,
			y: 400,
			width: 640,
			height: 110,
		})
		expect(boundsOf(next, "Participant_bank")).toEqual({ x: 0, y: 540, width: 640, height: 60 })
		expect(waypointsOf(next, "Message_pay")?.at(-1)).toEqual({ x: 450, y: 540 })
	})

	it(`keeps a black box at least ${MIN_BAND}px high and wide past its header`, () => {
		const defs = flowableFixture()
		const flat = resize(defs, "Participant_bank", { x: 0, y: 490, width: 640, height: 10 })
		expect(boundsOf(flat, "Participant_bank").height).toBe(MIN_BAND)
		const thin = resize(defs, "Participant_bank", { x: 600, y: 490, width: 40, height: 60 })
		expect(boundsOf(thin, "Participant_bank")).toEqual({
			x: 640 - POOL_HEADER - MIN_BAND,
			y: 490,
			width: POOL_HEADER + MIN_BAND,
			height: 60,
		})
	})
})

/**
 * Every lane reaches the right edge of pool `poolId` and lies within its
 * height, and holds the centre of every drawn node it lists.
 */
function expectLanesOnPool(defs: BpmnDefinitions, poolId: string): void {
	const pool = boundsOf(defs, poolId)
	for (const lane of lanesOf(defs)) {
		const b = boundsOf(defs, lane.id)
		expect(b.x + b.width, lane.id).toBeCloseTo(pool.x + pool.width, 6)
		expect(b.y >= pool.y - 1e-6 && b.y + b.height <= pool.y + pool.height + 1e-6, lane.id).toBe(
			true,
		)
		for (const ref of lane.flowNodeRefs.filter((id) => hasShape(defs, id))) {
			const n = boundsOf(defs, ref)
			const [cx, cy] = [n.x + n.width / 2, n.y + n.height / 2]
			const inside = cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height
			expect(inside, `${ref} in ${lane.id}`).toBe(true)
		}
	}
}

describe("8c.1 resize of bands drawn a pixel off the pool's edge", () => {
	// Every lane ends at x=639, a pixel short of the pool's right edge at 640.
	const shortLanes = () => Bpmn.parse(flowableXml().replaceAll('width="610"', 'width="609"'))
	// Operations ends at y=359, a pixel above the pool's bottom at 360.
	const shortLastLane = () =>
		Bpmn.parse(
			flowableXml().replace(
				'x="30" y="240" width="610" height="120"/>',
				'x="30" y="240" width="610" height="119"/>',
			),
		)

	it("stretches every lane to the pool's new left and right edges", () => {
		const defs = shortLanes()
		for (const bounds of [
			{ x: -100, y: 0, width: 740, height: 360 },
			{ x: 0, y: 0, width: 840, height: 360 },
			{ x: 0, y: 0, width: 600, height: 360 },
		]) {
			const next = resize(defs, "Participant_own", bounds)
			expect(boundsOf(next, "Participant_own"), JSON.stringify(bounds)).toEqual(bounds)
			for (const lane of ["Lane_sales", "Lane_finance", "Lane_ops"]) {
				expect(boundsOf(next, lane), lane).toMatchObject({
					x: bounds.x + POOL_HEADER,
					width: bounds.width - POOL_HEADER,
				})
			}
			expectLanesOnPool(next, "Participant_own")
			expect(refsOf(next)).toEqual(refsOf(defs))
		}
	})

	it("keeps miwg-C.10.0's lanes, a pixel short of the pool, on the pool and its nodes in them", () => {
		const defs = primaryFirst(fixture("miwg-C.10.0.bpmn"))
		// Not resize(): the file has a process with content but no pool, as read.
		const resizePool = (bounds: BpmnBounds) => {
			const next = applyOp(defs, { kind: "resize", id: "_7", bounds }).defs
			expectFlowableKept(defs, next)
			return primaryFirst(next)
		}
		const pool = boundsOf(defs, "_7")
		const left = resizePool({ ...pool, x: pool.x - 500, width: pool.width + 500 })
		expect(boundsOf(left, "_7").x).toBe(pool.x - 500)
		expectLanesOnPool(left, "_7")
		expect(refsOf(left)).toEqual(refsOf(defs))
		const narrow = resizePool({ ...pool, width: pool.width - 500 })
		expect(boundsOf(narrow, "_7").width).toBeLessThan(pool.width)
		expectLanesOnPool(narrow, "_7")
		expect(refsOf(narrow)).toEqual(refsOf(defs))
	})

	it("moves the last lane with the pool's bottom", () => {
		const next = resize(shortLastLane(), "Participant_own", {
			x: 0,
			y: 0,
			width: 640,
			height: 320,
		})
		expect(boundsOf(next, "Participant_own").height).toBe(320)
		expect(boundsOf(next, "Lane_ops")).toEqual({ x: 30, y: 240, width: 610, height: 80 })
		expectLanesOnPool(next, "Participant_own")
	})

	it("moves the pool with the last lane's bottom and pushes the pools below", () => {
		const defs = shortLastLane()
		const next = resize(defs, "Lane_ops", { x: 30, y: 240, width: 610, height: 219 })
		expect(boundsOf(next, "Lane_ops")).toEqual({ x: 30, y: 240, width: 610, height: 219 })
		expect(boundsOf(next, "Participant_own").height).toBe(459)
		// The pool's bottom moved by 99, from 360 to 459: so do the pools below.
		expect(boundsOf(next, "Participant_partner").y).toBe(499)
		expect(boundsOf(next, "Participant_bank").y).toBe(589)
		expectLanesOnPool(next, "Participant_own")
	})
})

describe("8c.1 nested lanes (fixture 08)", () => {
	const nested = () => primaryFirst(fixture(FIXTURE_08))

	it("moves a child's shared edge with its parent's and the next top-level lane's", () => {
		const defs = nested()
		const next = resize(defs, "Lane_desk", { x: 60, y: 120, width: 660, height: 140 })
		expect(boundsOfAll(next, NESTED_BANDS)).toEqual({
			Participant_company: { x: 0, y: 0, width: 720, height: 360 },
			Lane_sales: { x: 30, y: 0, width: 690, height: 260 },
			Lane_inside: { x: 60, y: 0, width: 660, height: 120 },
			Lane_desk: { x: 60, y: 120, width: 660, height: 140 },
			Lane_ops: { x: 30, y: 260, width: 690, height: 100 },
		})
		expect(refsOf(next)).toEqual(refsOf(defs))
		// Ship order starts at y=260 in Operations: the edge stops there.
		const far = resize(defs, "Lane_desk", { x: 60, y: 120, width: 660, height: 200 })
		expect(boundsOf(far, "Lane_ops")).toEqual(boundsOf(next, "Lane_ops"))
	})

	it("moves only the sibling's edge for an edge inside the parent", () => {
		const next = resize(nested(), "Lane_inside", { x: 60, y: 0, width: 660, height: 130 })
		expect(boundsOf(next, "Lane_desk")).toEqual({ x: 60, y: 130, width: 660, height: 110 })
		expect(boundsOf(next, "Lane_sales")).toEqual({ x: 30, y: 0, width: 690, height: 240 })
	})

	it("grows the parent chain and the pool from a child's outer edge", () => {
		const next = resize(nested(), "Lane_inside", { x: 60, y: -40, width: 660, height: 160 })
		expect(boundsOf(next, "Participant_company")).toEqual({ x: 0, y: -40, width: 720, height: 400 })
		expect(boundsOf(next, "Lane_sales")).toEqual({ x: 30, y: -40, width: 690, height: 280 })
		expect(boundsOf(next, "Lane_inside")).toEqual({ x: 60, y: -40, width: 660, height: 160 })
	})

	it("keeps every nesting inset on a pool's x and width change", () => {
		const defs = nested()
		const wide = resize(defs, "Participant_company", { x: 0, y: 0, width: 800, height: 360 })
		expect(boundsOf(wide, "Lane_sales")).toMatchObject({ x: 30, width: 770 })
		expect(boundsOf(wide, "Lane_inside")).toMatchObject({ x: 60, width: 740 })
		// Order received starts at x=100 in a child lane: the pool's left edge stops two insets before it.
		const left = resize(defs, "Participant_company", { x: 100, y: 0, width: 620, height: 360 })
		expect(boundsOf(left, "Participant_company")).toMatchObject({ x: 40, width: 680 })
		expect(boundsOf(left, "Lane_inside")).toMatchObject({ x: 100, width: 620 })
	})

	it("grows the pool from the last lane and pushes the partner below, its message docked", () => {
		const next = resize(nested(), "Lane_ops", { x: 30, y: 240, width: 690, height: 160 })
		expect(boundsOf(next, "Participant_company").height).toBe(400)
		expect(boundsOf(next, "Participant_customer").y).toBe(440)
		expect(waypointsOf(next, "MessageFlow_confirm")).toEqual([
			{ x: 470, y: 340 },
			{ x: 470, y: 440 },
		])
	})
})

describe("8c.1 what cannot be resized", () => {
	it("lists the own pool, its lanes and black boxes as resizable, nothing else", () => {
		expect([...resizableSwimlanes(flowableFixture())].sort()).toEqual(
			[...FLAT_BANDS, "Participant_partner", "Participant_bank"].sort(),
		)
		expect(resizableSwimlanes(Bpmn.parse(lockedPartnerXml())).has("Participant_partner")).toBe(
			false,
		)
		expect(resizableSwimlanes(Bpmn.parse(verticalPoolXml(true))).size).toBe(0)
		expect(resizableSwimlanes(poolLessFlowable(true)).size).toBe(0)
	})

	it("refuses a partner pool with content, vertical pools and pool-less lanes", () => {
		const locked = Bpmn.parse(lockedPartnerXml())
		const bounds = { x: 0, y: 400, width: 800, height: 80 }
		expectRefused(locked, { kind: "resize", id: "Participant_partner", bounds })
		const vertical = Bpmn.parse(verticalPoolXml(true))
		expectRefused(vertical, { kind: "resize", id: "P", bounds })
		expectRefused(vertical, { kind: "resize", id: "LA", bounds })
		const poolLess = poolLessFlowable(true)
		expectRefused(poolLess, { kind: "resize", id: "Lane_sales", bounds })
	})

	it("refuses a resize that changes nothing", () => {
		const defs = flowableFixture()
		expectRefused(defs, {
			kind: "resize",
			id: "Lane_finance",
			bounds: boundsOf(defs, "Lane_finance"),
		})
		// Task_review starts at y=20 and the pool at y=0: a top edge held at its nodes stays.
		const held = resize(defs, "Participant_own", { x: 0, y: 20, width: 640, height: 340 })
		expectRefused(held, {
			kind: "resize",
			id: "Lane_sales",
			bounds: { x: 30, y: 60, width: 610, height: 60 },
		})
	})

	it("writes no float noise on decimal bounds: an unchanged edge keeps its exact value", () => {
		// Picked so that (x + width) - x and (y + height) - y are not exact in floating point.
		const defs = Bpmn.parse(
			flowableXml()
				.replace(
					'bpmnElement="Participant_own" isHorizontal="true"><omgdc:Bounds x="0" y="0" width="640" height="360"/>',
					'bpmnElement="Participant_own" isHorizontal="true"><omgdc:Bounds x="0.1" y="20.1" width="1024" height="339.9"/>',
				)
				.replace(
					'x="30" y="0" width="610" height="120"/>',
					'x="30.1" y="20.1" width="994" height="100.2"/>',
				)
				.replace(
					'x="30" y="120" width="610" height="120"/>',
					'x="30.1" y="120.3" width="994" height="119.7"/>',
				)
				.replace(
					'x="30" y="240" width="610" height="120"/>',
					'x="30.1" y="240" width="994" height="120"/>',
				),
		)
		const finance = boundsOf(defs, "Lane_finance")
		expect(finance).toEqual({ x: 30.1, y: 120.3, width: 994, height: 119.7 })
		expectRefused(defs, { kind: "resize", id: "Lane_finance", bounds: finance })
		// Task_review (y=20) holds the top of Sales, so the top edge falls back to where it was.
		expectRefused(defs, {
			kind: "resize",
			id: "Lane_sales",
			bounds: { x: 30.1, y: 30.1, width: 994, height: 90.2 },
		})
		const grown = resize(defs, "Lane_sales", { x: 30.1, y: 20.1, width: 994, height: 110.2 })
		expect(boundsOf(grown, "Lane_ops")).toEqual(boundsOf(defs, "Lane_ops"))
		expect(boundsOf(grown, "Participant_own")).toEqual(boundsOf(defs, "Participant_own"))
		expect(boundsOf(grown, "Lane_finance").width).toBe(994)
		// The moved edge may carry float noise; the bands it does not touch are written as read.
		expect(Bpmn.export(grown)).toContain(
			'bpmnElement="Lane_ops" isHorizontal="true">\n        <omgdc:Bounds x="30.1" y="240" width="994" height="120"/>',
		)
	})

	it("previews the clamped bounds of the dragged band", () => {
		const defs = flowableFixture()
		expect(
			swimlaneResizeBounds(defs, "Lane_finance", { x: 30, y: 120, width: 610, height: 40 }),
		).toEqual({ x: 30, y: 120, width: 610, height: 100 })
		expect(swimlaneResizeBounds(defs, "Task_pay", boundsOf(defs, "Task_pay"))).toBeUndefined()
	})
})

describe("8c.1 resizes land in the executable process, wherever it is listed", () => {
	for (const order of ["second", "second-diagram"] as FlowableOrder[]) {
		it(`balances the lanes and keeps the document order (${order})`, () => {
			const defs = flowableFixture(order)
			const r = applyOp(defs, {
				kind: "resize",
				id: "Lane_finance",
				bounds: { x: 30, y: 120, width: 610, height: 160 },
			})
			expectFlowableKept(defs, r.defs)
			expect(documentOrder(r.defs)).toEqual(documentOrder(defs))
			const next = primaryFirst(r.defs)
			expect(boundsOf(next, "Lane_ops")).toEqual({ x: 30, y: 280, width: 610, height: 80 })
			expectUnmoved(primaryFirst(defs), next, ["Lane_finance", "Lane_ops"])
		})
	}
})

// ── 8c.2 moving a pool ───────────────────────────────────────────────────────

/** {@link flowableXml} with a note inside the own pool tied to Task_review, and one outside tied to Task_pay. */
function annotatedXml(order: FlowableOrder = "first"): string {
	return flowableXml(order)
		.replace(
			'<endEvent id="End_1" name="Done"/>',
			`<endEvent id="End_1" name="Done"/>
    <textAnnotation id="Note_in"><text>Check stock</text></textAnnotation>
    <association id="Assoc_in" sourceRef="Note_in" targetRef="Task_review"/>
    <textAnnotation id="Note_out"><text>Paid by SEPA</text></textAnnotation>
    <association id="Assoc_out" sourceRef="Note_out" targetRef="Task_pay"/>`,
		)
		.replace(
			'<bpmndi:BPMNEdge id="Message_pay_di"',
			`<bpmndi:BPMNShape id="Note_in_di" bpmnElement="Note_in"><omgdc:Bounds x="500" y="30" width="100" height="30"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Note_out_di" bpmnElement="Note_out"><omgdc:Bounds x="660" y="160" width="100" height="30"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Assoc_in_di" bpmnElement="Assoc_in"><omgdi:waypoint x="500" y="45"/><omgdi:waypoint x="380" y="45"/><omgdi:waypoint x="260" y="45"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Assoc_out_di" bpmnElement="Assoc_out"><omgdi:waypoint x="660" y="175"/><omgdi:waypoint x="500" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Message_pay_di"`,
		)
}

/** Runs `op`, holding the result to the Flowable guard and to sound swimlanes; the primary drawn first. */
function run(defs: BpmnDefinitions, op: EditorOp): BpmnDefinitions {
	const next = applyOp(defs, op).defs
	expectFlowableKept(defs, next)
	expectSwimlanesSound(primaryFirst(next))
	return primaryFirst(next)
}

const shift = (b: BpmnBounds, dx: number, dy: number) => ({ ...b, x: b.x + dx, y: b.y + dy })
const shiftAll = (points: { x: number; y: number }[] | undefined, dx: number, dy: number) =>
	points?.map((p) => ({ x: p.x + dx, y: p.y + dy }))

const OWN_CONTENT = [
	...FLAT_BANDS,
	"Start_1",
	"Task_review",
	"Gateway_ok",
	"Task_pay",
	"End_1",
	"Note_in",
]

describe("8c.2 moving the own pool moves what it holds", () => {
	for (const order of ["first", "second", "second-diagram"] as FlowableOrder[]) {
		it(`moves the lanes, nodes and notes inside by the same delta, routes kept (${order})`, () => {
			const defs = Bpmn.parse(annotatedXml(order))
			const view = primaryFirst(defs)
			const op: EditorOp = { kind: "move", moves: [{ id: "Participant_own", dx: 40, dy: 20 }] }
			expect(documentOrder(applyOp(defs, op).defs)).toEqual(documentOrder(defs))
			const next = run(defs, op)
			for (const id of OWN_CONTENT) {
				expect(boundsOf(next, id), id).toEqual(shift(boundsOf(view, id), 40, 20))
			}
			expectUnmoved(view, next, OWN_CONTENT)
			for (const flow of ["Flow_1", "Flow_2", "Flow_3", "Flow_4", "Assoc_in"]) {
				expect(waypointsOf(next, flow), flow).toEqual(shiftAll(waypointsOf(view, flow), 40, 20))
			}
			expect(refsOf(next)).toEqual(refsOf(view))
			// One end stayed: the bank's message is docked again, straight down from Task_pay.
			expect(waypointsOf(next, "Message_pay")).toEqual([
				{ x: 490, y: 240 },
				{ x: 490, y: 490 },
			])
			// The note outside the pool stays; its association follows the task.
			expect(waypointsOf(next, "Assoc_out")).not.toEqual(waypointsOf(view, "Assoc_out"))
		})
	}

	it("moves everything once when the selection holds the pool, its lanes and its nodes (I10)", () => {
		const defs = Bpmn.parse(annotatedXml())
		const alone = run(defs, { kind: "move", moves: [{ id: "Participant_own", dx: 40, dy: 20 }] })
		const ids = [
			"Participant_own",
			"Lane_sales",
			"Lane_finance",
			"Task_review",
			"Start_1",
			"Note_in",
		]
		const all = run(defs, { kind: "move", moves: ids.map((id) => ({ id, dx: 40, dy: 20 })) })
		expect(Bpmn.export(all)).toBe(Bpmn.export(alone))
	})

	it("moves fixture 08's nested lanes with the pool and docks its message again", () => {
		const defs = fixture(FIXTURE_08)
		const next = run(defs, { kind: "move", moves: [{ id: "Participant_company", dx: 0, dy: -50 }] })
		for (const id of [...NESTED_BANDS, "start", "review", "decide", "ship", "rejected", "done"]) {
			expect(boundsOf(next, id), id).toEqual(shift(boundsOf(defs, id), 0, -50))
		}
		expect(boundsOf(next, "Participant_customer")).toEqual(boundsOf(defs, "Participant_customer"))
		expect(refsOf(next)).toEqual(refsOf(defs))
		const message = waypointsOf(next, "MessageFlow_confirm")
		expect(message?.[0]?.y).toBe(boundsOf(next, "ship").y + boundsOf(next, "ship").height)
		expect(message?.at(-1)?.y).toBe(boundsOf(next, "Participant_customer").y)
	})

	it("refuses a pool moved onto another pool, the own one or a black box (I4)", () => {
		const defs = flowableFixture()
		expectRefused(defs, { kind: "move", moves: [{ id: "Participant_own", dx: 0, dy: 100 }] })
		expectRefused(defs, { kind: "move", moves: [{ id: "Participant_bank", dx: 0, dy: -60 }] })
		// Beside the partner, not over it.
		const beside = run(defs, { kind: "move", moves: [{ id: "Participant_own", dx: 700, dy: 0 }] })
		expect(boundsOf(beside, "Task_review").x).toBe(860)
	})

	it("refuses a move by nothing, so a drag snapped back to where it was adds no undo step", () => {
		const defs = flowableFixture()
		for (const id of ["Participant_own", "Participant_bank", "Task_review"]) {
			expectRefused(defs, { kind: "move", moves: [{ id, dx: 0, dy: 0 }] })
		}
		expectRefused(defs, {
			kind: "move",
			moves: [
				{ id: "Participant_own", dx: 0, dy: 0 },
				{ id: "Task_review", dx: 0, dy: 0 },
			],
		})
	})

	it("still ignores a lane dragged alone (U4)", () => {
		expectRefused(flowableFixture(), {
			kind: "move",
			moves: [{ id: "Lane_sales", dx: 0, dy: 40 }],
		})
	})
})

// ── 8c.3 the space op ────────────────────────────────────────────────────────

describe("8c.3 space: horizontal", () => {
	it("widens the pools and lanes it crosses and moves what is right of the line", () => {
		const defs = flowableFixture()
		const next = run(defs, { kind: "space", origin: 380, axis: "h", delta: 200 })
		expect(boundsOfAll(next, FLAT_BANDS)).toEqual({
			Participant_own: { x: 0, y: 0, width: 840, height: 360 },
			Lane_sales: { x: 30, y: 0, width: 810, height: 120 },
			Lane_finance: { x: 30, y: 120, width: 810, height: 120 },
			Lane_ops: { x: 30, y: 240, width: 810, height: 120 },
		})
		expect(boundsOf(next, "Participant_partner").width).toBe(840)
		expect(boundsOf(next, "Participant_bank").width).toBe(840)
		expect(boundsOf(next, "Task_pay").x).toBe(600)
		expect(boundsOf(next, "End_1").x).toBe(732)
		expectUnmoved(defs, next, [
			...FLAT_BANDS,
			"Participant_partner",
			"Participant_bank",
			"Task_pay",
			"End_1",
		])
		// Waypoints beyond the line shift, the rest stay: bends kept.
		expect(waypointsOf(next, "Flow_3")).toEqual([
			{ x: 350, y: 180 },
			{ x: 600, y: 180 },
		])
		expect(waypointsOf(next, "Flow_4")).toEqual([
			{ x: 700, y: 180 },
			{ x: 750, y: 180 },
			{ x: 750, y: 282 },
		])
		expect(waypointsOf(next, "Flow_2")).toEqual(waypointsOf(defs, "Flow_2"))
		expect(waypointsOf(next, "Message_pay")).toEqual([
			{ x: 650, y: 220 },
			{ x: 650, y: 490 },
		])
		expect(refsOf(next)).toEqual(refsOf(defs))
	})

	it("makes room leftwards for a negative delta, the pools growing left", () => {
		const defs = flowableFixture()
		const next = run(defs, { kind: "space", origin: 380, axis: "h", delta: -100 })
		expect(boundsOf(next, "Participant_own")).toEqual({ x: -100, y: 0, width: 740, height: 360 })
		expect(boundsOf(next, "Lane_sales")).toEqual({ x: -70, y: 0, width: 710, height: 120 })
		expect(boundsOf(next, "Gateway_ok").x).toBe(200)
		expect(boundsOf(next, "Task_pay").x).toBe(400)
	})

	it("widens the lanes, not moves them, for a line in the pool's name strip", () => {
		const defs = flowableFixture()
		const next = run(defs, { kind: "space", origin: 10, axis: "h", delta: 100 })
		expect(boundsOf(next, "Participant_own")).toEqual({ x: 0, y: 0, width: 740, height: 360 })
		expect(boundsOf(next, "Lane_sales")).toEqual({ x: 30, y: 0, width: 710, height: 120 })
		expect(boundsOf(next, "Start_1").x).toBe(180)
	})
})

describe("8c.3 space: vertical", () => {
	it("deepens the lane and the pool it crosses and shifts what is below", () => {
		const defs = flowableFixture()
		const next = run(defs, { kind: "space", origin: 200, axis: "v", delta: 60 })
		expect(boundsOfAll(next, FLAT_BANDS)).toEqual({
			Participant_own: { x: 0, y: 0, width: 640, height: 420 },
			Lane_sales: { x: 30, y: 0, width: 610, height: 120 },
			Lane_finance: { x: 30, y: 120, width: 610, height: 180 },
			Lane_ops: { x: 30, y: 300, width: 610, height: 120 },
		})
		expect(boundsOf(next, "Participant_partner").y).toBe(460)
		expect(boundsOf(next, "Participant_bank").y).toBe(550)
		expect(boundsOf(next, "End_1").y).toBe(342)
		expectUnmoved(defs, next, [...FLAT_BANDS, "Participant_partner", "Participant_bank", "End_1"])
		expect(waypointsOf(next, "Flow_4")).toEqual([
			{ x: 500, y: 180 },
			{ x: 550, y: 180 },
			{ x: 550, y: 342 },
		])
		expect(waypointsOf(next, "Message_pay")).toEqual([
			{ x: 450, y: 220 },
			{ x: 450, y: 550 },
		])
		// Every node keeps its band, so the refs still agree with the drawing.
		expect(refsOf(next)).toEqual(refsOf(defs))
	})

	it("deepens every nested lane it crosses in fixture 08, the bands still tiling", () => {
		const defs = fixture(FIXTURE_08)
		const next = run(defs, { kind: "space", origin: 100, axis: "v", delta: 40 })
		expect(boundsOfAll(next, NESTED_BANDS)).toEqual({
			Participant_company: { x: 0, y: 0, width: 720, height: 400 },
			Lane_sales: { x: 30, y: 0, width: 690, height: 280 },
			Lane_inside: { x: 60, y: 0, width: 660, height: 160 },
			Lane_desk: { x: 60, y: 160, width: 660, height: 120 },
			Lane_ops: { x: 30, y: 280, width: 690, height: 120 },
		})
		expect(boundsOf(next, "Participant_customer").y).toBe(440)
		// The file draws "rejected" in the desk's band and lists it in Operations; moved, it follows the drawing.
		const refs = refsOf(defs)
		expect(refsOf(next)).toEqual({
			...refs,
			Lane_sales: [...(refs.Lane_sales ?? []), "rejected"],
			Lane_desk: [...(refs.Lane_desk ?? []), "rejected"],
			Lane_ops: refs.Lane_ops?.filter((id) => id !== "rejected"),
		})
	})

	it("moves a partner pool below with its content, drawing only", () => {
		const defs = Bpmn.parse(lockedPartnerXml())
		const next = run(defs, { kind: "space", origin: 380, axis: "v", delta: 50 })
		expect(boundsOf(next, "Participant_partner").y).toBe(450)
		expect(boundsOf(next, "Task_p").y).toBe(460)
		expect(boundsOf(next, "Participant_own")).toEqual(boundsOf(defs, "Participant_own"))
	})

	for (const order of ["second", "second-diagram"] as FlowableOrder[]) {
		it(`makes room in the executable process wherever it is listed (${order})`, () => {
			const defs = flowableFixture(order)
			const r = applyOp(defs, { kind: "space", origin: 200, axis: "v", delta: 60 })
			expectFlowableKept(defs, r.defs)
			expect(documentOrder(r.defs)).toEqual(documentOrder(defs))
			expect(boundsOf(primaryFirst(r.defs), "Lane_finance").height).toBe(180)
		})
	}
})

describe("8c.3 space: refused", () => {
	it("refuses a line across a vertical pool, and a space of nothing", () => {
		for (const laned of [true, false]) {
			const vertical = Bpmn.parse(verticalPoolXml(laned))
			expectRefused(vertical, { kind: "space", origin: 100, axis: "h", delta: 50 })
			expectRefused(vertical, { kind: "space", origin: 300, axis: "v", delta: 50 })
		}
		expectRefused(flowableFixture(), { kind: "space", origin: 200, axis: "v", delta: 0 })
	})

	it("moves everything below a line above a pool-less laned process", () => {
		const defs = poolLessFlowable(true)
		const next = run(defs, { kind: "space", origin: -1000, axis: "v", delta: 30 })
		for (const s of defs.diagrams[0]?.plane.shapes ?? []) {
			expect(boundsOf(next, s.bpmnElement), s.bpmnElement).toEqual(shift(s.bounds, 0, 30))
		}
		expect(refsOf(next)).toEqual(refsOf(defs))
	})
})

describe("WP8b leftovers at the op layer", () => {
	it("refuses a color or label position on a partner's node", () => {
		const defs = Bpmn.parse(lockedPartnerXml())
		expectRefused(defs, { kind: "color", id: "Task_p", color: { fill: "#ffe0b2" } })
		expectRefused(defs, {
			kind: "labelPosition",
			id: "Task_p",
			bounds: { x: 160, y: 460, width: 100, height: 14 },
		})
		expect(
			applyOp(defs, { kind: "color", id: "Task_review", color: { fill: "#ffe0b2" } }).defs,
		).not.toBe(defs)
	})
})

// ── Review fixes: data associations and boundary events ─────────────────────

/**
 * A pool `P` over a task `t` that reads the data store `dsr` (DIA, with a
 * bend) and writes the data object `dor` (DOA, straight down).
 */
const DATA_POOL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="t">
  <collaboration id="C"><participant id="P" name="Pool" processRef="Proc"/></collaboration>
  <process id="Proc" isExecutable="true">
    <dataObject id="DO"/>
    <dataObjectReference id="dor" dataObjectRef="DO"/>
    <dataStoreReference id="dsr"/>
    <task id="t">
      <property id="prop" name="__targetRef_placeholder"/>
      <dataInputAssociation id="DIA"><sourceRef>dsr</sourceRef><targetRef>prop</targetRef></dataInputAssociation>
      <dataOutputAssociation id="DOA"><targetRef>dor</targetRef></dataOutputAssociation>
    </task>
  </process>
  <bpmndi:BPMNDiagram id="D">
    <bpmndi:BPMNPlane id="PL" bpmnElement="C">
      <bpmndi:BPMNShape id="P_di" bpmnElement="P" isHorizontal="true"><omgdc:Bounds x="0" y="0" width="600" height="300"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="t_di" bpmnElement="t"><omgdc:Bounds x="200" y="40" width="100" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="dor_di" bpmnElement="dor"><omgdc:Bounds x="232" y="180" width="36" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="dsr_di" bpmnElement="dsr"><omgdc:Bounds x="60" y="180" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="DIA_di" bpmnElement="DIA"><omgdi:waypoint x="85" y="180"/><omgdi:waypoint x="85" y="80"/><omgdi:waypoint x="200" y="80"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="DOA_di" bpmnElement="DOA"><omgdi:waypoint x="250" y="120"/><omgdi:waypoint x="250" y="180"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`

describe("data associations follow the shapes they join", () => {
	it("translates the data associations of a moved pool, bends kept", () => {
		const defs = Bpmn.parse(DATA_POOL_XML)
		const next = run(defs, { kind: "move", moves: [{ id: "P", dx: 100, dy: 50 }] })
		expect(boundsOf(next, "dor")).toEqual(shift(boundsOf(defs, "dor"), 100, 50))
		for (const id of ["DIA", "DOA"]) {
			expect(waypointsOf(next, id), id).toEqual(shiftAll(waypointsOf(defs, id), 100, 50))
		}
	})

	it("docks a data association again when only one of its ends moved", () => {
		const defs = Bpmn.parse(DATA_POOL_XML)
		const next = run(defs, { kind: "move", moves: [{ id: "dor", dx: 0, dy: 40 }] })
		const route = waypointsOf(next, "DOA")
		expect(route?.[0]?.y).toBe(120)
		expect(route?.at(-1)?.y).toBe(220)
	})

	it("moves a data association's end with the shape it is docked on under the space tool", () => {
		const defs = Bpmn.parse(DATA_POOL_XML)
		// Below dor's top, above its centre: dor moves, its docked end must too.
		const next = run(defs, { kind: "space", origin: 190, axis: "v", delta: 50 })
		expect(boundsOf(next, "dor").y).toBe(230)
		expect(waypointsOf(next, "DOA")).toEqual([
			{ x: 250, y: 120 },
			{ x: 250, y: 230 },
		])
	})
})

/** An expanded sub-process `sp` (y 100 to 300) with a boundary event centred on its top edge and one on its bottom edge. */
const HOSTED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="t">
  <process id="Proc" isExecutable="true">
    <subProcess id="sp"><startEvent id="inner"/></subProcess>
    <boundaryEvent id="bTop" attachedToRef="sp"><timerEventDefinition/></boundaryEvent>
    <boundaryEvent id="bBottom" attachedToRef="sp"><timerEventDefinition/></boundaryEvent>
  </process>
  <bpmndi:BPMNDiagram id="D">
    <bpmndi:BPMNPlane id="PL" bpmnElement="Proc">
      <bpmndi:BPMNShape id="sp_di" bpmnElement="sp" isExpanded="true"><omgdc:Bounds x="100" y="100" width="300" height="200"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="inner_di" bpmnElement="inner"><omgdc:Bounds x="130" y="182" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="bTop_di" bpmnElement="bTop"><omgdc:Bounds x="182" y="82" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="bBottom_di" bpmnElement="bBottom"><omgdc:Bounds x="282" y="282" width="36" height="36"/></bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`

describe("8c.3 space: boundary events stay on their host's edge", () => {
	for (const origin of [150, 250]) {
		it(`keeps each event on its edge of a sub-process the line crosses (line at ${origin})`, () => {
			const defs = Bpmn.parse(HOSTED_XML)
			const next = run(defs, { kind: "space", origin, axis: "v", delta: 50 })
			expect(boundsOf(next, "sp")).toEqual({ x: 100, y: 100, width: 300, height: 250 })
			expect(boundsOf(next, "bTop").y).toBe(82)
			expect(boundsOf(next, "bBottom").y).toBe(332)
		})
	}

	it("moves the events with a host that moves whole", () => {
		const defs = Bpmn.parse(HOSTED_XML)
		const next = run(defs, { kind: "space", origin: 50, axis: "v", delta: 50 })
		expect(boundsOf(next, "sp").y).toBe(150)
		expect(boundsOf(next, "bTop").y).toBe(132)
		expect(boundsOf(next, "bBottom").y).toBe(332)
	})
})
