import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import type { BpmnDiShape } from "../src/bpmn/bpmn-model.js"
import { Bpmn } from "../src/bpmn/index.js"
import { pathCrossings } from "../src/layout/collaboration/crossings.js"
import { flipDockedLabels } from "../src/layout/collaboration/docked-labels.js"
import { assignTracks } from "../src/layout/collaboration/message-tracks.js"
import { orderByCrossings, stackCrossings } from "../src/layout/collaboration/stack-crossings.js"

// Three pools of different lengths, one laned, plus a black box.
const RAGGED = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">
  <collaboration id="c">
    <participant id="Long" processRef="PL" />
    <participant id="Short" processRef="PS" />
    <participant id="Box" />
    <messageFlow id="m1" sourceRef="l2" targetRef="s1" />
    <messageFlow id="m2" sourceRef="s2" targetRef="Box" />
  </collaboration>
  <process id="PL">
    <laneSet id="ls"><lane id="LA"><flowNodeRef>l1</flowNodeRef><flowNodeRef>l2</flowNodeRef></lane>
      <lane id="LB"><flowNodeRef>l3</flowNodeRef><flowNodeRef>l4</flowNodeRef><flowNodeRef>l5</flowNodeRef></lane></laneSet>
    <startEvent id="l1" /><task id="l2" /><task id="l3" /><task id="l4" /><endEvent id="l5" />
    <sequenceFlow id="f1" sourceRef="l1" targetRef="l2" /><sequenceFlow id="f2" sourceRef="l2" targetRef="l3" />
    <sequenceFlow id="f3" sourceRef="l3" targetRef="l4" /><sequenceFlow id="f4" sourceRef="l4" targetRef="l5" />
  </process>
  <process id="PS">
    <startEvent id="s1" /><task id="s2" /><endEvent id="s3" />
    <sequenceFlow id="g1" sourceRef="s1" targetRef="s2" /><sequenceFlow id="g2" sourceRef="s2" targetRef="s3" />
  </process>
