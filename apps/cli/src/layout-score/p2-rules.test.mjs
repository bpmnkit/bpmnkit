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

// P2: exception row — a handler starts in its host's column, straight below the
// event, and all handlers share one row; a second boundary fans out to the right.
it("drops each boundary handler straight down into one shared row", async () => {
	const { defs, shape, plane, metrics } = await lay("p2-bike-repair")
	expect(metrics.shapeOverlaps).toBe(0)
	const centreY = (b) => b.y + b.height / 2
	const flows = defs.processes.flatMap((p) => p.sequenceFlows)
	const edgeFrom = (id) => {
		const flow = flows.find((f) => f.sourceRef === id)
		return plane.edges.find((e) => e.bpmnElement === flow?.id)
	}
	const inspect = shape("inspectBike")
	const repair = shape("repairBike")
	const notify = shape("notifyOwner")
	const refused = shape("repairRefused")
	const delay = shape("delayLogged")
	expect(Math.abs(centreX(notify) - centreX(inspect))).toBeLessThan(1)
	expect(Math.abs(centreX(refused) - centreX(repair))).toBeLessThan(1)
	for (const id of ["inspectionOverdue", "frameCracked"]) {
		const e = edgeFrom(id)
		expect(e, id).toBeTruthy()
		expect(e.waypoints.length, id).toBe(2)
	}
	expect(notify.y).toBeGreaterThan(inspect.y + inspect.height)
	expect(Math.abs(centreY(refused) - centreY(notify))).toBeLessThan(1)
	expect(Math.abs(centreY(delay) - centreY(notify))).toBeLessThan(1)
	expect(centreX(delay)).toBeGreaterThan(centreX(refused))
})

// P2: shared columns — a branch that only detours into its sibling target is
// stacked under it in one column, not shifted a layer right.
it("stacks a detour branch under the sibling target it feeds", async () => {
	const { defs, shape, plane, metrics } = await lay("p2-paint-order")
	// The text compiler merges the two ways into Mix paint with a join gateway.
	const flow = defs.processes[0].sequenceFlows.find((f) => f.sourceRef === "orderPigment")
	const into = shape(flow.targetRef)
	const pigment = shape("orderPigment")
	const mix = shape("mixPaint")
	expect(Math.abs(centreX(pigment) - centreX(into))).toBeLessThan(1)
	expect(pigment.y).toBeGreaterThan(into.y + into.height)
	// Mix paint follows the split directly, one column after the join.
	expect(mix.x - (into.x + into.width)).toBeLessThan(100)
	const edge = plane.edges.find((e) => e.bpmnElement === flow.id)
	expect(edge.waypoints.length).toBe(2)
	expect(metrics.shapeOverlaps).toBe(0)
	expect(metrics.seqCrossings).toBe(0)
})

// P2: gateway ports — a split is left vertically at its centre-x, then the flow
// turns horizontal; a join is reached horizontally, then the flow turns into it.
it("routes split and join branches with one bend each, through the gateways' top and bottom", async () => {
	const { defs, shape, plane } = await lay("p2-kiln-firing")
	const flows = defs.processes[0].sequenceFlows
	const route = (f) => plane.edges.find((e) => e.bpmnElement === f.id).waypoints
	const split = shape("prepareFiring")
	const join = shape("readyToFire")
	for (const f of flows.filter((f) => f.sourceRef === "prepareFiring")) {
		const w = route(f)
		expect(w.length - 2, f.id).toBeLessThanOrEqual(1)
		if (w.length === 3) expect(w[0].x, f.id).toBeCloseTo(centreX(split), 0)
	}
	for (const f of flows.filter((f) => f.targetRef === "readyToFire")) {
		const w = route(f)
		expect(w.length - 2, f.id).toBeLessThanOrEqual(1)
		if (w.length === 3) {
			expect(w[2].x, f.id).toBeCloseTo(centreX(join), 0)
			expect(w[0].y, f.id).toBe(w[1].y)
		}
	}
})

// P2: tight loops — a back edge runs just below its own row, inside the band
// between its endpoints and the row below, and enters the merge from below.
it("keeps a loop tight under its row and enters the merge gateway from below", async () => {
	const { defs, shape, plane, metrics } = await lay("p2-bread-proofing")
	const loop = defs.processes[0].sequenceFlows.find(
		(f) => f.sourceRef === "risenEnough" && f.targetRef === "kneadDough_join",
	)
	const w = plane.edges.find((e) => e.bpmnElement === loop.id).waypoints
	const merge = shape("kneadDough_join")
	const rise = shape("letDoughRise")
	const lowest = Math.max(...w.map((p) => p.y))
	expect(w.length - 2).toBeLessThanOrEqual(2)
	expect(lowest).toBeGreaterThan(rise.y + rise.height)
	expect(lowest).toBeLessThan(shape("discardLoaf").y)
	const last = w[w.length - 1]
	expect(last.x).toBeCloseTo(centreX(merge), 0)
	expect(last.y).toBeCloseTo(merge.y + merge.height, 0)
	expect(metrics.seqCrossings).toBe(0)
})

// P2: grid phase inside pools — one x shift for every pool's content keeps
// columns (and vertical message flows) aligned while origins land on the grid.
it("puts pooled content on the 10 px grid without moving any pool frame", async () => {
	const { shape, metrics } = await lay("p2-collab-tailor")
	expect(metrics.gridPct).toBeGreaterThanOrEqual(40)
	expect(metrics.poolWidthSD).toBe(0)
	expect(metrics.maxBendsMsg).toBeLessThanOrEqual(2)
	expect(metrics.labelOnEdge).toBe(0)
	for (const id of ["Pool_customer", "Pool_tailor"]) expect(shape(id).x % 10).toBe(0)
})

// P2c: a boundary handler that loops back to an earlier merge is a rework
// loop, not an exception path: no exception row, no extra height, straight spine.
it("keeps rework-loop boundary handlers out of the exception row", async () => {
	for (const [name, maxHeight, maxAxisDev] of [
		["p2-timesheet-approval", 266, 57],
		["p2-recipe-rework", 266, 62],
		["p2-lab-retest", 266, 65],
	]) {
		const { metrics } = await lay(name)
		expect(metrics.height, name).toBeLessThanOrEqual(maxHeight)
		expect(metrics.happyAxisDev, name).toBeLessThanOrEqual(maxAxisDev)
		expect(metrics.seqCrossings, name).toBe(0)
	}
})

// P2d: when a sibling branch blocks one spine handler's column, the others keep
// the step too; a split row stretched edges (edgeLenCV 0.66 → 0.71). A gateway's
// branch that would drop through the handlers' row goes above the spine instead
// (room-deposit, visa-hold): every handler drops straight, nothing crosses.
it("keeps spine handlers together when a sibling branch blocks one", async () => {
	for (const [name, maxCv, maxHeight, maxWidth, maxCrossings] of [
		["p2-room-deposit", 0.66, 400, 856, 0],
		["p2-visa-hold", 0.57, 400, 696, 0],
		["p2-pallet-reserve", 0.69, 481, 872, 1],
	]) {
		const { metrics } = await lay(name)
		expect(metrics.edgeLenCV, name).toBeLessThanOrEqual(maxCv)
		expect(metrics.height, name).toBeLessThanOrEqual(maxHeight)
		expect(metrics.width, name).toBeLessThanOrEqual(maxWidth)
		expect(metrics.seqCrossings, name).toBeLessThanOrEqual(maxCrossings)
	}
})
