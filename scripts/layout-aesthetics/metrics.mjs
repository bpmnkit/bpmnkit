/**
 * Deterministic aesthetic metrics for a laid-out BPMN diagram — the softer
 * qualities a human (or a vision judge) notices once overlaps and crossings are
 * already fine: a straight happy path, few bends, even spacing, clear labels,
 * a compact, not-too-wide canvas.
 */

const CONTAINERS = new Set([
	"participant",
	"lane",
	"subProcess",
	"adHocSubProcess",
	"eventSubProcess",
	"transaction",
])

function index(defs) {
	const elements = new Map()
	const flows = new Map()
	const walk = (els, seqs) => {
		for (const el of els) {
			elements.set(el.id, el)
			if (el.flowElements) walk(el.flowElements, el.sequenceFlows ?? [])
		}
		for (const f of seqs) flows.set(f.id, f)
	}
	for (const p of defs.processes) {
		walk(p.flowElements, p.sequenceFlows)
		for (const lane of p.laneSet?.lanes ?? []) elements.set(lane.id, { id: lane.id, type: "lane" })
	}
	for (const c of defs.collaborations) {
		for (const p of c.participants) elements.set(p.id, { id: p.id, type: "participant" })
		for (const m of c.messageFlows) flows.set(m.id, { ...m, message: true })
	}
	return { elements, flows }
}

const isContainer = (el, shape) =>
	CONTAINERS.has(el?.type) && (el.type === "participant" || el.type === "lane" || shape.isExpanded)

function overlaps(a, b, tol = 1) {
	return (
		a.x + tol < b.x + b.width &&
		b.x + tol < a.x + a.width &&
		a.y + tol < b.y + b.height &&
		b.y + tol < a.y + a.height
	)
}

/** Does the axis-parallel segment p→q pass through the interior of rect r (shrunk by tol)? */
function segHits(p, q, r, tol = 2) {
	const x1 = Math.min(p.x, q.x)
	const x2 = Math.max(p.x, q.x)
	const y1 = Math.min(p.y, q.y)
	const y2 = Math.max(p.y, q.y)
	return x2 > r.x + tol && x1 < r.x + r.width - tol && y2 > r.y + tol && y1 < r.y + r.height - tol
}

function segCross(a, b, c, d) {
	const h1 = Math.abs(a.y - b.y) < 0.5
	const h2 = Math.abs(c.y - d.y) < 0.5
	if (h1 === h2) return false
	const [h, v] = h1
		? [
				[a, b],
				[c, d],
			]
		: [
				[c, d],
				[a, b],
			]
	const hx1 = Math.min(h[0].x, h[1].x)
	const hx2 = Math.max(h[0].x, h[1].x)
	const vy1 = Math.min(v[0].y, v[1].y)
	const vy2 = Math.max(v[0].y, v[1].y)
	const x = v[0].x
	const y = h[0].y
	return x > hx1 + 1 && x < hx2 - 1 && y > vy1 + 1 && y < vy2 - 1
}

const segments = (wps) => wps.slice(1).map((q, i) => [wps[i], q])
const pathLength = (wps) =>
	segments(wps).reduce((s, [p, q]) => s + Math.abs(q.x - p.x) + Math.abs(q.y - p.y), 0)
