/**
 * Diagram interchange for the elements an edit added, without touching the
 * layout that was already there.
 *
 * {@link applyAutoLayout} recomputes every position, which is right for a new
 * diagram and wrong for an edit: a reviewer sees every shape move. This places
 * only what {@link checkDiCompleteness} reports missing, next to the elements it
 * connects to and inside the pool, lane or sub-process it belongs to, then routes
 * the missing sequence flows, message flows and associations around what is
 * already drawn.
 *
 * @packageDocumentation
 */

import { collapseCollinear } from "../layout/grid/grid-router.js"
import { type Port, type Side, routeOrthogonal, sidePorts } from "../layout/orthogonal.js"
import { type Bounds, ELEMENT_SIZES, type Waypoint } from "../layout/types.js"
import type {
	BpmnDefinitions,
	BpmnDiEdge,
	BpmnDiPlane,
	BpmnDiShape,
	BpmnDiagram,
	BpmnFlowElement,
	BpmnLane,
	BpmnLaneSet,
	BpmnProcess,
} from "./bpmn-model.js"
import { checkDiCompleteness } from "./di-check.js"

/** Gap kept between a new shape and the one it follows. */
const GAP = 50
/** Clearance a new shape keeps from every shape already on the plane. */
const MARGIN = 15
/** Pool and lane label strip on the left. */
const HEADER = 30
/** Inset from a container's border. */
const INSET = 12
const STEP = 25
const REACH = 24
const POOL_GAP = 30
const DEFAULT_POOL_HEIGHT = 250
const DEFAULT_LANE_HEIGHT = 125
const ANNOTATION_SIZE = { width: 100, height: 30 }
/** Extent of a region with no container on that side. */
const OPEN = 1e7
/** Cost of a spot that makes one of its flows run backwards, in pixels moved. */
const BACKWARDS = 400

type ConnectionKind = "sequence" | "message" | "association"

interface Connection {
	kind: ConnectionKind
	source: string
	target: string
}

interface ElementInfo {
	type: string
	/** The sub-process, participant or (with no collaboration) process that holds it. */
	parent?: string
	process?: BpmnProcess
	attachedTo?: string
	children?: BpmnFlowElement[]
}

interface Container {
	region: Bounds
	/** Ids widened, innermost first, when nothing fits inside `region`. */
	chain: string[]
}

/**
 * Give every element and connection that has no diagram interchange a position,
 * keeping every existing `BPMNShape` and `BPMNEdge` exactly where it is.
 *
 * A new flow node goes right of the node it follows (left of the one it leads
 * to, or under the element a message flow links it to), inside its lane, pool or
 * expanded sub-process, clear of every shape and, where possible, of every
 * existing route. A boundary event sits on its host's lower edge; a new pool
 * goes under the existing ones; a new sub-process with content is drawn
 * collapsed, its content on a plane of its own. An element in a laned process
 * that no lane lists joins the lane of the element it was placed next to.
 *
 * Only when its container has no free room does a pool, lane or sub-process grow
 * to the right — its position never changes. The one existing edge that is
 * re-routed is one the edit re-pointed at a new element (as `insertAfter` does,
 * keeping the flow's id), since its old route ends in the wrong place. The input
 * is not modified.
 *
 * @example
 * ```typescript
 * const original = readFileSync("order.bpmn", "utf8")
 * const edited = Bpmn.parse(original)
 * // ... add a task and a sequence flow to edited.processes[0] ...
 * writeFileSync("order.bpmn", exportPreserving(original, placeMissingShapes(edited)))
 * ```
 */
export function placeMissingShapes(defs: BpmnDefinitions): BpmnDefinitions {
	const missing = checkDiCompleteness(defs)
	if (missing.missingShapes.length === 0 && missing.missingEdges.length === 0) return defs
	return new Placer(structuredClone(defs), missing.missingShapes, missing.missingEdges).run()
}

class Placer {
	private readonly elements = new Map<string, ElementInfo>()
	private readonly connections = new Map<string, Connection>()
	private readonly neighbours = new Map<string, Array<{ id: string; flow: Connection }>>()
	private readonly participantOf = new Map<string, string>()
	private readonly shapeOf = new Map<string, BpmnDiShape>()
	private readonly planeOf = new Map<string, BpmnDiPlane>()
	private readonly usedIds = new Set<string>()
	/** Elements this run gave a shape. */
	private readonly placed = new Set<string>()
	private readonly lanes: Array<{ lane: BpmnLane; process: BpmnProcess; depth: number }> = []

	constructor(
		private readonly defs: BpmnDefinitions,
		private readonly missingShapes: string[],
		private readonly missingEdges: string[],
	) {
		this.index()
	}

