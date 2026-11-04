/**
 * Closeness scorer: how near a candidate BPMN file is to a reference ("blueprint") file.
 * Modelled on the external bake-off scorer (`scorer/closeness.py`, see
 * `doc/agent-bpmn-bakeoff-analysis.md` and `doc/agent-bpmn-bakeoff-rerun.md`). This comment is the
 * published definition; the docs pin the four parts and the layout scale, the rest are choices.
 *
 * Requires a core build: `pnpm --filter @bpmnkit/core build`.
 *
 * `scoreCloseness(candidateXml, referenceXml, { layout = true })` returns
 * `{ total, parts: { structure, configuration, annotations, layout }, details }`.
 * Each part is `{ score, max }`; `total` is 0–100, rounded to one decimal.
 *
 * Weights (max points): structure 25, configuration 45, annotations 15, layout 15.
 * (The reruns report 25/45/10/7.7 with layout "of 15"; the annotation max is not stated, so 15 is a
 * choice that makes the maxima sum to 100.)
 * With `layout: false` the layout max is 0 and `total` is rescaled to 100 over the other parts.
 *
 * Matching
 *  - Elements (every flow node, at any nesting depth, plus processes): by id when both sides have
 *    the id and the same type; remaining ones by type + non-empty name, in document order, once each.
 *  - Sequence flows: matched when their source and target both map to the matched counterparts.
 *    Among several flows between the same pair, the first unmatched one with the same name wins.
 *
 * Structure (25): items are the reference's elements, flows and processes, scored 1 when matched
 * with the same name, 0.5 when matched with a different name (flows and processes included), 0 when
 * missing. Score = 25 × Σ item scores ÷ max(reference items, candidate items), so extra candidate
 * items cost points too.
 *
 * Configuration (45): "facts" are read from Zeebe extensions of matched elements: every attribute
 * of every zeebe:* extension (taskDefinition type/retries, formDefinition, calledElement, …), each
 * ioMapping input and output as `target → source`, each task header as `key → value`, the
 * `zeebe:modelerTemplate*` stamps, plus a matched flow's condition expression. Score =
 * 45 × facts present in both with the same value ÷ (that, plus facts differing or only on one side
 * of matched elements, plus all facts of unmatched elements on either side). No facts at all = 45.
 *
 * Annotations (15): a reference text annotation scores 1 when the candidate has an annotation with
 * the same whitespace-normalised text, 0.5 when an unused candidate annotation is attached to the
 * same matched element, else 0. Score = 15 × Σ ÷ max(reference count, candidate count); none on
 * either side = 15.
 *
 * Layout (15): the mean distance between the centres of matched shapes. A reference shape whose
 * element is unmatched or has no candidate shape counts as the cap of 400 px; each distance is
 * capped at 400 px. Points = 15 × (1 − mean ÷ 400). (Calibrated: 193.6 px → 7.7, as in the rerun.)
 *
 * `options.match` selects how elements are paired: "id" (default, everything above) or "structure".
 * Free-form AI runs pick their own ids, names and job types, so id/name matching scores them at the
 * floor (~15, the annotations points) even when the model is right; structure mode measures the
 * modelling instead. `details.match` reports the mode. Differences from the above in "structure":
 *
 * Matching: ids and names are not used to pair (names enter the pair cost at weight 0.2, a tie-breaker). Per element:
 *  - kind = element type plus its first event-definition type (`boundaryEvent:timer`);
 *  - rank = longest-path depth from the start events, normalised to 0–1 by the process's deepest
 *    node. Back edges found by a DFS from the start events are ignored, so loops are safe; a
 *    boundary event ranks one below its host; in/out-degree count sequence flows only.
 *  - pair cost = 0 same kind / 0.5 same family (all task subtypes, all gateway types) / not matchable
 *    otherwise, + |rank difference| + 0.1 × (in-degree diff + out-degree diff) + 0.2 × (1 − Jaccard
 *    similarity of lowercase name words; both empty counts as similar).
 *  - greedy: all pairs sorted by cost, ties by (reference id, candidate id); a pair is taken when
 *    both sides are free and cost ≤ 1.0. Processes pair by order of appearance; elements are first
 *    matched inside each process pair, then the leftovers across all processes. Flows follow their
 *    matched endpoints (as in id mode).
 *  Structure points: a matched element or flow scores 1 whatever its name (naming is not modelling).
 *
 * Configuration compares which KINDS of configuration a matched pair carries, not values: each
 * zeebe:* extension element present (`zeebe:taskDefinition`, `zeebe:ioMapping`, `zeebe:formDefinition`,
 * `zeebe:calledElement`, `zeebe:calledDecision`, …) is one fact, the zeebe:modelerTemplate* stamps are
 * one fact `modelerTemplate`, and a flow with a condition expression has the fact `condition`
 * (presence only: free-form runs word conditions differently). Scoring is as in id mode.
 *
 * Layout: each diagram's node-shape bounding box is normalised to the unit square (a zero width or
 * height maps to 0.5), then the mean distance between matched centres is taken; a reference node
 * without a candidate shape counts as the cap, which is 0.5 × the unit diagonal (≈ 0.707). Same
 * formula: 15 × (1 − mean ÷ cap).
 *
 * Annotations: same rule in both modes. With none on either side the part is the full 15 (in id
 * mode that is also where the 15-point floor of a fully renamed model comes from; it is not a bug).
 */
