import { beforeEach, describe, expect, it } from "vitest"
import type { BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { Bpmn, resetIdCounter } from "../src/index.js"
import type { SubProcessContentBuilder } from "../src/index.js"
import { layoutProcess } from "../src/layout/layout-engine.js"
import type { Bounds } from "../src/layout/types.js"
import { SUBPROCESS_PADDING } from "../src/layout/types.js"

function layoutAdHoc(content: (c: SubProcessContentBuilder) => void): BpmnDefinitions {
	return Bpmn.createProcess("p")
		.startEvent("s")
		.adHocSubProcess("ah", content)
		.endEvent("e")
		.withAutoLayout()
		.build()
}

function boundsOf(defs: BpmnDefinitions): Map<string, Bounds> {
	const plane = defs.diagrams[0]?.plane
	expect(plane).toBeDefined()
	return new Map((plane?.shapes ?? []).map((s) => [s.bpmnElement, s.bounds]))
}

function get(bounds: Map<string, Bounds>, id: string): Bounds {
	const b = bounds.get(id)
	expect(b, id).toBeDefined()
	return b as Bounds
}

function overlaps(a: Bounds, b: Bounds): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function tools(ids: string[]) {
	return (c: SubProcessContentBuilder) => {
		for (const id of ids) c.serviceTask(id, { name: id, taskType: "x" })
	}
}

function expectInsideAndApart(bounds: Map<string, Bounds>, ids: string[]): void {
	const container = get(bounds, "ah")
	for (const id of ids) {
		const b = get(bounds, id)
		expect(b.x, id).toBeGreaterThanOrEqual(container.x + SUBPROCESS_PADDING)
		expect(b.y, id).toBeGreaterThanOrEqual(container.y + SUBPROCESS_PADDING)
		expect(b.x + b.width, id).toBeLessThanOrEqual(
			container.x + container.width - SUBPROCESS_PADDING,
		)
		expect(b.y + b.height, id).toBeLessThanOrEqual(
			container.y + container.height - SUBPROCESS_PADDING,
		)
	}
	for (let i = 0; i < ids.length; i++) {
		for (let j = i + 1; j < ids.length; j++) {
			const [a, b] = [ids[i] as string, ids[j] as string]
			expect(overlaps(get(bounds, a), get(bounds, b)), `${a} overlaps ${b}`).toBe(false)
		}
	}
}

describe("unconnected children of an expanded sub-process (#221)", () => {
	beforeEach(() => resetIdCounter())

	it("packs four unconnected tools into a landscape 2x2 grid", () => {
		const ids = ["A", "B", "C", "D"]
		const bounds = boundsOf(layoutAdHoc(tools(ids)))
		const container = get(bounds, "ah")
		expect(container.width).toBeGreaterThanOrEqual(container.height)

		const xs = new Set(ids.map((id) => get(bounds, id).x))
		const ys = new Set(ids.map((id) => get(bounds, id).y))
		expect(xs.size).toBe(2)
		expect(ys.size).toBe(2)
		// Declaration order reads row by row.
		expect(get(bounds, "A").y).toBe(get(bounds, "B").y)
		expect(get(bounds, "A").x).toBeLessThan(get(bounds, "B").x)
		expect(get(bounds, "C").y).toBeGreaterThan(get(bounds, "A").y)
		expectInsideAndApart(bounds, ids)
	})

	it("packs nine unconnected tools into a 3x3 grid", () => {
		const ids = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
		const bounds = boundsOf(layoutAdHoc(tools(ids)))
		expect(new Set(ids.map((id) => get(bounds, id).x)).size).toBe(3)
		expect(new Set(ids.map((id) => get(bounds, id).y)).size).toBe(3)
		expectInsideAndApart(bounds, ids)
	})

	it("keeps a connected sub-flow left to right next to the grid", () => {
		const bounds = boundsOf(
			layoutAdHoc((c) => {
				c.serviceTask("A", { name: "A", taskType: "x" })
				c.serviceTask("B", { name: "B", taskType: "x" })
				c.serviceTask("C", { name: "C", taskType: "x" })
				c.serviceTask("first", { name: "first", taskType: "x" })
					.connectTo("second")
					.serviceTask("second", { name: "second", taskType: "x" })
			}),
		)
		expect(get(bounds, "first").y).toBe(get(bounds, "second").y)
		expect(get(bounds, "first").x).toBeLessThan(get(bounds, "second").x)
		expectInsideAndApart(bounds, ["A", "B", "C", "first", "second"])
	})

	it("sizes grid columns for the labels of events and gateways", () => {
		// 22-character names: each label (154 px) is wider than the 150 px shape pitch.
		const ids = ["G1", "G2", "G3", "G4"]
		const defs = layoutAdHoc((c) => {
			for (const id of ids) c.exclusiveGateway(id, { name: `Route the ${id} request..` })
		})
		const plane = defs.diagrams[0]?.plane
		const labels = ids.map((id) => {
			const lb = plane?.shapes.find((s) => s.bpmnElement === id)?.label?.bounds
			expect(lb, id).toBeDefined()
			return lb as Bounds
		})
		expect(new Set(ids.map((id) => get(boundsOf(defs), id).x)).size).toBe(2)
		for (let i = 0; i < labels.length; i++) {
			for (let j = i + 1; j < labels.length; j++) {
				expect(overlaps(labels[i] as Bounds, labels[j] as Bounds), `${ids[i]}/${ids[j]}`).toBe(
					false,
				)
			}
		}
		expectInsideAndApart(boundsOf(defs), ids)
	})

	it("does not pack a node that loops on itself", () => {
		const bounds = boundsOf(
			layoutAdHoc((c) => {
				c.serviceTask("A", { name: "A", taskType: "x" }).connectTo("A")
				c.serviceTask("B", { name: "B", taskType: "x" }).connectTo("B")
			}),
		)
		// Each self-loop is a flow of its own: they stack, one row each, as before.
		expect(get(bounds, "A").x).toBe(get(bounds, "B").x)
		expect(get(bounds, "B").y).toBeGreaterThan(get(bounds, "A").y)
	})

	it("leaves the plane of a collapsed sub-process unpacked", () => {
		const defs = layoutAdHoc(tools(["A", "B", "C", "D"]))
		const process = defs.processes[0]
		expect(process).toBeDefined()
		if (!process) return
		const plane = layoutProcess(process, "semantic", new Set(["ah"])).planes?.find(
			(p) => p.elementId === "ah",
		)
		expect(plane).toBeDefined()
		const xs = new Set(plane?.result.nodes.map((n) => n.bounds.x))
		expect(xs.size).toBe(1)
	})

	it("leaves a single unconnected child and process-level layout as they were", () => {
		const one = boundsOf(layoutAdHoc(tools(["A"])))
		const container = get(one, "ah")
		expect(container.width).toBe(100 + 2 * SUBPROCESS_PADDING)
		expect(container.height).toBe(80 + 2 * SUBPROCESS_PADDING)

		// Two disconnected paths at process level still stack, one row each.
		const defs = Bpmn.createProcess("p")
			.startEvent("s1")
			.endEvent("e1")
			.addStartEvent("s2")
			.endEvent("e2")
			.withAutoLayout()
			.build()
		const top = boundsOf(defs)
		expect(get(top, "s2").x).toBe(get(top, "s1").x)
		expect(get(top, "s2").y).toBeGreaterThan(get(top, "s1").y)
	})
})
