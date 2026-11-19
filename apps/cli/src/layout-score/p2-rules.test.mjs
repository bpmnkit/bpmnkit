import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import { measure } from "../../../../scripts/layout-aesthetics/metrics.mjs"
import { layoutCase } from "../../../../scripts/layout-aesthetics/score-lib.mjs"
import { compileTextSpec, keyThrownMessages } from "../commands/build-spec.js"
import { dropRewiredEdges } from "../commands/build.js"

const deps = { compileTextSpec, keyThrownMessages, dropRewiredEdges }
async function lay(name) {
	const file = fileURLToPath(
		new URL(`../../../../fixtures/layout-corpus/${name}.txt`, import.meta.url),
	)
	const defs = await layoutCase({ name, kind: "text", file }, deps)
	const plane = defs.diagrams[0].plane
	const shape = (id) => plane.shapes.find((s) => s.bpmnElement === id)?.bounds
	return { defs, plane, shape, metrics: measure(defs) }
}
const centreX = (b) => b.x + b.width / 2

// P2: artifacts under their task, with a vertical association.
it("slots artifacts on their task's centre line, one below and one above", async () => {
	const { shape } = await lay("p2-seed-order")
	const task = shape("pickSeedPackets")
	const first = shape("packingList")
	const second = shape("seedStock")
	expect(task && first && second).toBeTruthy()
	for (const b of [first, second]) expect(Math.abs(centreX(b) - centreX(task))).toBeLessThan(1)
	expect(first.y).toBeGreaterThan(task.y + task.height)
	expect(first.y - (task.y + task.height)).toBeLessThanOrEqual(60)
	expect(second.y + second.height).toBeLessThan(task.y)
})

it("keeps the composition compact: artifacts add no extra band at the bottom", async () => {
	const { metrics } = await lay("p2-seed-order")
	// Stacked in a loose column the diagram was ~500 px tall.
	expect(metrics.height).toBeLessThan(330)
	expect(metrics.shapeOverlaps).toBe(0)
})

// P2: grid snapping — a pure translation puts more origins on the 10 px grid.
it("puts at least a fifth of the origins on the 10 px grid", async () => {
	for (const name of ["p2-parcel-dispatch", "p2-seed-order"]) {
		const { metrics } = await lay(name)
		expect(metrics.gridPct, name).toBeGreaterThanOrEqual(20)
	}
})

// P2: gateway label — never cut by an outgoing branch.
it("keeps the gateway label clear of every flow", async () => {
	const { metrics, plane } = await lay("p2-parcel-dispatch")
	expect(metrics.labelCollisions).toBe(0)
	expect(metrics.labelOnEdge).toBe(0)
	expect(plane.shapes.length).toBeGreaterThan(5)
})