	run(): BpmnDefinitions {
		if (this.defs.diagrams.length === 0) {
			const root = this.defs.collaborations[0]?.id ?? this.defs.processes[0]?.id ?? "diagram"
			this.defs.diagrams.push(this.newDiagram(root))
		}
		const pending = new Set(this.missingShapes.filter((id) => this.elements.has(id)))

		// Pools first, then sub-processes, so their content has somewhere to go.
		for (const id of pending) {
			if (this.elements.get(id)?.type === "participant") {
				this.placePool(id)
				pending.delete(id)
			}
		}
		while (pending.size > 0) {
			const id = this.nextReady(pending) ?? (pending.values().next().value as string)
			pending.delete(id)
			this.placeElement(id)
		}

		for (const id of this.missingEdges) this.routeConnection(id)
		// An edge already drawn but now ending on a new element was re-pointed by the
		// edit (`insertAfter` keeps the flow's id), so its old route is wrong.
		for (const diagram of this.defs.diagrams) {
			for (const edge of diagram.plane.edges) {
				const flow = this.connections.get(edge.bpmnElement)
				if (flow && (this.placed.has(flow.source) || this.placed.has(flow.target))) {
					this.routeConnection(edge.bpmnElement, edge)
				}
			}
		}
		return this.defs
	}

	// ── Index ────────────────────────────────────────────────────────────────

	private index(): void {
		for (const collab of this.defs.collaborations) {
			for (const p of collab.participants) {
				this.elements.set(p.id, { type: "participant" })
				if (p.processRef) this.participantOf.set(p.processRef, p.id)
			}
			for (const f of collab.messageFlows) this.connect(f.id, "message", f.sourceRef, f.targetRef)
			for (const a of collab.associations ?? []) {
				this.connect(a.id, "association", a.sourceRef, a.targetRef)
			}
			for (const ta of collab.textAnnotations ?? []) {
				this.elements.set(ta.id, { type: "textAnnotation" })
			}
		}

		for (const process of this.defs.processes) {
			const owner = this.participantOf.get(process.id) ?? process.id
			this.walkScope(process, owner, process)
			const walkLanes = (set: BpmnLaneSet | undefined, depth: number): void => {
				for (const lane of set?.lanes ?? []) {
					this.elements.set(lane.id, { type: "lane", process })
					this.lanes.push({ lane, process, depth })
					walkLanes(lane.childLaneSet, depth + 1)
				}
			}
			walkLanes(process.laneSet, 0)
		}

		for (const diagram of this.defs.diagrams) {
			this.usedIds.add(diagram.id)
			this.usedIds.add(diagram.plane.id)
			for (const shape of diagram.plane.shapes) {
				this.usedIds.add(shape.id)
				if (!this.shapeOf.has(shape.bpmnElement)) {
					this.shapeOf.set(shape.bpmnElement, shape)
					this.planeOf.set(shape.bpmnElement, diagram.plane)
				}
			}
			for (const edge of diagram.plane.edges) this.usedIds.add(edge.id)
		}
		for (const id of this.elements.keys()) this.usedIds.add(id)
		for (const id of this.connections.keys()) this.usedIds.add(id)
	}

	private walkScope(
		scope: {
			flowElements: BpmnFlowElement[]
			sequenceFlows?: Array<{ id: string; sourceRef: string; targetRef: string }>
			textAnnotations?: Array<{ id: string }>
			associations?: Array<{ id: string; sourceRef: string; targetRef: string }>
		},
		parent: string,
		process: BpmnProcess,
	): void {
		for (const el of scope.flowElements) {
			const info: ElementInfo = { type: el.type, parent, process }
			if (el.type === "boundaryEvent") info.attachedTo = el.attachedToRef
			const sub = el as unknown as typeof scope
			if (Array.isArray(sub.flowElements)) info.children = sub.flowElements
			this.elements.set(el.id, info)
			if (Array.isArray(sub.flowElements)) this.walkScope(sub, el.id, process)
		}
		for (const f of scope.sequenceFlows ?? []) {
			this.connect(f.id, "sequence", f.sourceRef, f.targetRef)
		}
		for (const ta of scope.textAnnotations ?? []) {
			this.elements.set(ta.id, { type: "textAnnotation", parent, process })
		}
		for (const a of scope.associations ?? []) {
			this.connect(a.id, "association", a.sourceRef, a.targetRef)
		}
	}

	private connect(id: string, kind: ConnectionKind, source: string, target: string): void {
		const flow = { kind, source, target }
		this.connections.set(id, flow)
		for (const [a, b] of [
			[source, target],
			[target, source],
		] as const) {
			const list = this.neighbours.get(a)
			if (list) list.push({ id: b, flow })
			else this.neighbours.set(a, [{ id: b, flow }])
		}
	}

