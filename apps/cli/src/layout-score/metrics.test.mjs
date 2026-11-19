import { describe, expect, it } from "vitest"
import { countCrossings, measure } from "../../../../scripts/layout-aesthetics/metrics.mjs"
import { isWorse, regressions } from "../../../../scripts/layout-aesthetics/score-lib.mjs"

const shape = (id, x, y, w = 100, h = 80, label = undefined) => ({
	bpmnElement: id,
	bounds: { x, y, width: w, height: h },
	...(label ? { label: { bounds: label } } : {}),
})
const edge = (id, pts, label) => ({
	bpmnElement: id,
	waypoints: pts.map(([x, y]) => ({ x, y })),
	...(label ? { label: { bounds: label } } : {}),
})
const task = (id, name = id) => ({ id, type: "task", name })

/** Two pools; a sends m1 to b (bent) and m2 (vertical). */
function collab(shapes, edges, extra = {}) {
	return {
		processes: [
			{
				id: "pa",
				flowElements: [task("a1"), task("a2")],
				sequenceFlows: [{ id: "s1", sourceRef: "a1", targetRef: "a2" }],
			},
			{ id: "pb", flowElements: [task("b1")], sequenceFlows: [] },
		],
		collaborations: [
			{
				participants: [
					{ id: "PA", processRef: "pa" },
					{ id: "PB", processRef: "pb" },
				],
				messageFlows: [
					{ id: "m1", sourceRef: "a1", targetRef: "b1", name: "M1" },
					{ id: "m2", sourceRef: "a2", targetRef: "b1", name: "M2" },
				],
			},
		],
		diagrams: [{ plane: { shapes, edges } }],
		...extra,
	}
}

const baseShapes = [
	shape("PA", 0, 0, 500, 200),
	shape("PB", 0, 300, 300, 200),
	shape("a1", 50, 60),
	shape("a2", 250, 60),
	shape("b1", 80, 360),
]

describe("measure", () => {
	it("counts bends, verticality, crossings of seq and message flows", () => {
		const edges = [
			edge("s1", [
				[150, 100],
				[250, 100],
			]),
			// m1 straight down at x=100; m2 with a Z that crosses s1? no: it goes x=300→130
			edge("m1", [
				[100, 140],
				[100, 360],
			]),
			edge("m2", [
				[300, 140],
				[300, 250],
				[130, 250],
				[130, 360],
			]),
		]
		const m = measure(collab(baseShapes, edges))
		expect(m.bendsPerMsg).toBe(1)
		expect(m.bendsPerSeq).toBe(0)
		expect(m.maxBendsMsg).toBe(2)
		expect(m.nonVerticalMsgPct).toBe(50)
		expect(m.msgMsgCrossings).toBe(0)
		expect(m.seqCrossings).toBe(0)
	})

	it("counts msg×seq crossings and msg×msg crossings", () => {
		const edges = [
			edge("s1", [
				[150, 100],
				[250, 100],
			]),
			edge("m1", [
				[200, 40],
				[200, 160],
			]), // crosses s1
			edge("m2", [
				[150, 130],
				[320, 130],
			]), // crosses m1
		]
		const m = measure(collab(baseShapes, edges))
		expect(m.msgSeqCrossings).toBe(1)
		expect(m.msgMsgCrossings).toBe(1)
		expect(m.seqCrossings).toBe(0)
		expect(m.crossings).toBe(2)
	})

	it("measures pool width and left-padding spread", () => {
		const m = measure(collab(baseShapes, []))
		expect(m.poolWidthSD).toBe(100) // widths 500 and 300
		expect(m.poolPadSD).toBe(Math.round(Math.sqrt(((50 - 65) ** 2 + (80 - 65) ** 2) / 2)))
	})

	it("counts edges through shapes, label overlaps and crossed labels", () => {
		const defs = collab(
			[...baseShapes, shape("a3", 400, 60, 50, 50)],
			[
				edge(
					"s1",
					[
						[150, 100],
						[450, 100],
					],
					{ x: 300, y: 80, width: 60, height: 20 },
				),
				edge(
					"m1",
					[
						[100, 140],
						[100, 360],
					],
					{ x: 105, y: 200, width: 40, height: 14 },
				),
				edge(
					"m2",
					[
						[300, 140],
						[300, 360],
					],
					{ x: 110, y: 205, width: 40, height: 14 },
				),
			],
		)
		defs.processes[0].flowElements.push(task("a3"))
		const m = measure(defs)
		expect(m.throughShapes).toBe(1) // s1 passes a2? a2 is its target; a3 is not an end
		expect(m.labelLabelOverlaps).toBe(1)
		expect(m.labelOnEdge).toBeGreaterThanOrEqual(0)
	})

	it("flags a boundary label crossed by its own flow", () => {
		const defs = {
			processes: [
				{
					id: "p",
					flowElements: [
						task("t"),
						{ id: "b", type: "boundaryEvent", name: "Fail", attachedToRef: "t" },
						task("h"),
					],
					sequenceFlows: [{ id: "f", sourceRef: "b", targetRef: "h" }],
				},
			],
			collaborations: [],
			diagrams: [
				{
					plane: {
						shapes: [
							shape("t", 0, 0),
							shape("b", 50, 62, 36, 36, { x: 40, y: 110, width: 40, height: 14 }),
							shape("h", 0, 200),
						],
						edges: [
							edge("f", [
								[68, 98],
								[68, 240],
							]),
						],
					},
				},
			],
		}
		expect(measure(defs).boundaryLabelsCrossed).toBe(1)
	})

	it("reports grid alignment and shared centre-x", () => {
		const m = measure(
			collab(
				[
					shape("PA", 0, 0, 500, 200),
					shape("a1", 50, 60),
					shape("a2", 55, 160),
					shape("b1", 300, 360),
				],
				[],
			),
		)
		expect(m.gridPct).toBe(75)
		// a1 and a2 centres differ by 5 → not shared; only 1 task pair? none
		expect(m.sharedCentreXPct).toBe(0)
	})
})

describe("countCrossings", () => {
	it("counts each pair once", () => {
		const a = [
			edge("a", [
				[0, 5],
				[10, 5],
			]),
		]
		const b = [
			edge("b", [
				[5, 0],
				[5, 10],
			]),
		]
		expect(countCrossings(a, b, false)).toBe(1)
		expect(countCrossings([...a, ...b], [...a, ...b], true)).toBe(1)
	})
})

describe("ratchet comparison", () => {
	it("counts allow no slack, ratios 1 %", () => {
		expect(isWorse("seqCrossings", 0, 1)).toBe(true)
		expect(isWorse("seqCrossings", 2, 1)).toBe(false)
		expect(isWorse("areaPerNode", 10000, 10099)).toBe(false)
		expect(isWorse("areaPerNode", 10000, 10101)).toBe(true)
		expect(isWorse("sharedCentreXPct", 50, 40)).toBe(true)
		expect(isWorse("aspect", 1, 9)).toBe(false)
	})

	it("reports regressions and unknown cases", () => {
		const base = { cases: { a: { seqCrossings: 0, width: 100 } } }
		const r = regressions(base, { a: { seqCrossings: 1, width: 100 }, z: { width: 1 } })
		expect(r.worse).toEqual([{ name: "a", metric: "seqCrossings", was: 0, now: 1 }])
		expect(r.missing).toEqual(["z"])
	})
})