import { Bpmn } from "../../packages/core/dist/index.js"

const MAX = { structure: 25, configuration: 45, annotations: 15, layout: 15 }
const LAYOUT_CAP = 400

const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim()

function collect(container, out, parentId, proc = parentId) {
	for (const el of container.flowElements ?? []) {
		out.nodes.push(el)
		out.parent.set(el, parentId)
		out.proc.set(el, proc)
		if (el.flowElements) collect(el, out, el.id, proc)
	}
	for (const f of container.sequenceFlows ?? []) {
		out.flows.push(f)
		out.proc.set(f, proc)
	}
	for (const a of container.textAnnotations ?? []) out.annotations.push(a)
	for (const a of container.associations ?? []) out.associations.push(a)
}

function read(xml) {
	const defs = Bpmn.parse(xml)
	const out = {
		nodes: [],
		flows: [],
		annotations: [],
		associations: [],
		parent: new Map(),
		proc: new Map(),
	}
	const processes = []
	for (const p of defs.processes) {
		const node = { ...p, type: "process" }
		out.nodes.push(node)
		processes.push(node)
		collect(p, out, p.id)
	}
	const centres = new Map()
	const bounds = new Map()
	for (const d of defs.diagrams ?? []) {
		for (const s of d.plane?.shapes ?? []) {
			const b = s.bounds
			if (b) {
				centres.set(s.bpmnElement, { x: b.x + b.width / 2, y: b.y + b.height / 2 })
				bounds.set(s.bpmnElement, b)
			}
		}
	}
	return { ...out, centres, bounds, processes }
}

function matchNodes(cand, ref) {
	const map = new Map() // reference node → candidate node
	const used = new Set()
	const byId = new Map(cand.nodes.map((n) => [n.id, n]))
	for (const r of ref.nodes) {
		const c = byId.get(r.id)
		if (c && c.type === r.type) {
			map.set(r, c)
			used.add(c)
		}
	}
	for (const r of ref.nodes) {
		if (map.has(r) || !norm(r.name)) continue
		const c = cand.nodes.find(
			(n) => !used.has(n) && n.type === r.type && norm(n.name) === norm(r.name),
		)
		if (c) {
			map.set(r, c)
			used.add(c)
		}
	}
	return { map, used }
}

const kindOf = (n) =>
	n.eventDefinitions?.[0]?.type ? `${n.type}:${n.eventDefinitions[0].type}` : n.type
const familyOf = (n) =>
	/(^task|Task)$/.test(n.type) ? "task" : n.type.endsWith("Gateway") ? "gateway" : null
const MATCH_THRESHOLD = 1.0

function tokens(name) {
	return new Set(
		norm(name)
			.toLowerCase()
			.split(/[^\p{L}\p{N}]+/u)
			.filter(Boolean),
	)
}

function nameSimilarity(a, b) {
	const x = tokens(a)
	const y = tokens(b)
	if (!x.size && !y.size) return 1
	let both = 0
	for (const t of x) if (y.has(t)) both++
	return both / (x.size + y.size - both)
}