	private uniqueId(base: string): string {
		let id = base
		for (let n = 2; this.usedIds.has(id); n++) id = `${base}_${n}`
		this.usedIds.add(id)
		return id
	}

	private newDiagram(element: string): BpmnDiagram {
		return {
			id: this.uniqueId(`BPMNDiagram_${element}`),
			plane: {
				id: this.uniqueId(`BPMNPlane_${element}`),
				bpmnElement: element,
				shapes: [],
				edges: [],
			},
		}
	}

	// ── Planes and containers ────────────────────────────────────────────────

	private planeByElement(element: string): BpmnDiPlane | undefined {
		return this.defs.diagrams.find((d) => d.plane.bpmnElement === element)?.plane
	}

	private rootPlane(): BpmnDiPlane {
		const collab = this.defs.collaborations[0]
		const plane = (collab && this.planeByElement(collab.id)) ?? this.defs.diagrams[0]?.plane
		if (!plane) throw new Error("placeMissingShapes: no diagram plane")
		return plane
	}

	/** The plane an element is drawn on: where its siblings are, or its container's. */
	private targetPlane(id: string): BpmnDiPlane {
		const info = this.elements.get(id)
		if (!info || info.type === "participant") return this.rootPlane()
		if (info.type === "boundaryEvent" && info.attachedTo) {
			const host = this.planeOf.get(info.attachedTo)
			if (host) return host
		}
		const parent = info.parent
		if (!parent) return this.rootPlane()
		const parentInfo = this.elements.get(parent)
		if (parentInfo?.children) {
			for (const sibling of parentInfo.children) {
				const plane = this.planeOf.get(sibling.id)
				if (plane) return plane
			}
			const own = this.planeByElement(parent)
			if (own) return own
			const parentShape = this.shapeOf.get(parent)
			const parentPlane = this.planeOf.get(parent)
			if (parentShape?.isExpanded === true && parentPlane) return parentPlane
			const diagram = this.newDiagram(parent)
			this.defs.diagrams.push(diagram)
			return diagram.plane
		}
		return (
			this.planeOf.get(parent) ??
			(info.process && this.planeByElement(info.process.id)) ??
			this.rootPlane()
		)
	}

	/** The deepest lane that lists `id` and has a shape. */
	private laneOf(id: string): BpmnLane | undefined {
		let best: { lane: BpmnLane; depth: number } | undefined
		for (const entry of this.lanes) {
			if (!entry.lane.flowNodeRefs.includes(id) || !this.shapeOf.has(entry.lane.id)) continue
			if (!best || entry.depth > best.depth) best = entry
		}
		return best?.lane
	}

	private processHasLaneShapes(process: BpmnProcess | undefined): boolean {
		return this.lanes.some((l) => l.process === process && this.shapeOf.has(l.lane.id))
	}

	private containerOf(id: string, plane: BpmnDiPlane): Container | undefined {
		const info = this.elements.get(id)
		const parent = info?.parent
		if (!parent) return undefined
		const parentShape = this.shapeOf.get(parent)
		if (!parentShape || this.planeOf.get(parent) !== plane) return undefined
		const b = parentShape.bounds
		if (this.elements.get(parent)?.children) {
			const outer = this.containerOf(parent, plane)
			return {
				region: inset(b, INSET, INSET, INSET, INSET),
				chain: [parent, ...(outer?.chain ?? [])],
			}
		}
		// Process level: the lane when there is one, else the pool.
		const pool = this.elements.get(parent)?.type === "participant" ? parent : undefined
		const lane = this.laneOf(id)
		if (lane) {
			const lb = this.shapeOf.get(lane.id)?.bounds
			if (lb) {
				return {
					region: inset(lb, HEADER + INSET, INSET, INSET, INSET),
					chain: pool ? [lane.id, pool] : [lane.id],
				}
			}
		}
		if (pool) return { region: inset(b, HEADER + INSET, INSET, INSET, INSET), chain: [pool] }
		return undefined
	}

	/** Ids whose shapes a shape of `id` may sit inside: its containers. */
	private ancestors(id: string): Set<string> {
		const out = new Set<string>()
		for (let p = this.elements.get(id)?.parent; p; p = this.elements.get(p)?.parent) out.add(p)
		const lane = this.laneOf(id)
		if (lane) for (const l of this.lanes) if (contains(l.lane, lane.id)) out.add(l.lane.id)
		return out
	}

	private isContainer(id: string): boolean {
		const type = this.elements.get(id)?.type
		return type === "participant" || type === "lane" || type === undefined
	}