</definitions>`

describe("uniform pool frame", () => {
	it("gives every pool, black box and lane the same left and right edge", () => {
		const shapes = applyAutoLayout(Bpmn.parse(RAGGED)).diagrams[0]?.plane.shapes ?? []
		const of = (id: string) => shapes.find((s) => s.bpmnElement === id)?.bounds
		const pools = ["Long", "Short", "Box"].map(of)
		const right = (b: { x: number; width: number } | undefined) => (b ? b.x + b.width : Number.NaN)
		expect(new Set(pools.map((b) => b?.x))).toEqual(new Set([0]))
		expect(new Set(pools.map(right)).size).toBe(1)
		expect(right(of("LA"))).toBe(right(of("Long")))
		expect(right(of("LB"))).toBe(right(of("Long")))
	})
})

describe("assignTracks", () => {
	it("orders overlapping runs so no riser crosses another run", () => {
		// A comes down at 100 and leaves at 300; B comes down at 200 and leaves at
		// 400. Leftmost-first stacking puts A on top, and B's upper riser then
		// crosses A's run; with B on top neither riser meets the other run.
		const [a, b] = assignTracks(
			[
				{ upper: 100, lower: 300 },
				{ upper: 200, lower: 400 },
			],
			0,
			60,
		)
		expect(b).toBeLessThan(a as number)
	})

	it("lets runs that do not overlap share one track and skips vertical ones", () => {
		const ys = assignTracks(
			[
				{ upper: 100, lower: 200 },
				{ upper: 300, lower: 400 },
				{ upper: 500, lower: 500 },
			],
			0,
			60,
		)
		expect(ys).toEqual([30, 30, undefined])
	})
})

describe("flipDockedLabels", () => {
	const event = (labelY: number): BpmnDiShape => ({
		id: "e_di",
		bpmnElement: "e",
		bounds: { x: 100, y: 100, width: 36, height: 36 },
		label: { bounds: { x: 88, y: labelY, width: 60, height: 14 } },
		unknownAttributes: {},
	})

	it("moves a label off the side a message docks on", () => {
		const shapes = [event(140)]
		flipDockedLabels(shapes, [], [{ element: "e", y: 136 }], new Set())
		expect(shapes[0]?.label?.bounds?.y).toBe(82)
	})

	it("keeps it when the far side is taken", () => {
		const blocker: BpmnDiShape = {
			id: "t_di",
			bpmnElement: "t",
			bounds: { x: 80, y: 60, width: 100, height: 30 },
			unknownAttributes: {},
		}
		const shapes = [event(140), blocker]
		flipDockedLabels(shapes, [], [{ element: "e", y: 136 }], new Set())
		expect(shapes[0]?.label?.bounds?.y).toBe(140)
	})

	it("keeps it when messages dock on both sides", () => {
		const shapes = [event(140)]
		flipDockedLabels(
			shapes,
			[],
			[
				{ element: "e", y: 136 },
				{ element: "e", y: 100 },
			],
			new Set(),
		)
		expect(shapes[0]?.label?.bounds?.y).toBe(140)
	})
})

describe("pathCrossings", () => {
	it("counts a riser through a run, not a shared dock or a touching corner", () => {
		const run = [
			{ x: 0, y: 50 },
			{ x: 100, y: 50 },
		]
		expect(
			pathCrossings(run, [
				{ x: 50, y: 0 },
				{ x: 50, y: 100 },
			]),
		).toBe(1)
		expect(
			pathCrossings(run, [
				{ x: 100, y: 50 },
				{ x: 100, y: 100 },
			]),
		).toBe(0)
		expect(
			pathCrossings(run, [
				{ x: 50, y: 50 },
				{ x: 50, y: 100 },
			]),
		).toBe(0)
		expect(
			pathCrossings(run, [
				{ x: 20, y: 50 },
				{ x: 80, y: 50 },
			]),
		).toBe(0)
	})
})

describe("pool order by crossings", () => {
	// Pool 0 talks to 1 and 2; both run a flow across their whole width at
	// mid-height, below and above the message's element. Stacked 0, 1, 2 the
	// message to 2 passes through 1 and crosses its flow; with 0 in the middle
	// nothing crosses, though both orders are one pool step per message.
	const flow = [
		{ x: 0, y: 40 },
		{ x: 400, y: 40 },
	]
	const pools = [
		{ height: 80, paths: [] },
		{ height: 80, paths: [flow] },
		{ height: 80, paths: [flow] },
	]
	const end = (x: number) => ({ x, top: 20, bottom: 60 })
	const messages = [
		{ from: 0, to: 1, fromEnd: end(100), toEnd: end(100) },
		{ from: 0, to: 2, fromEnd: end(300), toEnd: end(300) },
	]

	it("counts a message crossing the process it passes", () => {
		expect(stackCrossings([0, 1, 2], pools, messages)).toBe(1)
		expect(stackCrossings([1, 0, 2], pools, messages)).toBe(0)
	})

	it("moves pools until nothing crosses, and keeps a start that cannot improve", () => {
		expect(stackCrossings(orderByCrossings([0, 1, 2], pools, messages), pools, messages)).toBe(0)
		expect(orderByCrossings([1, 0, 2], pools, messages)).toEqual([1, 0, 2])
	})
})

it("stacks lane-less pools on the 10 px grid", () => {
	const laid = applyAutoLayout(Bpmn.parse(RAGGED))
	const shapes = laid.diagrams[0]?.plane.shapes ?? []
	for (const id of ["Short", "Box"]) {
		const pool = shapes.find((s) => s.bpmnElement === id)
		expect(pool && pool.bounds.y % 10, id).toBe(0)
		expect(pool && pool.bounds.height % 10, id).toBe(0)
	}
})