/** Per node of one process: normalised longest-path rank, in- and out-degree. */
function describe(side, procId) {
	const nodes = side.nodes.filter((n) => n.type !== "process" && side.proc.get(n) === procId)
	const ids = new Set(nodes.map((n) => n.id))
	const flows = side.flows.filter((f) => side.proc.get(f) === procId)
	const out = new Map(nodes.map((n) => [n.id, []]))
	const info = new Map(nodes.map((n) => [n.id, { rank: 0, in: 0, out: 0 }]))
	for (const f of flows) {
		if (!ids.has(f.sourceRef) || !ids.has(f.targetRef)) continue
		out.get(f.sourceRef).push(f.targetRef)
		info.get(f.sourceRef).out++
		info.get(f.targetRef).in++
	}
	// A boundary event sits one step after its host for ranking only; it carries no flow in.
	for (const n of nodes)
		if (n.attachedToRef && ids.has(n.attachedToRef)) out.get(n.attachedToRef).push(n.id)
	const roots = [
		...nodes.filter((n) => n.type === "startEvent"),
		...nodes.filter((n) => n.type !== "startEvent" && !info.get(n.id).in && !n.attachedToRef),
		...nodes,
	]
	const state = new Map() // 1 = on the DFS stack, 2 = done
	const order = []
	const back = new Set()
	const visit = (id) => {
		state.set(id, 1)
		for (const t of out.get(id)) {
			if (state.get(t) === 1) back.add(`${id}>${t}`)
			else if (!state.has(t)) visit(t)
		}
		state.set(id, 2)
		order.push(id)
	}
	for (const r of roots) if (!state.has(r.id)) visit(r.id)
	for (const id of order.reverse()) {
		for (const t of out.get(id)) {
			if (back.has(`${id}>${t}`)) continue
			const r = info.get(t)
			r.rank = Math.max(r.rank, info.get(id).rank + 1)
		}
	}
	const deepest = Math.max(0, ...[...info.values()].map((i) => i.rank))
	for (const i of info.values()) i.rank = deepest ? i.rank / deepest : 0
	return info
}

function describeAll(side) {
	const info = new Map() // node → { rank, in, out }
	for (const p of side.processes) {
		for (const [id, i] of describe(side, p.id)) {
			const node = side.nodes.find((n) => n.id === id && side.proc.get(n) === p.id)
			if (node) info.set(node, i)
		}
	}
	return info
}

function matchByStructure(cand, ref) {
	const map = new Map()
	const used = new Set()
	const ri = describeAll(ref)
	const ci = describeAll(cand)
	const cost = (r, c) => {
		const family =
			kindOf(r) === kindOf(c) ? 0 : familyOf(r) && familyOf(r) === familyOf(c) ? 0.5 : null
		if (family === null) return null
		const a = ri.get(r)
		const b = ci.get(c)
		return (
			family +
			Math.abs(a.rank - b.rank) +
			0.1 * (Math.abs(a.in - b.in) + Math.abs(a.out - b.out)) +
			0.2 * (1 - nameSimilarity(r.name, c.name))
		)
	}
	const greedy = (rs, cs) => {
		const pairs = []
		for (const r of rs) {
			for (const c of cs) {
				const k = cost(r, c)
				if (k !== null && k <= MATCH_THRESHOLD) pairs.push({ r, c, k })
			}
		}
		pairs.sort((x, y) => x.k - y.k || cmp(x.r.id, y.r.id) || cmp(x.c.id, y.c.id))
		for (const { r, c } of pairs) {
			if (map.has(r) || used.has(c)) continue
			map.set(r, c)
			used.add(c)
		}
	}
	const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
	const elementsOf = (side, p) =>
		side.nodes.filter((n) => n.type !== "process" && side.proc.get(n) === p.id)
	// Processes pair by order of appearance.
	ref.processes.forEach((rp, i) => {
		const cp = cand.processes[i]
		if (!cp) return
		const rn = ref.nodes.find((n) => n.id === rp.id && n.type === "process")
		const cn = cand.nodes.find((n) => n.id === cp.id && n.type === "process")
		map.set(rn, cn)
		used.add(cn)
		greedy(elementsOf(ref, rp), elementsOf(cand, cp))
	})
	const free = (side, taken) => side.nodes.filter((n) => n.type !== "process" && !taken(n))
	greedy(
		free(ref, (n) => map.has(n)),
		free(cand, (n) => used.has(n)),
	)
	return { map, used }
}

function matchFlows(cand, ref, nodeMap) {
	const map = new Map()
	const used = new Set()
	const byId = (side) => new Map(side.nodes.map((n) => [n.id, n]))
	const refNodes = byId(ref)
	const candNodes = byId(cand)
	for (const r of ref.flows) {
		const s = nodeMap.get(refNodes.get(r.sourceRef))
		const t = nodeMap.get(refNodes.get(r.targetRef))
		if (!s || !t) continue
		const pool = cand.flows.filter(
			(f) => !used.has(f) && candNodes.get(f.sourceRef) === s && candNodes.get(f.targetRef) === t,
		)
		const c = pool.find((f) => norm(f.name) === norm(r.name)) ?? pool[0]
		if (c) {
			map.set(r, c)
			used.add(c)
		}
	}
	return { map, used }
}

