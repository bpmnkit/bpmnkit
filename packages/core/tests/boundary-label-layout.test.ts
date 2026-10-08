import { beforeEach, describe, expect, it } from "vitest"
import type { BpmnDefinitions, BpmnDiShape } from "../src/bpmn/bpmn-model.js"
import { exportSvg } from "../src/bpmn/svg.js"
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

	it("moves a label that fits in neither gap beyond the outermost stem", () => {
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
		// The middle event's label had no 140 px gap on either side: it sits past the
		// outermost stem, on a single line, in the same row as the others.
		const stems = new Map(
			ids.map((id) => {
				const b = shape(defs, id).bounds
				return [id, b.x + b.width / 2] as const
			}),
		)
		const sorted = [...stems.values()].sort((p, q) => p - q)
		const middleId = ids.find((id) => stems.get(id) === sorted[1]) as string
		const middle = label(defs, middleId)
		expect(middle.height).toBe(14)
		const outside =
			middle.x + middle.width <= (sorted[0] as number) || middle.x >= (sorted[2] as number)
		expect(outside).toBe(true)
		expect(new Set(ids.map((id) => label(defs, id).y)).size).toBe(1)
		expect(crossings(defs, ["Flow_b1_x1", "Flow_b2_x2", "Flow_b3_x3"])).toEqual([])
	})

	it("never lets a long many-word label reach the handler routes", () => {
		// Before, a name like this wrapped into a 42 px gap and grew down into the routes.
		const long = "we waited for the payment and then for the bank and then for the clerk"
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess(
				"sub",
				(c) => {
					c.startEvent("ss").serviceTask("A", { name: "A", taskType: "x" }).endEvent("se")
				},
				{ name: "T" },
			)
			.withBoundary("b1", { name: "Timer", timerDuration: "PT1H" }, (h) => h.endEvent("x1"))
			.withBoundary("b2", { name: long, errorCode: "L" }, (h) => h.endEvent("x2"))
			.withBoundary("b3", { name: "Failed", errorCode: "F" }, (h) => h.endEvent("x3"))
			.withBoundary("b4", { name: "Cancel", errorCode: "C" }, (h) => h.endEvent("x4"))
			.endEvent("e")
			.withAutoLayout()
			.build()
		const ids = ["b1", "b2", "b3", "b4"]
		for (const id of ids) {
			const lb = label(defs, id)
			expect(lb.height, id).toBe(14)
			expect(edgesHitting(defs, lb), id).toEqual([])
		}
		for (let i = 0; i < ids.length; i++) {
			for (let j = i + 1; j < ids.length; j++) {
				const [a, b] = [ids[i] as string, ids[j] as string]
				expect(rectsOverlap(label(defs, a), label(defs, b)), `${a} / ${b}`).toBe(false)
			}
		}
	})

	it("keeps every label in the row next to the host, however many events there are", () => {
		// Ten long names on a 100 px task: most labels go past the outer stems.
		let b = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("t", { name: "Work", taskType: "w" })
		const ids = Array.from({ length: 10 }, (_, i) => `b${i}`)
		for (const id of ids) {
			b = b.withBoundary(id, { name: `Upstream failure ${id}`, errorCode: id }, (h) =>
				h.endEvent(`x_${id}`),
			)
		}
		const defs = b.endEvent("e").withAutoLayout().build()
		const labels = ids.map((id) => label(defs, id))
		expect(new Set(labels.map((l) => l.y)).size).toBe(1)
		for (const id of ids) expect(edgesHitting(defs, label(defs, id)), id).toEqual([])
		for (let i = 0; i < labels.length; i++) {
			for (let j = i + 1; j < labels.length; j++) {
				const [p, q] = [labels[i] as Bounds, labels[j] as Bounds]
				expect(rectsOverlap(p, q), `${ids[i]}/${ids[j]}`).toBe(false)
			}
		}
	})

	it("the SVG export draws every label line inside its bounds", () => {
		const names = ["Payment deadline hit", "Reconciliation pending", "Upstream service down"]
		const opts = (name: string, top: boolean) =>
			top ? { name, escalationCode: name } : { name, errorCode: name }
		// Three events on a titled container (the middle label wraps into its gap) and
		// on a 100 px task (no gap is readable, so it goes beyond the outer stem),
		// docked on the bottom and, for the task, on the top as well.
		const cases = [
			{ host: "titled", top: false },
			{ host: "task", top: false },
			{ host: "task", top: true },
		]
		for (const { host, top } of cases) {
			let b = Bpmn.createProcess("p").startEvent("s")
			b =
				host === "task"
					? b.serviceTask("h", { name: "Work", taskType: "w" })
					: b.subProcess(
							"h",
							(c) => {
								c.startEvent("ss").serviceTask("A", { name: "A", taskType: "x" }).endEvent("se")
							},
							{ name: "Titled" },
						)
			names.forEach((name, i) => {
				b = b.withBoundary(`b${i + 1}`, opts(name, top), (h) => h.endEvent(`x${i + 1}`))
			})
			const defs = b.endEvent("e").withAutoLayout().build()
			const where = `${host}, top: ${top}`

			const svg = exportSvg(defs)
			const texts = [...svg.matchAll(/<text [^>]*x="([^"]+)" y="([^"]+)">([^<]*)<\/text>/g)].map(
				(m) => ({ x: Number(m[1]), y: Number(m[2]), text: m[3] as string }),
			)
			const ids = ["b1", "b2", "b3"]
			for (const id of ids) {
				const lb = label(defs, id)
				const lines = texts.filter((t) => Math.abs(t.x - (lb.x + lb.width / 2)) < 0.01)
				expect(lines.map((l) => l.text).join(" "), `${id} (${where})`).toBe(names[ids.indexOf(id)])
				for (const line of lines) {
					// Centred text at the export's 6.5 px glyph estimate; lines are 14 px tall.
					expect(line.text.length * 6.5, `${id}: "${line.text}"`).toBeLessThanOrEqual(lb.width)
					expect(line.y - 7, `${id}: "${line.text}"`).toBeGreaterThanOrEqual(lb.y - 0.01)
					expect(line.y + 7, `${id}: "${line.text}"`).toBeLessThanOrEqual(lb.y + lb.height + 0.01)
				}
				expect(edgesHitting(defs, lb), `${id} (${where})`).toEqual([])
				expect(rectsOverlap(lb, shape(defs, "h").bounds), `${id} (${where})`).toBe(false)
			}
			for (let i = 0; i < ids.length; i++) {
				for (let j = i + 1; j < ids.length; j++) {
					const [p, q] = [ids[i] as string, ids[j] as string]
					expect(rectsOverlap(label(defs, p), label(defs, q)), `${p}/${q} (${where})`).toBe(false)
				}
			}
		}
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
