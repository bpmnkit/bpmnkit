// Dumps TS routeFlows inputs/outputs (every scope semanticLayout routes) and
// semanticLayoutProcess results for the Rust oracle tests.
// Regenerate (the jitter seed runs across the list, so keep its order):
//   node dump.mjs layout-kyc-risk-classification layout-kyc-onboarding sample-order-process \
//     events-and-containers miwg-c-2-0 > cases.json
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const DIST = "/home/user/bpmnkit/packages/core/dist"
const CONF = "/home/user/bpmnkit/conformance/bpmn"
// A copy of semantic/index.js whose routeFlows records its calls.
let src = readFileSync(`${DIST}/layout/semantic/index.js`, "utf8")
src = src
	.replace('"../grid/edge-labels.js"', `"${DIST}/layout/grid/edge-labels.js"`)
	.replace('"../types.js"', `"${DIST}/layout/types.js"`)
	.replace('"./bands.js"', `"${DIST}/layout/semantic/bands.js"`)
	.replace('"./graph.js"', `"${DIST}/layout/semantic/graph.js"`)
	.replace('"./place.js"', `"${DIST}/layout/semantic/place.js"`)
	.replace(
		'import { routeFlows } from "./route.js";',
		`import { routeFlows as realRouteFlows } from "${DIST}/layout/semantic/route.js";
const routeFlows = (...args) => { const out = realRouteFlows(...args); globalThis.__routeCalls.push(globalThis.__snapshot(args, out)); globalThis.__jitter(args, realRouteFlows); return out; };`,
	)
const dir = mkdtempSync(join(tmpdir(), "semdump-"))
writeFileSync(join(dir, "index.mjs"), src)
const { semanticLayoutProcess } = await import(join(dir, "index.mjs"))
const { parseBpmn } = await import(`${DIST}/bpmn/bpmn-parser.js`)

const entries = (m) => [...m.entries()]
const graphJson = (g) => ({
	nodes: g.nodes.map((n) => n.id),
	byId: [...g.byId.keys()],
	outgoing: entries(g.outgoing).map(([k, v]) => [k, v.map((f) => f.id)]),
	incoming: entries(g.incoming).map(([k, v]) => [k, v.map((f) => f.id)]),
	attachers: entries(g.attachers).map(([k, v]) => [k, v.map((e) => e.id)]),
	backEdges: [...g.backEdges],
	components: g.components,
	starts: g.starts,
	ranks: entries(g.ranks),
})
// Taken inside the call: semanticLayout shifts child edges and places labels afterwards.
globalThis.__snapshot = ([graph, flows, bounds, bandLayout, gutterX], edges) =>
	JSON.parse(
		JSON.stringify({
			graph: graphJson(graph),
			flows: flows.map((f) => f.id),
			bounds: entries(bounds),
			bandLayout: {
				bands: entries(bandLayout.bands),
				spine: [...bandLayout.spine],
				straightFlows: [...bandLayout.straightFlows],
			},
			gutterX: entries(gutterX),
			edges,
		}),
	)
// Extra cases: the same scope with every shape nudged by a seeded offset, so
// shapes overlap routes and the detour / obstacle-search fallbacks run too.
let seed = 1
const rand = () => {
	seed = (seed * 16807) % 2147483647
	return seed / 2147483647
}
globalThis.__jitter = ([graph, flows, bounds, bandLayout, gutterX], realRouteFlows) => {
	if (bounds.size < 4) return
	for (const scale of [40, 120]) {
		const moved = new Map(
			[...bounds].map(([id, b]) => [
				id,
				{
					...b,
					x: b.x + Math.round((rand() - 0.5) * scale),
					y: b.y + Math.round((rand() - 0.5) * scale),
				},
			]),
		)
		const edges = realRouteFlows(graph, flows, moved, bandLayout, gutterX)
		globalThis.__routeCalls.push(
			globalThis.__snapshot([graph, flows, moved, bandLayout, gutterX], edges),
		)
	}
}
const out = []
for (const name of process.argv.slice(2)) {
	const defs = parseBpmn(readFileSync(`${CONF}/${name}/input.bpmn`, "utf8"))
	for (const proc of defs.processes) {
		globalThis.__routeCalls = []
		const result = semanticLayoutProcess(proc)
		out.push({ name, process: proc.id, routes: globalThis.__routeCalls, result })
	}
}
console.log(JSON.stringify(out))