	private obstacles(plane: BpmnDiPlane, except: Set<string>): Bounds[] {
		const out: Bounds[] = []
		for (const shape of plane.shapes) {
			// Even an endpoint's own label: a route into the shape through its name hides it.
			if (shape.label?.bounds) out.push(shape.label.bounds)
			if (except.has(shape.bpmnElement)) continue
			if (!this.isContainer(shape.bpmnElement)) out.push(shape.bounds)
		}
		for (const edge of plane.edges) if (edge.label?.bounds) out.push(edge.label.bounds)
		return out
	}

	// ── Shapes ───────────────────────────────────────────────────────────────

	private addShape(
		id: string,
		plane: BpmnDiPlane,
		bounds: Bounds,
		extra?: Partial<BpmnDiShape>,
	): void {
		const shape: BpmnDiShape = {
			id: this.uniqueId(`${id}_di`),
			bpmnElement: id,
			...extra,
			bounds: round(bounds),
			unknownAttributes: {},
		}
		plane.shapes.push(shape)
		this.placed.add(id)
		this.shapeOf.set(id, shape)
		this.planeOf.set(id, plane)
	}

	private placePool(id: string): void {
		const plane = this.rootPlane()
		const pools = plane.shapes.filter(
			(s) => this.elements.get(s.bpmnElement)?.type === "participant",
		)
		let x = 0
		let width = 600
		let bottom = Number.NEGATIVE_INFINITY
		if (pools.length > 0) {
			x = Math.min(...pools.map((s) => s.bounds.x))
			width = Math.max(...pools.map((s) => s.bounds.x + s.bounds.width)) - x
		}
		for (const s of plane.shapes) bottom = Math.max(bottom, s.bounds.y + s.bounds.height)
		const y = Number.isFinite(bottom) ? bottom + POOL_GAP : 0

		const processRef = this.defs.collaborations
			.flatMap((c) => c.participants)
			.find((p) => p.id === id)?.processRef
		const process = this.defs.processes.find((p) => p.id === processRef)
		const lanes = (process?.laneSet?.lanes ?? []).filter((l) => !this.shapeOf.has(l.id))
		const height = lanes.length > 0 ? lanes.length * DEFAULT_LANE_HEIGHT : DEFAULT_POOL_HEIGHT
		this.addShape(id, plane, { x, y, width, height }, { isHorizontal: true })
		lanes.forEach((lane, i) => {
			this.addShape(
				lane.id,
				plane,
				{
					x: x + HEADER,
					y: y + i * DEFAULT_LANE_HEIGHT,
					width: width - HEADER,
					height: DEFAULT_LANE_HEIGHT,
				},
				{ isHorizontal: true },
			)
		})
	}

	/** The next element with a drawn neighbour on its own plane, sequence predecessors first. */
	private nextReady(pending: Set<string>): string | undefined {
		let fallback: string | undefined
		for (const id of pending) {
			const info = this.elements.get(id)
			if (info?.parent && pending.has(info.parent)) continue
			if (info?.attachedTo) {
				if (this.shapeOf.has(info.attachedTo)) return id
				continue
			}
			for (const n of this.neighbours.get(id) ?? []) {
				if (!this.shapeOf.has(n.id)) continue
				if (n.flow.kind === "sequence" && n.flow.target === id) return id
				fallback ??= id
			}
		}
		if (fallback) return fallback
		// Nothing anchored: take a container before its content.
		for (const id of pending) {
			const parent = this.elements.get(id)?.parent
			if (!parent || !pending.has(parent)) return id
		}
		return undefined
	}