const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const std = (xs) => {
	const m = mean(xs)
	return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

/** First-declared, forward-only path from each top-level start event: what a reader takes as the happy path. */
function happyPaths(defs) {
	const paths = []
	for (const p of defs.processes) {
		const out = new Map()
		for (const f of p.sequenceFlows)
			(out.get(f.sourceRef) ?? out.set(f.sourceRef, []).get(f.sourceRef)).push(f)
		for (const start of p.flowElements.filter((e) => e.type === "startEvent")) {
			const seen = new Set([start.id])
			const flows = []
			let cur = start.id
			for (;;) {
				const next = (out.get(cur) ?? []).find((f) => !seen.has(f.targetRef))
				if (!next) break
				flows.push(next)
				seen.add(next.targetRef)
				cur = next.targetRef
			}
			paths.push({ nodes: [...seen], flows })
		}
	}
	return paths
}

export function measure(defs) {
	const { elements, flows } = index(defs)
	const plane = defs.diagrams[0]?.plane
	const shapes = plane?.shapes ?? []
	const edges = plane?.edges ?? []
	const shapeOf = new Map(shapes.map((s) => [s.bpmnElement, s]))

	let minX = Number.POSITIVE_INFINITY
	let minY = Number.POSITIVE_INFINITY
	let maxX = Number.NEGATIVE_INFINITY
	let maxY = Number.NEGATIVE_INFINITY
	const grow = (b) => {
		minX = Math.min(minX, b.x)
		minY = Math.min(minY, b.y)
		maxX = Math.max(maxX, b.x + b.width)
		maxY = Math.max(maxY, b.y + b.height)
	}
	for (const s of shapes) {
		grow(s.bounds)
		if (s.label?.bounds) grow(s.label.bounds)
	}
	for (const e of edges) for (const w of e.waypoints) grow({ x: w.x, y: w.y, width: 0, height: 0 })
	const width = maxX - minX
	const height = maxY - minY

	const solid = shapes.filter((s) => !isContainer(elements.get(s.bpmnElement), s))
	const inkArea = solid.reduce((a, s) => a + s.bounds.width * s.bounds.height, 0)

	// ── edges ──
	const seq = edges.filter((e) => flows.has(e.bpmnElement))
	const bends = seq.map((e) => Math.max(0, e.waypoints.length - 2))
	const lengths = seq
		.filter((e) => !flows.get(e.bpmnElement).message)
		.map((e) => pathLength(e.waypoints))
	const detours = seq.map((e) => {
		const a = e.waypoints[0]
		const b = e.waypoints[e.waypoints.length - 1]
		const direct = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
		return direct > 0 ? pathLength(e.waypoints) / direct : 1
	})

	// Horizontal gaps between flow-connected neighbours on one line.
	const gaps = []
	for (const e of seq) {
		const f = flows.get(e.bpmnElement)
		if (f.message) continue
		const s = shapeOf.get(f.sourceRef)?.bounds
		const t = shapeOf.get(f.targetRef)?.bounds
		if (!s || !t) continue
		if (Math.abs(centre(s).y - centre(t).y) < 1 && t.x > s.x + s.width)
			gaps.push(t.x - s.x - s.width)
	}

	// ── happy path ──
	let happyFlows = 0
	let happyStraight = 0
	const axisDevs = []
	for (const path of happyPaths(defs)) {
		const ys = path.nodes
			.map((id) => shapeOf.get(id))
			.filter(Boolean)
			.map((s) => centre(s.bounds).y)
		if (ys.length) axisDevs.push(std(ys))
		for (const f of path.flows) {
			const e = edges.find((x) => x.bpmnElement === f.id)
			if (!e) continue
			happyFlows++
			if (e.waypoints.every((w) => Math.abs(w.y - e.waypoints[0].y) < 1)) happyStraight++
		}
	}

	// ── crossings, edges through shapes ──
	let crossings = 0
	for (let i = 0; i < seq.length; i++) {
		for (let j = i + 1; j < seq.length; j++) {
			for (const [a, b] of segments(seq[i].waypoints))
				for (const [c, d] of segments(seq[j].waypoints)) if (segCross(a, b, c, d)) crossings++
		}
	}
	let throughShapes = 0
	for (const e of seq) {
		const f = flows.get(e.bpmnElement)
		const ends = new Set([f.sourceRef, f.targetRef])
		const host = elements.get(f.sourceRef)?.attachedToRef
		if (host) ends.add(host)
		for (const s of solid) {
			if (ends.has(s.bpmnElement)) continue
			if (elements.get(s.bpmnElement)?.type === "boundaryEvent") continue
			if (segments(e.waypoints).some(([p, q]) => segHits(p, q, s.bounds))) throughShapes++
		}
	}
	let shapeOverlaps = 0
	for (let i = 0; i < solid.length; i++) {
		for (let j = i + 1; j < solid.length; j++) {
			const a = elements.get(solid[i].bpmnElement)
			const b = elements.get(solid[j].bpmnElement)
			if (a?.attachedToRef === b?.id || b?.attachedToRef === a?.id) continue
			if (overlaps(solid[i].bounds, solid[j].bounds)) shapeOverlaps++
		}
	}

	// ── labels ──
	const labels = []
	for (const s of shapes) {
		const el = elements.get(s.bpmnElement)
		if (s.label?.bounds && el?.name)
			labels.push({ owner: s.bpmnElement, b: s.label.bounds, text: el.name })
	}
	for (const e of edges) {
		const f = flows.get(e.bpmnElement)
		if (e.label?.bounds && f?.name)
			labels.push({ owner: e.bpmnElement, b: e.label.bounds, text: f.name, edge: true })
	}
	let labelCollisions = 0
	let labelOnEdge = 0
	// The SVG renderer wraps a label that does not fit its box; a short name broken in two reads badly.
	let wrappedLabels = 0
	const unlabelled = [...edges.filter((e) => flows.get(e.bpmnElement)?.name && !e.label?.bounds)]
		.length
	for (const [i, l] of labels.entries()) {
		let hit = false
		for (const e of edges) {
			if (e.bpmnElement === l.owner) continue
			if (segments(e.waypoints).some(([p, q]) => segHits(p, q, l.b, 1))) {
				hit = true
				labelOnEdge++
				break
			}
		}
		if (!hit) {
			for (const s of solid) {
				if (s.bpmnElement === l.owner) continue
				if (overlaps(s.bounds, l.b, 1)) {
					hit = true
					break
				}
			}
		}
		if (!hit) hit = labels.some((m, j) => j !== i && overlaps(m.b, l.b, 1))
		if (hit) labelCollisions++
		if (!l.text.includes(" ") ? false : l.text.length * 6.5 > l.b.width - 4 && l.text.length <= 16)
			wrappedLabels++
	}

	return {
		width: Math.round(width),
		height: Math.round(height),
		aspect: +(width / Math.max(1, height)).toFixed(2),
		density: +(inkArea / Math.max(1, width * height)).toFixed(3),
		meanGap: Math.round(mean(gaps)),
		bendsPerEdge: +mean(bends).toFixed(2),
		edgeLenCV: +(std(lengths) / Math.max(1, mean(lengths))).toFixed(2),
		detour: +mean(detours).toFixed(2),
		happyStraight: happyFlows ? +(happyStraight / happyFlows).toFixed(2) : 1,
		happyAxisDev: Math.round(mean(axisDevs)),
		crossings,
		throughShapes,
		shapeOverlaps,
		labelCollisions,
		labelOnEdge,
		wrappedLabels,
		unlabelled,
	}
}

/** Lower is better unless listed here. */
export const HIGHER_IS_BETTER = new Set(["density", "happyStraight"])