function facts(el) {
	const out = new Map()
	for (const ext of el.extensionElements ?? []) {
		if (!ext.name?.startsWith("zeebe:")) continue
		if (ext.name === "zeebe:ioMapping" || ext.name === "zeebe:taskHeaders") {
			for (const c of ext.children ?? []) {
				const a = c.attributes ?? {}
				const key = ext.name === "zeebe:taskHeaders" ? `header:${a.key}` : `${c.name}:${a.target}`
				out.set(key, a.value ?? a.source ?? "")
			}
		} else {
			for (const [k, v] of Object.entries(ext.attributes ?? {})) out.set(`${ext.name}@${k}`, v)
		}
	}
	for (const [k, v] of Object.entries(el.unknownAttributes ?? {})) {
		if (k.startsWith("zeebe:modelerTemplate")) out.set(k, v)
	}
	if (el.conditionExpression) out.set("condition", norm(el.conditionExpression.text))
	return out
}

/** Structure mode: which kinds of configuration an element carries; values are ignored. */
function factKinds(el) {
	const out = new Map()
	for (const ext of el.extensionElements ?? []) {
		if (ext.name?.startsWith("zeebe:")) out.set(ext.name, "")
	}
	for (const k of Object.keys(el.unknownAttributes ?? {})) {
		if (k.startsWith("zeebe:modelerTemplate")) out.set("modelerTemplate", "")
	}
	if (el.conditionExpression) out.set("condition", "")
	return out
}

function compareFacts(a, b) {
	let same = 0
	let total = 0
	for (const [k, v] of a) {
		total++
		if (b.get(k) === v) same++
	}
	for (const k of b.keys()) if (!a.has(k)) total++
	return { same, total }
}

function structure(ref, cand, nodes, flows, byName) {
	let hit = 0
	for (const [r, c] of nodes.map) hit += !byName || norm(r.name) === norm(c.name) ? 1 : 0.5
	for (const [r, c] of flows.map) hit += !byName || norm(r.name) === norm(c.name) ? 1 : 0.5
	const refItems = ref.nodes.length + ref.flows.length
	const candItems = cand.nodes.length + cand.flows.length
	const denom = Math.max(refItems, candItems)
	return {
		score: denom ? (MAX.structure * hit) / denom : MAX.structure,
		missing: refItems - nodes.map.size - flows.map.size,
		extra: candItems - nodes.used.size - flows.used.size,
	}
}

function configuration(ref, cand, nodes, flows, factsOf) {
	let same = 0
	let total = 0
	const add = (a, b) => {
		const r = compareFacts(a, b)
		same += r.same
		total += r.total
	}
	for (const [r, c] of [...nodes.map, ...flows.map]) add(factsOf(r), factsOf(c))
	for (const r of [...ref.nodes, ...ref.flows]) {
		if (!nodes.map.has(r) && !flows.map.has(r)) add(factsOf(r), new Map())
	}
	for (const c of [...cand.nodes, ...cand.flows]) {
		if (!nodes.used.has(c) && !flows.used.has(c)) add(new Map(), factsOf(c))
	}
	return {
		score: total ? (MAX.configuration * same) / total : MAX.configuration,
		facts: total,
		matchingFacts: same,
	}
}

function annotations(ref, cand, nodes) {
	const target = (side, ann) =>
		side.associations.find((a) => a.targetRef === ann.id || a.sourceRef === ann.id)
	const nodeOf = (side, ann) => {
		const a = target(side, ann)
		const id = a && (a.targetRef === ann.id ? a.sourceRef : a.targetRef)
		return side.nodes.find((n) => n.id === id)
	}
	const refToCand = new Map([...nodes.map])
	const used = new Set()
	let hit = 0
	const pending = []
	for (const r of ref.annotations) {
		const c = cand.annotations.find((x) => !used.has(x) && norm(x.text) === norm(r.text))
		if (c) {
			used.add(c)
			hit += 1
		} else pending.push(r)
	}
	for (const r of pending) {
		const owner = refToCand.get(nodeOf(ref, r))
		const c = owner && cand.annotations.find((x) => !used.has(x) && nodeOf(cand, x) === owner)
		if (c) {
			used.add(c)
			hit += 0.5
		}
	}
	const denom = Math.max(ref.annotations.length, cand.annotations.length)
	return {
		score: denom ? (MAX.annotations * hit) / denom : MAX.annotations,
		referenceCount: ref.annotations.length,
		candidateCount: cand.annotations.length,
	}
}