	private placeElement(id: string): void {
		const info = this.elements.get(id)
		if (!info) return
		if (info.type === "boundaryEvent" && info.attachedTo && this.shapeOf.has(info.attachedTo)) {
			this.placeBoundary(id, info.attachedTo)
			return
		}
		const plane = this.targetPlane(id)
		const size =
			info.type === "textAnnotation"
				? ANNOTATION_SIZE
				: (ELEMENT_SIZES[info.type] ?? { width: 100, height: 80 })
		const anchor = this.anchorFor(id, plane, size)
		this.joinLane(id, info, anchor.via)

		const container = this.containerOf(id, plane)
		const obstacles = this.obstacles(plane, this.ancestors(id))
		const routes = plane.edges.map((e) => e.waypoints)
		const centre = anchor.centre ?? this.seedCentre(plane, container?.region, size)
		const want = { x: centre.x - size.width / 2, y: centre.y - size.height / 2, ...size }
		// With no container, a node still stays below the top of what is drawn: a
		// shape above everything else reads as detached. Annotations sit above on purpose.
		let region = container?.region
		if (!region && info.type !== "textAnnotation" && plane.shapes.length > 0) {
			const top = Math.min(want.y, ...plane.shapes.map((s) => s.bounds.y))
			region = { x: -OPEN, y: top, width: 2 * OPEN, height: OPEN }
		}

		// A spot past a node it flows into (or before one it comes from) makes that flow run backwards.
		const before: number[] = []
		const after: number[] = []
		for (const n of this.neighbours.get(id) ?? []) {
			const b = this.planeOf.get(n.id) === plane ? this.shapeOf.get(n.id)?.bounds : undefined
			if (!b || n.flow.kind !== "sequence") continue
			if (n.flow.source === id) before.push(b.x)
			else if (this.elements.get(n.id)?.type !== "boundaryEvent") after.push(b.x + b.width)
		}
		const backwards = (b: Bounds): number =>
			before.filter((x) => b.x > x).length * BACKWARDS +
			after.filter((x) => b.x + b.width < x).length * BACKWARDS
		let bounds =
			findSpot(want, anchor.dir, region, obstacles, routes, backwards) ??
			findSpot(want, anchor.dir, region, obstacles, [], backwards)
		if (!bounds) {
			// No room left: go right of everything in the band and widen the container.
			const top = region ? clamp(want.y, region.y, region.y + region.height - size.height) : want.y
			let right = want.x
			for (const o of obstacles) {
				if (o.y < top + size.height + MARGIN && o.y + o.height > top - MARGIN) {
					right = Math.max(right, o.x + o.width + GAP)
				}
			}
			bounds = { x: right, y: top, ...size }
			if (container) this.widen(container.chain, bounds.x + bounds.width, plane)
		}

		const extra: Partial<BpmnDiShape> = {}
		if (info.type === "exclusiveGateway") extra.isMarkerVisible = true
		if (info.children) extra.isExpanded = false
		this.addShape(id, plane, bounds, extra)
	}

	private placeBoundary(id: string, hostId: string): void {
		const host = this.shapeOf.get(hostId)
		const plane = this.planeOf.get(hostId)
		if (!host || !plane) return
		const size = ELEMENT_SIZES.boundaryEvent ?? { width: 36, height: 36 }
		const siblings = plane.shapes
			.filter((s) => this.elements.get(s.bpmnElement)?.attachedTo === hostId)
			.map((s) => s.bounds)
		const h = host.bounds
		const y = h.y + h.height - size.height / 2
		let x = h.x + h.width - size.width - 10
		for (let k = 0; k < 8; k++) {
			const candidate = { x: h.x + h.width - size.width - 10 - k * (size.width + 8), y, ...size }
			if (candidate.x < h.x - size.width / 2) break
			if (!siblings.some((s) => overlaps(s, candidate, 2))) {
				x = candidate.x
				break
			}
		}
		this.addShape(id, plane, { x, y, ...size })
	}

	private anchorFor(
		id: string,
		plane: BpmnDiPlane,
		size: { width: number; height: number },
	): { centre?: Waypoint; dir: Waypoint; via?: string } {
		const list = this.neighbours.get(id) ?? []
		const drawn = (n: { id: string }) => {
			const s = this.shapeOf.get(n.id)
			return s && this.planeOf.get(n.id) === plane ? s.bounds : undefined
		}
		for (const n of list) {
			const b = drawn(n)
			if (!b || n.flow.kind !== "sequence" || n.flow.target !== id) continue
			if (this.elements.get(n.id)?.type === "boundaryEvent") {
				return {
					centre: {
						x: b.x + b.width + 30 + size.width / 2,
						y: b.y + b.height + GAP + size.height / 2,
					},
					dir: { x: 1, y: 1 },
					via: n.id,
				}
			}
			return {
				centre: { x: b.x + b.width + GAP + size.width / 2, y: b.y + b.height / 2 },
				dir: { x: 1, y: 0 },
				via: n.id,
			}
		}
		for (const n of list) {
			const b = drawn(n)
			if (!b || n.flow.kind !== "sequence") continue
			return {
				centre: { x: b.x - GAP - size.width / 2, y: b.y + b.height / 2 },
				dir: { x: -1, y: 0 },
				via: n.id,
			}
		}
		for (const n of list) {
			const b = drawn(n)
			if (!b || n.flow.kind !== "association") continue
			return {
				centre: { x: b.x + b.width + 20 + size.width / 2, y: b.y - 40 - size.height / 2 },
				dir: { x: 1, y: -1 },
				via: n.id,
			}
		}
		for (const n of list) {
			const s = this.shapeOf.get(n.id)
			if (!s || n.flow.kind !== "message") continue
			const region = this.containerOf(id, plane)?.region
			const cx = s.bounds.x + s.bounds.width / 2
			const cy = region ? region.y + region.height / 2 : s.bounds.y + s.bounds.height / 2
			return { centre: { x: cx, y: cy }, dir: { x: 0, y: 0 } }
		}
		return { dir: { x: 1, y: 0 } }
	}

