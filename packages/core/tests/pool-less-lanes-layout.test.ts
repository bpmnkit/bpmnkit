import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import type { BpmnBounds, BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { semanticHash } from "../src/bpmn/semantic-hash.js"

/** A laned Flowable process with no pool and no diagram: lanes Sales, Finance and Operations. */
const LANED = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:flowable="http://flowable.org/bpmn" targetNamespace="t">
  <process id="order" isExecutable="true" flowable:candidateStarterGroups="sales">
    <laneSet id="LaneSet_1">
      <lane id="sales" name="Sales"><flowNodeRef>start</flowNodeRef><flowNodeRef>review</flowNodeRef></lane>
      <lane id="finance" name="Finance"><flowNodeRef>pay</flowNodeRef></lane>
      <lane id="ops" name="Operations"><flowNodeRef>ship</flowNodeRef><flowNodeRef>done</flowNodeRef></lane>
    </laneSet>
    <startEvent id="start"/>
    <userTask id="review" flowable:assignee="clerk"/>
    <serviceTask id="pay" flowable:class="com.acme.Pay"/>
    <serviceTask id="ship"/>
    <endEvent id="done"/>
    <sequenceFlow id="f1" sourceRef="start" targetRef="review"/>
    <sequenceFlow id="f2" sourceRef="review" targetRef="pay"/>
    <sequenceFlow id="f3" sourceRef="pay" targetRef="ship"/>
    <sequenceFlow id="f4" sourceRef="ship" targetRef="done"/>
  </process>
</definitions>`

const LANES = { sales: ["start", "review"], finance: ["pay"], ops: ["ship", "done"] }

function boundsOf(defs: BpmnDefinitions, id: string): BpmnBounds {
	const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

function contains(outer: BpmnBounds, inner: BpmnBounds): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

describe("auto-layout of a laned process with no pool", () => {
	it("draws one band per lane on the process plane, without adding a pool", () => {
		const defs = parseBpmn(LANED)
		const laid = applyAutoLayout(defs)
		expect(laid.collaborations).toEqual([])
		expect(laid.diagrams[0]?.plane.bpmnElement).toBe("order")
		for (const lane of Object.keys(LANES)) {
			const shapes = laid.diagrams[0]?.plane.shapes.filter((s) => s.bpmnElement === lane)
			expect(shapes, lane).toHaveLength(1)
			expect(shapes?.[0]?.isHorizontal, lane).toBe(true)
		}
		expect(semanticHash(laid)).toBe(semanticHash(defs))
	})

	it("tiles the bands top to bottom around the nodes each lane lists", () => {
		const laid = applyAutoLayout(parseBpmn(LANED))
		const bands = Object.keys(LANES)
			.map((lane) => boundsOf(laid, lane))
			.sort((a, b) => a.y - b.y)
		for (let i = 1; i < bands.length; i++) {
			const above = bands[i - 1] as BpmnBounds
			const band = bands[i] as BpmnBounds
			expect(band.y).toBe(above.y + above.height)
			expect(band.x).toBe(above.x)
			expect(band.width).toBe(above.width)
		}
		for (const [lane, nodes] of Object.entries(LANES)) {
			for (const node of nodes) {
				expect(contains(boundsOf(laid, lane), boundsOf(laid, node)), `${node} in ${lane}`).toBe(
					true,
				)
			}
		}
	})

	it("insets nested lanes one header per level, on a Flowable file stripped of its pools", () => {
		const file = join(import.meta.dirname, "fixtures", "roundtrip", "08-flowable-lanes-pools.bpmn")
		const defs = { ...parseBpmn(readFileSync(file, "utf8")), collaborations: [], diagrams: [] }
		const laid = applyAutoLayout(defs)
		expect(laid.collaborations).toEqual([])
		const sales = boundsOf(laid, "Lane_sales")
		const inside = boundsOf(laid, "Lane_inside")
		expect(boundsOf(laid, "Lane_ops").x).toBe(sales.x)
		expect(inside.x).toBe(sales.x + 30)
		expect(inside.x + inside.width).toBe(sales.x + sales.width)
		expect(contains(inside, boundsOf(laid, "review"))).toBe(true)
		expect(contains(boundsOf(laid, "Lane_desk"), boundsOf(laid, "decide"))).toBe(true)
		expect(semanticHash(laid)).toBe(semanticHash(defs))
	})
})