function unitCentres(side) {
	const shapes = side.nodes.filter((n) => side.bounds.has(n.id))
	const bs = shapes.map((n) => side.bounds.get(n.id))
	const x0 = Math.min(...bs.map((b) => b.x))
	const y0 = Math.min(...bs.map((b) => b.y))
	const w = Math.max(...bs.map((b) => b.x + b.width)) - x0
	const h = Math.max(...bs.map((b) => b.y + b.height)) - y0
	const out = new Map()
	for (const n of shapes) {
		const c = side.centres.get(n.id)
		out.set(n.id, { x: w ? (c.x - x0) / w : 0.5, y: h ? (c.y - y0) / h : 0.5 })
	}
	return out
}

function layoutUnit(ref, cand, nodes) {
	const cap = Math.SQRT2 / 2
	const rc = unitCentres(ref)
	const cc = unitCentres(cand)
	let sum = 0
	let n = 0
	for (const r of ref.nodes) {
		const a = rc.get(r.id)
		if (!a) continue
		const c = nodes.map.get(r)
		const b = c && cc.get(c.id)
		sum += b ? Math.min(cap, Math.hypot(a.x - b.x, a.y - b.y)) : cap
		n++
	}
	const mean = n ? sum / n : 0
	return { score: MAX.layout * (1 - mean / cap), meanOffsetUnit: Math.round(mean * 1000) / 1000 }
}

function layout(ref, cand, nodes) {
	let sum = 0
	let n = 0
	for (const r of ref.nodes) {
		const rc = ref.centres.get(r.id)
		if (!rc) continue
		const c = nodes.map.get(r)
		const cc = c && cand.centres.get(c.id)
		sum += cc ? Math.min(LAYOUT_CAP, Math.hypot(rc.x - cc.x, rc.y - cc.y)) : LAYOUT_CAP
		n++
	}
	const mean = n ? sum / n : 0
	return { score: MAX.layout * (1 - mean / LAYOUT_CAP), meanOffsetPx: Math.round(mean * 10) / 10 }
}

const round1 = (x) => Math.round(x * 10) / 10

/**
 * @param {string} candidateXml
 * @param {string} referenceXml
 * @param {{ layout?: boolean, match?: "id" | "structure" }} [options]
 */
export function scoreCloseness(candidateXml, referenceXml, options = {}) {
	const cand = read(candidateXml)
	const ref = read(referenceXml)
	const mode = options.match ?? "id"
	if (mode !== "id" && mode !== "structure") throw new Error(`unknown match mode: ${mode}`)
	const byStructure = mode === "structure"
	const nodes = byStructure ? matchByStructure(cand, ref) : matchNodes(cand, ref)
	const flows = matchFlows(cand, ref, nodes.map)
	const s = structure(ref, cand, nodes, flows, !byStructure)
	const c = configuration(ref, cand, nodes, flows, byStructure ? factKinds : facts)
	const a = annotations(ref, cand, nodes)
	const withLayout = options.layout !== false
	const l = withLayout ? (byStructure ? layoutUnit : layout)(ref, cand, nodes) : { score: 0 }
	const parts = {
		structure: { score: round1(s.score), max: MAX.structure },
		configuration: { score: round1(c.score), max: MAX.configuration },
		annotations: { score: round1(a.score), max: MAX.annotations },
		layout: { score: round1(l.score), max: withLayout ? MAX.layout : 0 },
	}
	const sum = (k) => Object.values(parts).reduce((acc, p) => acc + p[k], 0)
	const unrounded = s.score + c.score + a.score + l.score
	const maxTotal = sum("max")
	return {
		total: round1((100 * unrounded) / maxTotal),
		parts,
		details: {
			match: mode,
			structure: { missing: s.missing, extra: s.extra },
			configuration: { facts: c.facts, matching: c.matchingFacts },
			annotations: { reference: a.referenceCount, candidate: a.candidateCount },
			layout: { meanOffsetPx: l.meanOffsetPx ?? null, meanOffsetUnit: l.meanOffsetUnit ?? null },
		},
	}
}