	/** Where an element nothing anchors starts: the container's left, or under the plane. */
	private seedCentre(
		plane: BpmnDiPlane,
		region: Bounds | undefined,
		size: { width: number; height: number },
	): Waypoint {
		if (region) {
			return { x: region.x + GAP + size.width / 2, y: region.y + region.height / 2 }
		}
		let minX = Number.POSITIVE_INFINITY
		let maxY = Number.NEGATIVE_INFINITY
		for (const s of plane.shapes) {
			minX = Math.min(minX, s.bounds.x)
			maxY = Math.max(maxY, s.bounds.y + s.bounds.height)
		}
		if (!Number.isFinite(minX)) return { x: 100 + size.width / 2, y: 100 + size.height / 2 }
		return { x: minX + size.width / 2, y: maxY + GAP + size.height / 2 }
	}

	/** A process-level element in a laned process that no lane lists joins its neighbour's lane. */
	private joinLane(id: string, info: ElementInfo, via: string | undefined): void {
		if (info.type === "textAnnotation" || !info.process || this.laneOf(id)) return
		if (this.elements.get(info.parent ?? "")?.children) return
		if (!this.processHasLaneShapes(info.process)) return
		const from = info.attachedTo ?? via
		let lane = from ? this.laneOf(from) : undefined
		if (!lane) {
			for (const n of this.neighbours.get(id) ?? []) {
				lane = this.laneOf(n.id)
				if (lane) break
			}
		}
		lane ??= this.lanes.find(
			(l) =>
				l.process === info.process &&
				this.shapeOf.has(l.lane.id) &&
				!l.lane.childLaneSet?.lanes.length,
		)?.lane
		if (lane) lane.flowNodeRefs.push(id)
	}

	/** Grow each container in `chain` rightwards to clear `right`; a pool's lanes follow it. */
	private widen(chain: string[], right: number, plane: BpmnDiPlane): void {
		let need = right + INSET
		for (const id of chain) {
			const shape = this.shapeOf.get(id)
			if (!shape) continue
			const b = shape.bounds
			if (b.x + b.width < need) b.width = Math.round(need - b.x)
			need = b.x + b.width + INSET
			if (this.elements.get(id)?.type === "participant") {
				const poolRight = b.x + b.width
				const process = this.defs.processes.find((p) => this.participantOf.get(p.id) === id)
				for (const l of this.lanes) {
					if (l.process !== process) continue
					const ls = this.shapeOf.get(l.lane.id)
					if (ls && this.planeOf.get(l.lane.id) === plane)
						ls.bounds.width = Math.round(poolRight - ls.bounds.x)
				}
			}
		}
	}

	// ── Edges ────────────────────────────────────────────────────────────────

	/** The element itself, or its nearest ancestor with a shape on `plane`. */
	private visibleOn(id: string, plane: BpmnDiPlane): string | undefined {
		for (let cur: string | undefined = id; cur; cur = this.elements.get(cur)?.parent) {
			if (this.planeOf.get(cur) === plane) return cur
		}
		return undefined
	}

