import { beforeEach, describe, expect, it } from "vitest"
import type { BpmnDefinitions, BpmnDiShape } from "../src/bpmn/bpmn-model.js"
import { Bpmn, resetIdCounter } from "../src/index.js"
import type { Bounds, Waypoint } from "../src/layout/types.js"

function plane(defs: BpmnDefinitions) {
	const p = defs.diagrams[0]?.plane
	expect(p).toBeDefined()
	return p as NonNullable<typeof p>
}

function shape(defs: BpmnDefinitions, id: string): BpmnDiShape {
	const s = plane(defs).shapes.find((x) => x.bpmnElement === id)
	expect(s, id).toBeDefined()
	return s as BpmnDiShape
}

function label(defs: BpmnDefinitions, id: string): Bounds {
	const b = shape(defs, id).label?.bounds
	expect(b, `${id} label`).toBeDefined()
	return b as Bounds
}

function rectsOverlap(a: Bounds, b: Bounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/** Whether the axis-aligned segment p→q passes through the interior of `r`. */
function segmentHits(p: Waypoint, q: Waypoint, r: Bounds): boolean {
	const [x1, x2] = [Math.min(p.x, q.x), Math.max(p.x, q.x)]
	const [y1, y2] = [Math.min(p.y, q.y), Math.max(p.y, q.y)]
	return x1 < r.x + r.width && x2 > r.x && y1 < r.y + r.height && y2 > r.y
}

function edgesHitting(defs: BpmnDefinitions, r: Bounds): string[] {
	const hits: string[] = []
	for (const edge of plane(defs).edges) {
		for (let i = 0; i + 1 < edge.waypoints.length; i++) {
			const [p, q] = [edge.waypoints[i], edge.waypoints[i + 1]]
			if (p && q && segmentHits(p, q, r)) hits.push(edge.bpmnElement)
		}
	}
	return hits
}

/** Pairs of edges whose segments cross at a point interior to both. */
function crossings(defs: BpmnDefinitions, ids: string[]): string[] {
	const segs = plane(defs)
		.edges.filter((e) => ids.includes(e.bpmnElement))
		.flatMap((e) =>
			e.waypoints.slice(1).map((q, i) => ({ id: e.bpmnElement, p: e.waypoints[i] as Waypoint, q })),
		)
	const found = new Set<string>()
	for (const a of segs) {
		for (const b of segs) {
			if (a.id >= b.id) continue
			const aVertical = a.p.x === a.q.x
			const bVertical = b.p.x === b.q.x
			if (aVertical === bVertical) continue
			const [v, h] = aVertical ? [a, b] : [b, a]
			const x = v.p.x
			const y = h.p.y
			const inV = y > Math.min(v.p.y, v.q.y) && y < Math.max(v.p.y, v.q.y)
			const inH = x > Math.min(h.p.x, h.q.x) && x < Math.max(h.p.x, h.q.x)
			if (inV && inH) found.add(`${a.id}×${b.id}`)
		}
	}
	return [...found]
}

/**
 * Escalation boundary options. `BoundaryEventOptions` does not declare
 * `escalationCode`, though the builder honours it; a variable skips the
 * excess-property check an object literal would get.
 */
const escalated = { name: "Escalated", escalationCode: "E" }

describe("boundary event labels and docking (#222)", () => {
	beforeEach(() => resetIdCounter())

	function agent(name?: string): BpmnDefinitions {
		return Bpmn.createProcess("p")
			.startEvent("s")
			.adHocSubProcess(
				"ah",
				(c) => {
					c.serviceTask("A", { name: "A", taskType: "x" })
				},
				name === undefined ? {} : { name },
			)
			.withBoundary("b1", escalated, (h) => h.endEvent("e1"))
			.withBoundary("b2", { name: "Failed", errorCode: "X" }, (h) => h.endEvent("e2"))
			.withBoundary("b3", { name: "Deadline", timerDuration: "P1D" }, (h) => h.endEvent("e3"))
			.endEvent("e")
			.withAutoLayout()
			.build()
	}

	it("keeps boundary events and their labels off a titled container's top border", () => {
		const defs = agent("Agent title")
		const container = shape(defs, "ah").bounds
		const bottom = container.y + container.height
		for (const id of ["b1", "b2", "b3"]) {
			const b = shape(defs, id).bounds
			expect(b.y + b.height / 2, id).toBe(bottom)
			// Outside the container altogether, title band included.
			expect(rectsOverlap(label(defs, id), container), `${id} label`).toBe(false)
		}
	})

	it("no label is crossed by any edge, and the handler routes nest", () => {
		const defs = agent("Agent title")
		for (const s of plane(defs).shapes) {
			const lb = s.label?.bounds
			if (lb) expect(edgesHitting(defs, lb), `${s.bpmnElement} label`).toEqual([])
		}
		expect(crossings(defs, ["Flow_b1_e1", "Flow_b2_e2", "Flow_b3_e3"])).toEqual([])
		const labels = ["b1", "b2", "b3"].map((id) => label(defs, id))
		for (let i = 0; i < labels.length; i++) {
			for (let j = i + 1; j < labels.length; j++) {
				expect(rectsOverlap(labels[i] as Bounds, labels[j] as Bounds)).toBe(false)
			}
		}
	})

	it("still docks escalation on top of an untitled host, label above and off its stem", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("t", { name: "Work", taskType: "w" })
			.withBoundary("esc", escalated, (h) => h.endEvent("ee"))
			.endEvent("e")
			.withAutoLayout()
			.build()
		const host = shape(defs, "t").bounds
		const esc = shape(defs, "esc").bounds
		expect(esc.y + esc.height / 2).toBe(host.y)
		const lb = label(defs, "esc")
		expect(lb.y + lb.height).toBeLessThanOrEqual(esc.y)
		expect(rectsOverlap(lb, host)).toBe(false)
		expect(edgesHitting(defs, lb)).toEqual([])
	})

	it("wraps a label that fits in neither gap instead of crossing a stem or a label", () => {
		// Three events 50 px apart on a 200 px container, each name 140 px wide.
		const names = ["Payment deadline hit", "Customer cancelled it", "Upstream service down"]
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess(
				"sub",
				(c) => {
					c.startEvent("ss").serviceTask("A", { name: "A", taskType: "x" }).endEvent("se")
				},
				{ name: "Titled" },
			)
			.withBoundary("b1", { name: names[0], timerDuration: "PT1H" }, (h) => h.endEvent("x1"))
			.withBoundary("b2", { name: names[1], errorCode: "C" }, (h) => h.endEvent("x2"))
			.withBoundary("b3", { name: names[2], errorCode: "U" }, (h) => h.endEvent("x3"))
			.endEvent("e")
			.withAutoLayout()
			.build()
		const ids = ["b1", "b2", "b3"]
		for (const id of ids) expect(edgesHitting(defs, label(defs, id)), id).toEqual([])
		for (let i = 0; i < ids.length; i++) {
			for (let j = i + 1; j < ids.length; j++) {
				const [a, b] = [ids[i] as string, ids[j] as string]
				expect(rectsOverlap(label(defs, a), label(defs, b)), `${a} / ${b}`).toBe(false)
			}
		}
		// The middle label had no 140 px gap on either side, so it wrapped.
		const wrapped = ids.map((id) => label(defs, id)).filter((l) => l.height > 14)
		expect(wrapped.length).toBeGreaterThan(0)
		expect(crossings(defs, ["Flow_b1_x1", "Flow_b2_x2", "Flow_b3_x3"])).toEqual([])
	})

	it("labels of two events on a narrow task stay clear of both stems", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("t", { name: "Work", taskType: "w" })
			.withBoundary("b1", { name: "Timed out", timerDuration: "PT1H" }, (h) => h.endEvent("x1"))
			.withBoundary("b2", { name: "Failed", errorCode: "F" }, (h) => h.endEvent("x2"))
			.endEvent("e")
			.withAutoLayout()
			.build()
		for (const id of ["b1", "b2"]) {
			expect(edgesHitting(defs, label(defs, id)), id).toEqual([])
		}
		expect(rectsOverlap(label(defs, "b1"), label(defs, "b2"))).toBe(false)
		expect(crossings(defs, ["Flow_b1_x1", "Flow_b2_x2"])).toEqual([])
	})
})