	/** Draw `flowId`, or re-route `redraw` (an edge already on the plane) in place. */
	private routeConnection(flowId: string, redraw?: BpmnDiEdge): void {
		const flow = this.connections.get(flowId)
		if (!flow) return
		const plane =
			flow.kind === "message"
				? this.rootPlane()
				: (this.planeOf.get(flow.source) ?? this.planeOf.get(flow.target))
		if (!plane) return
		const sourceId = this.visibleOn(flow.source, plane)
		const targetId = this.visibleOn(flow.target, plane)
		if (!sourceId || !targetId) return
		const source = this.shapeOf.get(sourceId)?.bounds
		const target = this.shapeOf.get(targetId)?.bounds
		if (!source || !target) return

		const except = new Set([
			sourceId,
			targetId,
			...this.ancestors(sourceId),
			...this.ancestors(targetId),
		])
		const host = this.elements.get(sourceId)?.attachedTo
		if (host) except.add(host)
		const obstacles = this.obstacles(plane, except)
		const existing = plane.edges.filter((e) => e !== redraw).map((e) => e.waypoints)

		let from: Port[]
		let to: Port[]
		if (flow.kind === "message") {
			const down = source.y + source.height / 2 < target.y + target.height / 2
			const x = this.sharedX(sourceId, source, targetId, target)
			from = [this.dock(sourceId, source, target, down ? "bottom" : "top", x)]
			to = [this.dock(targetId, target, source, down ? "top" : "bottom", x)]
		} else if (flow.kind === "sequence") {
			from = host
				? sidePorts(source, {
						top: Number.POSITIVE_INFINITY,
						left: Number.POSITIVE_INFINITY,
						right: Number.POSITIVE_INFINITY,
					})
				: sidePorts(source, { top: 20, bottom: 20, left: 80 })
			to = sidePorts(target, { top: 20, bottom: 20, right: 80 })
		} else {
			from = sidePorts(source)
			to = sidePorts(target)
		}

		const routed = routeOrthogonal({
			from,
			to,
			obstacles,
			crossings: (a, b) => existing.reduce((n, route) => n + crossingCount(a, b, route), 0),
		})
		const waypoints = routed ? collapseCollinear(routed) : straightRoute(from[0], to[0])
		if (waypoints.length < 2) return
		const rounded = waypoints.map((w) => ({ x: Math.round(w.x), y: Math.round(w.y) }))
		if (redraw) {
			redraw.waypoints = rounded
			// The label sat on the old route.
			if (redraw.label?.bounds) redraw.label.bounds = undefined
			return
		}
		const edge: BpmnDiEdge = {
			id: this.uniqueId(`${flowId}_di`),
			bpmnElement: flowId,
			waypoints: rounded,
			unknownAttributes: {},
		}
		plane.edges.push(edge)
	}

	/** Events and gateways dock a message flow at their centre; anything else may take it off-centre. */
	private centred(id: string): boolean {
		const type = this.elements.get(id)?.type ?? ""
		return type.endsWith("Event") || type.endsWith("Gateway")
	}

	/** One x both ends of a message flow can dock at, so it runs straight; undefined if none. */
	private sharedX(aId: string, a: Bounds, bId: string, b: Bounds): number | undefined {
		const range = (id: string, r: Bounds): [number, number] => {
			if (this.centred(id)) return [r.x + r.width / 2, r.x + r.width / 2]
			const left = this.elements.get(id)?.type === "participant" ? HEADER + INSET : INSET
			return [r.x + left, r.x + r.width - INSET]
		}
		const [a0, a1] = range(aId, a)
		const [b0, b1] = range(bId, b)
		const lo = Math.max(a0, b0)
		const hi = Math.min(a1, b1)
		if (lo > hi) return undefined
		// Nearest to the middle of the narrower end, which reads as its centre.
		const narrow = a1 - a0 <= b1 - b0 ? (a0 + a1) / 2 : (b0 + b1) / 2
		return clamp(narrow, lo, hi)
	}

	/** A message-flow port: a pool docks under the other end; a node at its side centre. */
	private dock(id: string, b: Bounds, other: Bounds, side: Side, x?: number): Port {
		const y = side === "top" ? b.y : b.y + b.height
		if (x !== undefined) return { point: { x, y }, side }
		if (this.elements.get(id)?.type === "participant") {
			const x = clamp(other.x + other.width / 2, b.x + HEADER + INSET, b.x + b.width - INSET)
			return { point: { x, y }, side }
		}
		return { point: { x: b.x + b.width / 2, y }, side }
	}
}

// ── Geometry ─────────────────────────────────────────────────────────────────

function inset(b: Bounds, left: number, top: number, right: number, bottom: number): Bounds {
	return {
		x: b.x + left,
		y: b.y + top,
		width: b.width - left - right,
		height: b.height - top - bottom,
	}
}

function round(b: Bounds): Bounds {
	return { x: Math.round(b.x), y: Math.round(b.y), width: b.width, height: b.height }
}

function clamp(v: number, min: number, max: number): number {
	return max < min ? min : Math.min(max, Math.max(min, v))
}

function contains(lane: BpmnLane, id: string): boolean {
	if (lane.id === id) return true
	return (lane.childLaneSet?.lanes ?? []).some((child) => contains(child, id))
}

function overlaps(a: Bounds, b: Bounds, margin: number): boolean {
	return (
		a.x < b.x + b.width + margin &&
		b.x < a.x + a.width + margin &&
		a.y < b.y + b.height + margin &&
		b.y < a.y + a.height + margin
	)
}

function inside(b: Bounds, region: Bounds): boolean {
	return (
		b.x >= region.x &&
		b.y >= region.y &&
		b.x + b.width <= region.x + region.width &&
		b.y + b.height <= region.y + region.height
	)
}

/** Whether segment a→b passes through rectangle `r` (Liang–Barsky clip). */
function segmentHits(a: Waypoint, b: Waypoint, r: Bounds): boolean {
	let t0 = 0
	let t1 = 1
	const dx = b.x - a.x
	const dy = b.y - a.y
	const checks: Array<[number, number]> = [
		[-dx, a.x - r.x],
		[dx, r.x + r.width - a.x],
		[-dy, a.y - r.y],
		[dy, r.y + r.height - a.y],
	]
	for (const [p, q] of checks) {
		if (p === 0) {
			if (q < 0) return false
			continue
		}
		const t = q / p
		if (p < 0) t0 = Math.max(t0, t)
		else t1 = Math.min(t1, t)
		if (t0 > t1) return false
	}
	return true
}

function routeHits(route: Waypoint[], r: Bounds): boolean {
	for (let i = 1; i < route.length; i++) {
		const a = route[i - 1]
		const b = route[i]
		if (a && b && segmentHits(a, b, r)) return true
	}
	return false
}

/**
 * The free spot nearest `want`, preferring to move along `dir`: inside
 * `region`, `MARGIN` clear of every obstacle and off every route.
 */
function findSpot(
	want: Bounds,
	dir: Waypoint,
	region: Bounds | undefined,
	obstacles: Bounds[],
	routes: Waypoint[][],
	penalty: (b: Bounds) => number = () => 0,
): Bounds | undefined {
	const candidates: Array<{ b: Bounds; cost: number }> = []
	for (let i = -REACH; i <= REACH; i++) {
		for (let j = -REACH; j <= REACH; j++) {
			const dx = i * STEP
			const dy = j * STEP
			// Moving against the preferred direction costs triple.
			const back =
				(dir.x !== 0 && Math.sign(dx) === -Math.sign(dir.x) ? 2 * Math.abs(dx) : 0) +
				(dir.y !== 0 && Math.sign(dy) === -Math.sign(dir.y) ? 2 * Math.abs(dy) : 0)
			const b = { x: want.x + dx, y: want.y + dy, width: want.width, height: want.height }
			candidates.push({
				b,
				// Down reads as a branch; up as something squeezed in.
				cost: Math.abs(dx) + (dy < 0 ? 1.4 : 1.2) * Math.abs(dy) + back + penalty(b),
			})
		}
	}
	candidates.sort((a, b) => a.cost - b.cost)
	const near = obstacles.filter(
		(o) =>
			o.x < want.x + want.width + (REACH + 1) * STEP &&
			o.x + o.width > want.x - (REACH + 1) * STEP &&
			o.y < want.y + want.height + (REACH + 1) * STEP &&
			o.y + o.height > want.y - (REACH + 1) * STEP,
	)
	for (const { b } of candidates) {
		if (region && !inside(b, region)) continue
		if (near.some((o) => overlaps(o, b, MARGIN))) continue
		const padded = { x: b.x - 5, y: b.y - 5, width: b.width + 10, height: b.height + 10 }
		if (routes.some((route) => routeHits(route, padded))) continue
		return b
	}
	return undefined
}

/** How many segments of `route` the axis-aligned segment a→b crosses at right angles. */
function crossingCount(a: Waypoint, b: Waypoint, route: Waypoint[]): number {
	let n = 0
	const horizontal = a.y === b.y
	for (let i = 1; i < route.length; i++) {
		const c = route[i - 1]
		const d = route[i]
		if (!c || !d) continue
		if (horizontal && c.x === d.x) {
			const [x0, x1] = a.x < b.x ? [a.x, b.x] : [b.x, a.x]
			const [y0, y1] = c.y < d.y ? [c.y, d.y] : [d.y, c.y]
			if (c.x > x0 && c.x < x1 && a.y > y0 && a.y < y1) n++
		} else if (!horizontal && c.y === d.y) {
			const [y0, y1] = a.y < b.y ? [a.y, b.y] : [b.y, a.y]
			const [x0, x1] = c.x < d.x ? [c.x, d.x] : [d.x, c.x]
			if (c.y > y0 && c.y < y1 && a.x > x0 && a.x < x1) n++
		}
	}
	return n
}

/** An elbow between two ports, used only when the router finds no clear path. */
function straightRoute(from: Port | undefined, to: Port | undefined): Waypoint[] {
	if (!from || !to) return []
	const a = from.point
	const b = to.point
	if (a.x === b.x || a.y === b.y) return [a, b]
	if (from.side === "top" || from.side === "bottom") {
		const midY = (a.y + b.y) / 2
		return [a, { x: a.x, y: midY }, { x: b.x, y: midY }, b]
	}
	const midX = (a.x + b.x) / 2
	return [a, { x: midX, y: a.y }, { x: midX, y: b.y }, b]
}
