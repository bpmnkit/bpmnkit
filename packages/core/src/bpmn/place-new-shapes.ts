import { layoutProcess } from "../layout/layout-engine.js"
import { type Port, type Side, routeOrthogonal, sidePorts } from "../layout/orthogonal.js"
/**
 * Diagram interchange for the elements an edit added, around a layout that
 * stays put.
 *
 * {@link applyAutoLayout} replaces every position, which is right for a new
 * diagram and wrong for an edit: a reviewer reads "the whole diagram moved"
 * when two tasks were added. This places only what has no shape yet, next to
 * the element it connects to, and routes only the connections that have no
 * edge (or whose ends no longer touch their shapes). Existing shapes keep their
 * bounds; the one change they can see is a pool, lane or sub-process growing
 * wider (or a sub-process deeper) when the new shapes do not fit inside it.
 *
 * @packageDocumentation
 */
import { externalLabelWidth } from "../layout/semantic/place.js"
import { ELEMENT_SIZES, LABEL_HEIGHT } from "../layout/types.js"
import type { Bounds, LayoutResult, Waypoint } from "../layout/types.js"
import type {
	BpmnAssociation,
	BpmnBoundaryEvent,
	BpmnDefinitions,
	BpmnDiEdge,
	BpmnDiPlane,
	BpmnDiShape,
	BpmnFlowElement,
	BpmnLane,
	BpmnLaneSet,
	BpmnProcess,
	BpmnSequenceFlow,
	BpmnTextAnnotation,
} from "./bpmn-model.js"

export interface PlaceNewShapesOptions {
	/**
	 * Re-route existing edges whose ends no longer touch their shapes, such as a
	 * flow the edit re-pointed at a new element. Default `true`.
	 */
	rerouteStale?: boolean
	/**
	 * Add a new flow node to the lane it is drawn in when no lane lists it, as a
	 * modeller does when a shape is dropped into a lane. Default `true`.
	 */
	assignLanes?: boolean
}

export interface PlaceNewShapesResult {
	/** A copy of the input with the new shapes and edges; the input is not changed. */
	definitions: BpmnDefinitions
	/** Elements that got a shape: flow nodes, pools, annotations. */
	placed: string[]
	/** Connections that got an edge: sequence flows, message flows, associations. */
	routed: string[]
	/** Existing edges that got a new route because their ends no longer met their shapes. */
	rerouted: string[]
	/** Pools, lanes and sub-processes made larger so the new shapes fit. */
	resized: string[]
	/** Flow nodes added to a lane's `flowNodeRefs`. */
	laneAssigned: string[]
	/**
	 * What could not be placed, and why. A new shape that could only be put on
	 * top of another shape or label is drawn anyway (its edges need it) and
	 * listed here too, with a reason that says what it overlaps: existing shapes
	 * never move, so making room is the caller's call.
	 */
	unplaced: Array<{ id: string; reason: string }>
}

type Rect = Bounds

/** Pool and lane title bands on the left; the layout uses the same widths. */
const HEADER = 30
const GAP = 50
const STEP = 30
const MAX_COLUMNS = 120
const ROW_STEP = 20
const MAX_ROWS = 20
const MARGIN = 12
const INNER_PADDING = 15
const SUB_PROCESS_TOP = 30
const NEW_POOL_GAP = 30
const BLACK_BOX_HEIGHT = 60
const ANNOTATION_WIDTH = 100
/** An edge end further than this from its shape no longer belongs to it. */
const STALE_DISTANCE = 12

const CONTAINER_TYPES = new Set(["subProcess", "adHocSubProcess", "eventSubProcess", "transaction"])

interface Scope {
	id: string
	processId: string
	isProcess: boolean
	flowElements: BpmnFlowElement[]
	sequenceFlows: BpmnSequenceFlow[]
	textAnnotations: BpmnTextAnnotation[]
	associations: BpmnAssociation[]
}

interface Box {
	/** Element id of the container shape: a lane, pool or sub-process. */
	id: string
	inner: Rect
	/** Furthest right and bottom the inner area may grow to. */
	maxRight: number
	maxBottom: number
}

interface Candidate {
	rect: Rect
	cost: number
}

/**
 * Where to look relative to the anchor: after it, before it, on its border
 * (`below`, for a boundary event), above it (data, annotations), below a
 * boundary event's host (`down`), or anywhere free.
 */
type Direction = "right" | "left" | "below" | "above" | "down" | "free"

/**
 * Gives every element that has no shape a place next to what it connects to,
 * and every connection that has no edge a route, without moving existing shapes.
 *
 * Use it after editing a parsed file and before {@link exportPreserving}:
 *
 * ```ts
 * const original = readFileSync("order.bpmn", "utf8")
 * const defs = Bpmn.parse(original)
 * // … add elements and flows to defs …
 * const { definitions, unplaced } = placeNewShapes(defs)
 * writeFileSync("order.bpmn", exportPreserving(original, definitions))
 * ```
 *
 * New lanes are not placed: they need room inside a pool, which means moving
 * the lanes below. They are reported in `unplaced`.
 */
export function placeNewShapes(
	input: BpmnDefinitions,
	options: PlaceNewShapesOptions = {},
): PlaceNewShapesResult {
	const defs = structuredClone(input)
	const result: PlaceNewShapesResult = {
		definitions: defs,
		placed: [],
		routed: [],
		rerouted: [],
		resized: [],
		laneAssigned: [],
		unplaced: [],
	}
	if (defs.diagrams.length === 0) {
		result.unplaced.push({
			id: "",
			reason: "the document has no diagram; use applyAutoLayout for a first layout",
		})
		return result
	}
	new Placer(defs, result, options).run()
	return result
}

class Placer {
	private readonly scopes = new Map<string, Scope>()
	private readonly scopeOf = new Map<string, Scope>()
	private readonly elements = new Map<string, BpmnFlowElement>()
	private readonly annotations = new Map<string, BpmnTextAnnotation>()
	private readonly shapes = new Map<string, { shape: BpmnDiShape; plane: BpmnDiPlane }>()
	private readonly edgeIds = new Set<string>()
	private readonly diIds = new Set<string>()
	private readonly participantOf = new Map<string, string>()
	/** Every pool, black boxes included. */
	private readonly participants = new Set<string>()
	private readonly laneOf = new Map<string, BpmnLane>()
	private readonly lanesOfProcess = new Map<string, BpmnLane[]>()
	private readonly mainPlane: BpmnDiPlane
	/** Shapes this run chose a spot for one by one, rather than as a laid-out block. */
	private readonly spotted: string[] = []

	constructor(
		private readonly defs: BpmnDefinitions,
		private readonly result: PlaceNewShapesResult,
		private readonly options: PlaceNewShapesOptions,
	) {
		this.mainPlane = (defs.diagrams[0] as { plane: BpmnDiPlane }).plane
		for (const diagram of defs.diagrams) {
			const plane = diagram.plane
			if (plane.id) this.diIds.add(plane.id)
			for (const shape of plane.shapes) {
				this.shapes.set(shape.bpmnElement, { shape, plane })
				this.diIds.add(shape.id)
			}
			for (const edge of plane.edges) {
				this.edgeIds.add(edge.bpmnElement)
				this.diIds.add(edge.id)
			}
		}
		for (const process of defs.processes) this.indexScope(process, process.id, true)
		for (const collaboration of defs.collaborations) {
			for (const p of collaboration.participants) {
				this.participants.add(p.id)
				if (p.processRef) this.participantOf.set(p.processRef, p.id)
			}
			for (const a of collaboration.textAnnotations) this.annotations.set(a.id, a)
		}
		for (const process of defs.processes) {
			const lanes: BpmnLane[] = []
			const walk = (set: BpmnLaneSet | undefined) => {
				for (const lane of set?.lanes ?? []) {
					lanes.push(lane)
					// The deepest lane wins, so nested lanes overwrite their parent.
					for (const ref of lane.flowNodeRefs) this.laneOf.set(ref, lane)
					walk(lane.childLaneSet)
				}
			}
			walk(process.laneSet)
			this.lanesOfProcess.set(process.id, lanes)
		}
	}

	run(): void {
		this.placePools()
		this.placeFlowNodes()
		this.placeAnnotations()
		this.reportOverlaps()
		this.reportLanes()
		this.routeEdges()
	}

	// -------------------------------------------------------------------------
	// Indexing
	// -------------------------------------------------------------------------

	private indexScope(
		owner: Pick<Scope, "flowElements" | "sequenceFlows" | "textAnnotations" | "associations"> & {
			id: string
		},
		processId: string,
		isProcess: boolean,
	): void {
		const scope: Scope = {
			id: owner.id,
			processId,
			isProcess,
			flowElements: owner.flowElements,
			sequenceFlows: owner.sequenceFlows,
			textAnnotations: owner.textAnnotations ?? [],
			associations: owner.associations ?? [],
		}
		this.scopes.set(owner.id, scope)
		for (const a of scope.textAnnotations) this.annotations.set(a.id, a)
		for (const el of owner.flowElements) {
			this.elements.set(el.id, el)
			this.scopeOf.set(el.id, scope)
			if (CONTAINER_TYPES.has(el.type) && "flowElements" in el) {
				this.indexScope(el as unknown as Scope & { id: string }, processId, false)
			}
		}
	}

	// -------------------------------------------------------------------------
	// Pools
	// -------------------------------------------------------------------------

	private placePools(): void {
		for (const collaboration of this.defs.collaborations) {
			for (const participant of collaboration.participants) {
				if (this.shapes.has(participant.id)) continue
				const pools = this.mainPlane.shapes.filter((s) =>
					collaboration.participants.some((p) => p.id === s.bpmnElement),
				)
				const left = pools.length > 0 ? Math.min(...pools.map((s) => s.bounds.x)) : 0
				const width = pools.length > 0 ? Math.max(...pools.map((s) => s.bounds.width)) : 600
				const top =
					pools.length > 0
						? Math.max(...pools.map((s) => s.bounds.y + s.bounds.height)) + NEW_POOL_GAP
						: 0
				const process = participant.processRef
					? this.defs.processes.find((p) => p.id === participant.processRef)
					: undefined
				if (!process || process.flowElements.length === 0) {
					this.addShape(
						this.mainPlane,
						participant.id,
						{
							x: left,
							y: top,
							width,
							height: BLACK_BOX_HEIGHT,
						},
						{ isHorizontal: true },
					)
					continue
				}
				// A pool whose whole content is new: lay that content out on its own and
				// size the pool around it.
				const content = this.layoutContent(process)
				const poolWidth = Math.max(width, content.width + HEADER + 2 * INNER_PADDING)
				const poolHeight = content.height + 2 * INNER_PADDING
				const pool = { x: left, y: top, width: poolWidth, height: poolHeight }
				this.addShape(this.mainPlane, participant.id, pool, { isHorizontal: true })
				const dx = left + HEADER + INNER_PADDING - content.minX
				const dy = top + INNER_PADDING - content.minY
				for (const lane of content.layout.lanes ?? []) {
					this.addShape(
						this.mainPlane,
						lane.id,
						{
							x: left + HEADER,
							y: lane.bounds.y + dy,
							width: poolWidth - HEADER,
							height: lane.bounds.height,
						},
						{ isHorizontal: true },
					)
				}
				this.commitLayout(this.mainPlane, content.layout, dx, dy)
			}
		}
	}

	// -------------------------------------------------------------------------
	// Flow nodes
	// -------------------------------------------------------------------------

	private placeFlowNodes(): void {
		const pending: BpmnFlowElement[] = []
		for (const el of this.elements.values()) {
			if (this.shapes.has(el.id) || el.type === "dataObject") continue
			const scope = this.scopeOf.get(el.id)
			// Children of a sub-process that is itself new are placed with it.
			if (scope && !scope.isProcess && !this.shapes.has(scope.id) && !this.ownPlane(scope.id)) {
				continue
			}
			pending.push(el)
		}

		// Successors first, so a new chain grows left to right from what exists;
		// a node reachable only backwards from a placed successor waits for that.
		let allowBackward = false
		while (pending.length > 0) {
			let progressed = false
			for (let i = 0; i < pending.length; i++) {
				const el = pending[i] as BpmnFlowElement
				const anchor = this.anchorFor(el, allowBackward)
				if (!anchor) continue
				pending.splice(i, 1)
				i--
				progressed = true
				this.placeNode(el, anchor.id, anchor.direction)
				if (allowBackward) break
			}
			if (progressed) {
				allowBackward = false
				continue
			}
			if (!allowBackward) {
				allowBackward = true
				continue
			}
			// Nothing connects to what is drawn: put the first one in free space,
			// which may unlock the rest.
			const el = pending.shift() as BpmnFlowElement
			this.placeNode(el, undefined, "free")
			allowBackward = false
		}
	}

	private anchorFor(
		el: BpmnFlowElement,
		allowBackward: boolean,
	): { id: string; direction: Direction } | undefined {
		if (el.type === "boundaryEvent") {
			const host = (el as BpmnBoundaryEvent).attachedToRef
			return this.shapes.has(host) ? { id: host, direction: "below" } : undefined
		}
		if (el.type === "dataObjectReference" || el.type === "dataStoreReference") {
			const user = this.dataUser(el.id)
			if (user && this.shapes.has(user)) return { id: user, direction: "above" }
			return undefined
		}
		const scope = this.scopeOf.get(el.id)
		const flows = scope?.sequenceFlows ?? []
		const preds = flows
			.filter((f) => f.targetRef === el.id && this.shapes.has(f.sourceRef))
			.map((f) => f.sourceRef)
		if (preds.length > 0) {
			// The rightmost predecessor: the new node goes after the latest of them.
			const id = preds.reduce((best, id) => (this.rightOf(id) > this.rightOf(best) ? id : best))
			// A boundary event's path leaves downwards, below its host.
			const pred = this.elements.get(id)
			return { id, direction: pred?.type === "boundaryEvent" ? "down" : "right" }
		}
		if (!allowBackward) return undefined
		const succ = flows.find((f) => f.sourceRef === el.id && this.shapes.has(f.targetRef))
		return succ ? { id: succ.targetRef, direction: "left" } : undefined
	}

	private dataUser(dataId: string): string | undefined {
		for (const el of this.elements.values()) {
			const node = el as {
				dataInputAssociations?: Array<{ sourceRefs: string[] }>
				dataOutputAssociations?: Array<{ targetRef?: string }>
			}
			if (node.dataInputAssociations?.some((a) => a.sourceRefs.includes(dataId))) return el.id
			if (node.dataOutputAssociations?.some((a) => a.targetRef === dataId)) return el.id
		}
		return undefined
	}

	private rightOf(id: string): number {
		const b = this.shapes.get(id)?.shape.bounds
		return b ? b.x + b.width : Number.NEGATIVE_INFINITY
	}

	private placeNode(el: BpmnFlowElement, anchorId: string | undefined, direction: Direction): void {
		const scope = this.scopeOf.get(el.id)
		if (!scope) return
		const plane = this.planeFor(scope)
		if (!plane) {
			this.result.unplaced.push({
				id: el.id,
				reason: `its container ${scope.id} is drawn collapsed and has no plane of its own`,
			})
			return
		}

		// A new sub-process with content: lay the content out, then place the
		// sub-process as one block of that size.
		let content: ReturnType<Placer["layoutContent"]> | undefined
		let size = ELEMENT_SIZES[el.type] ?? { width: 100, height: 80 }
		const children = (el as { flowElements?: BpmnFlowElement[] }).flowElements
		if (CONTAINER_TYPES.has(el.type) && children && children.length > 0) {
			content = this.layoutContent(el as unknown as BpmnProcess)
			size = {
				width: content.width + 2 * INNER_PADDING,
				height: content.height + SUB_PROCESS_TOP + INNER_PADDING,
			}
		}

		const lane = this.laneFor(el, anchorId, scope)
		const box = this.boxFor(scope, lane, plane)
		const label = this.labelSize(el)

		let chosen: Rect | undefined
		if (direction === "below" && anchorId) {
			chosen = this.boundarySpot(el.id, anchorId, size, label, plane)
		} else {
			chosen = this.bestSpot(el.id, size, label, anchorId, direction, box, plane)
		}
		if (!chosen) {
			this.result.unplaced.push({ id: el.id, reason: "no free spot found" })
			return
		}
		if (box) this.growToFit(box, chosen, label, plane)

		const extra: Partial<BpmnDiShape> = {}
		if (el.type === "exclusiveGateway") extra.isMarkerVisible = true
		if (content) extra.isExpanded = true
		const shape = this.addShape(plane, el.id, chosen, extra)
		if (label) shape.label = { bounds: this.labelRect(chosen, label) }
		this.result.placed.push(el.id)
		this.spotted.push(el.id)

		if (content) {
			const dx = chosen.x + INNER_PADDING - content.minX
			const dy = chosen.y + SUB_PROCESS_TOP - content.minY
			this.commitLayout(plane, content.layout, dx, dy)
		}

		if (lane && this.options.assignLanes !== false && !this.laneOf.has(el.id)) {
			lane.flowNodeRefs.push(el.id)
			this.laneOf.set(el.id, lane)
			this.result.laneAssigned.push(el.id)
		}
	}

	/** Lays out content that is entirely new, at its own origin. */
	private layoutContent(owner: BpmnProcess): {
		layout: LayoutResult
		minX: number
		minY: number
		width: number
		height: number
	} {
		const process: BpmnProcess = {
			id: owner.id,
			extensionElements: [],
			flowElements: owner.flowElements,
			sequenceFlows: owner.sequenceFlows,
			textAnnotations: [],
			associations: [],
			groups: [],
			unknownAttributes: {},
			...(owner.laneSet ? { laneSet: owner.laneSet } : {}),
		}
		const layout = layoutProcess(process)
		let minX = Number.POSITIVE_INFINITY
		let minY = Number.POSITIVE_INFINITY
		let maxX = Number.NEGATIVE_INFINITY
		let maxY = Number.NEGATIVE_INFINITY
		const extend = (b: Rect) => {
			minX = Math.min(minX, b.x)
			minY = Math.min(minY, b.y)
			maxX = Math.max(maxX, b.x + b.width)
			maxY = Math.max(maxY, b.y + b.height)
		}
		for (const node of layout.nodes) {
			extend(node.bounds)
			if (node.labelBounds) extend(node.labelBounds)
		}
		for (const lane of layout.lanes ?? []) extend(lane.bounds)
		if (!Number.isFinite(minX)) return { layout, minX: 0, minY: 0, width: 100, height: 80 }
		return { layout, minX, minY, width: maxX - minX, height: maxY - minY }
	}

	/** Writes a layout's nodes and edges onto a plane, shifted by `dx`/`dy`. */
	private commitLayout(plane: BpmnDiPlane, layout: LayoutResult, dx: number, dy: number): void {
		for (const node of layout.nodes) {
			if (this.shapes.has(node.id)) continue
			const extra: Partial<BpmnDiShape> = {}
			if (node.isExpanded !== undefined) extra.isExpanded = node.isExpanded
			if (node.type === "exclusiveGateway") extra.isMarkerVisible = true
			const shape = this.addShape(plane, node.id, shift(node.bounds, dx, dy), extra)
			if (node.labelBounds) shape.label = { bounds: round(shift(node.labelBounds, dx, dy)) }
			this.result.placed.push(node.id)
		}
		for (const edge of layout.edges) {
			if (this.edgeIds.has(edge.id)) continue
			const di: BpmnDiEdge = {
				id: this.diId(edge.id),
				bpmnElement: edge.id,
				waypoints: edge.waypoints.map((p) => ({
					x: Math.round(p.x + dx),
					y: Math.round(p.y + dy),
				})),
				unknownAttributes: {},
			}
			if (edge.labelBounds) di.label = { bounds: round(shift(edge.labelBounds, dx, dy)) }
			plane.edges.push(di)
			this.edgeIds.add(edge.id)
			this.result.routed.push(edge.id)
		}
	}

	// -------------------------------------------------------------------------
	// Where a node may go
	// -------------------------------------------------------------------------

	/** The plane a scope's content is drawn on, or undefined when it is not drawn. */
	private planeFor(scope: Scope): BpmnDiPlane | undefined {
		if (!scope.isProcess) {
			const own = this.ownPlane(scope.id)
			if (own) return own
			const sub = this.shapes.get(scope.id)
			if (!sub || sub.shape.isExpanded === false) return undefined
			return sub.plane
		}
		const participant = this.participantOf.get(scope.processId)
		if (participant) {
			const pool = this.shapes.get(participant)
			if (pool) return pool.plane
		}
		for (const diagram of this.defs.diagrams) {
			if (diagram.plane.bpmnElement === scope.processId) return diagram.plane
		}
		return this.mainPlane
	}

	private ownPlane(elementId: string): BpmnDiPlane | undefined {
		for (const diagram of this.defs.diagrams) {
			if (diagram.plane.bpmnElement === elementId && diagram.plane !== this.mainPlane) {
				return diagram.plane
			}
		}
		return undefined
	}

	private laneFor(
		el: BpmnFlowElement,
		anchorId: string | undefined,
		scope: Scope,
	): BpmnLane | undefined {
		if (!scope.isProcess) return undefined
		const own = this.laneOf.get(el.id)
		if (own) return own
		const host = el.type === "boundaryEvent" ? (el as BpmnBoundaryEvent).attachedToRef : undefined
		const via = host ?? anchorId
		if (via && this.scopeOf.get(via)?.processId === scope.processId) {
			const lane = this.laneOf.get(via)
			if (lane) return lane
		}
		// The process draws lanes but neither the node nor its anchor is listed in
		// one: use the lane the anchor is drawn in, else the first drawn lane, so the
		// node does not land across lane borders.
		const drawn = (this.lanesOfProcess.get(scope.processId) ?? []).filter(
			(l) => this.shapes.has(l.id) && !l.childLaneSet?.lanes.length,
		)
		if (drawn.length === 0) return undefined
		const anchor = via ? this.shapes.get(via)?.shape.bounds : undefined
		if (anchor) {
			const centre = {
				x: anchor.x + anchor.width / 2,
				y: anchor.y + anchor.height / 2,
				width: 0,
				height: 0,
			}
			const hit = drawn.find((l) => contains(this.shapes.get(l.id)?.shape.bounds as Rect, centre))
			if (hit) return hit
		}
		return drawn[0]
	}

	private boxFor(scope: Scope, lane: BpmnLane | undefined, plane: BpmnDiPlane): Box | undefined {
		if (!scope.isProcess) {
			if (this.ownPlane(scope.id)) return undefined
			const sub = this.shapes.get(scope.id)?.shape
			if (!sub) return undefined
			const b = sub.bounds
			const limits = this.growthLimits(sub, plane)
			return {
				id: scope.id,
				inner: {
					x: b.x + INNER_PADDING,
					y: b.y + SUB_PROCESS_TOP,
					width: b.width - 2 * INNER_PADDING,
					height: b.height - SUB_PROCESS_TOP - INNER_PADDING,
				},
				maxRight: limits.right - INNER_PADDING,
				maxBottom: limits.bottom - INNER_PADDING,
			}
		}
		const laneShape = lane ? this.shapes.get(lane.id)?.shape : undefined
		const participant = this.participantOf.get(scope.processId)
		const poolShape = participant ? this.shapes.get(participant)?.shape : undefined
		const frame = laneShape ?? poolShape
		if (!frame) return undefined
		const b = frame.bounds
		const inner = {
			x: b.x + HEADER + INNER_PADDING,
			y: b.y + INNER_PADDING / 2,
			width: b.width - HEADER - 2 * INNER_PADDING,
			height: b.height - INNER_PADDING,
		}
		return {
			id: frame.bpmnElement,
			inner,
			maxRight: Number.POSITIVE_INFINITY,
			maxBottom: inner.y + inner.height,
		}
	}

	/**
	 * How far a sub-process may grow before it runs into a shape that is not
	 * inside it, and the bottom of the lane or pool it sits in.
	 */
	private growthLimits(sub: BpmnDiShape, plane: BpmnDiPlane): { right: number; bottom: number } {
		const b = sub.bounds
		let right = Number.POSITIVE_INFINITY
		let bottom = Number.POSITIVE_INFINITY
		for (const other of plane.shapes) {
			if (other === sub || this.isContainerShape(other)) continue
			const o = other.bounds
			if (contains(b, o)) continue
			if (o.y < b.y + b.height && o.y + o.height > b.y && o.x >= b.x + b.width) {
				right = Math.min(right, o.x - MARGIN)
			}
			if (o.x < b.x + b.width && o.x + o.width > b.x && o.y >= b.y + b.height) {
				bottom = Math.min(bottom, o.y - MARGIN)
			}
		}
		for (const other of plane.shapes) {
			if (!this.isFrameShape(other)) continue
			if (contains(other.bounds, b)) {
				bottom = Math.min(bottom, other.bounds.y + other.bounds.height - INNER_PADDING / 2)
			}
		}
		return { right, bottom }
	}

	private bestSpot(
		id: string,
		size: { width: number; height: number },
		label: { width: number; height: number } | undefined,
		anchorId: string | undefined,
		direction: Direction,
		box: Box | undefined,
		plane: BpmnDiPlane,
	): Rect | undefined {
		const a = anchorId ? this.shapes.get(anchorId)?.shape.bounds : undefined
		// After a gateway, a new branch reads best as another row below the
		// existing ones, not as a shape pushed far to the right.
		const anchorType = anchorId ? this.elements.get(anchorId)?.type : undefined
		const columnWeight = anchorType?.endsWith("Gateway") ? 2 : 1
		const candidates = this.candidates(size, a, direction, box, plane, columnWeight)
		candidates.sort((p, q) => p.cost - q.cost)
		const obstacles = this.obstacles(plane, id)
		const frames = this.foreignFrames(plane, box)
		const segments = edgeSegments(plane)
		let best: Candidate | undefined
		for (const c of candidates) {
			if (best && c.cost >= best.cost) break
			const r = c.rect
			if (box && !this.fits(r, box)) continue
			if (obstacles.some((o) => overlaps(r, o, MARGIN))) continue
			if (frames.some((f) => overlaps(r, f, 0))) continue
			let cost = c.cost
			if (box) {
				const overRight = r.x + r.width - (box.inner.x + box.inner.width)
				const overBottom = r.y + r.height - (box.inner.y + box.inner.height)
				if (overRight > 0) cost += 4 + overRight / STEP
				if (overBottom > 0) cost += 4 + overBottom / STEP
			}
			if (segments.some((s) => segmentHits(s, r, 4))) cost += 6
			if (label) {
				const l = this.labelRect(r, label)
				if (obstacles.some((o) => overlaps(l, o, 2))) cost += 3
			}
			if (!best || cost < best.cost) best = { rect: r, cost }
		}
		return best?.rect
	}

	private candidates(
		size: { width: number; height: number },
		a: Rect | undefined,
		direction: Direction,
		box: Box | undefined,
		plane: BpmnDiPlane,
		columnWeight = 1,
	): Candidate[] {
		const out: Candidate[] = []
		const rows: Array<{ dy: number; cost: number }> = [{ dy: 0, cost: 0 }]
		for (let k = 1; k <= MAX_ROWS; k++) {
			const cost = 3 + (k * ROW_STEP) / 40
			rows.push({ dy: k * ROW_STEP, cost })
			rows.push({ dy: -k * ROW_STEP, cost: cost + 0.1 })
		}
		const push = (x: number, y: number, cost: number) =>
			out.push({ rect: { x: Math.round(x), y: Math.round(y), ...size }, cost })

		if (a && (direction === "right" || direction === "left")) {
			const cy = a.y + a.height / 2
			for (let c = 0; c < MAX_COLUMNS; c++) {
				const x =
					direction === "right" ? a.x + a.width + GAP + c * STEP : a.x - GAP - size.width - c * STEP
				for (const row of rows) push(x, cy + row.dy - size.height / 2, c * columnWeight + row.cost)
			}
			return out
		}
		if (a && direction === "down") {
			// Below the boundary event, clear of its label: straight down first, then
			// stepping right, as a modeller draws an exception path.
			const cx = a.x + a.width / 2
			for (let r = 0; r < MAX_ROWS; r++) {
				const y = a.y + a.height + GAP + r * ROW_STEP
				for (let c = -4; c < MAX_COLUMNS / 2; c++) {
					const cost = r * 0.5 + (c < 0 ? 2 - c : c * 0.5)
					push(cx - size.width / 2 + c * STEP, y, cost)
				}
			}
			return out
		}
		if (a && direction === "above") {
			const cx = a.x + a.width / 2
			for (let r = 0; r < MAX_ROWS; r++) {
				const y = a.y - GAP - size.height - r * ROW_STEP
				for (let c = -10; c <= 10; c++) {
					push(cx - size.width / 2 + c * STEP, y, r + Math.abs(c) * 1.5)
				}
			}
			// Below as the second choice.
			for (let r = 0; r < MAX_ROWS; r++) {
				const y = a.y + a.height + GAP + r * ROW_STEP
				for (let c = -10; c <= 10; c++) {
					push(cx - size.width / 2 + c * STEP, y, 5 + r + Math.abs(c) * 1.5)
				}
			}
			return out
		}

		// Free space: right of what the container already holds, or below it.
		const area = box?.inner ?? this.planeExtent(plane)
		const content = this.contentIn(area, plane)
		const startX = content ? content.x + content.width + GAP : area.x
		const midY = area.y + area.height / 2
		for (let c = 0; c < MAX_COLUMNS; c++) {
			for (const row of rows) {
				push(startX + c * STEP, midY + row.dy - size.height / 2, c + row.cost)
			}
		}
		const belowY = content ? content.y + content.height + GAP : area.y
		for (let r = 0; r < MAX_ROWS; r++) {
			for (let c = 0; c < 40; c++) {
				push(area.x + c * STEP, belowY + r * ROW_STEP, 2 + c * 0.5 + r)
			}
		}
		return out
	}

	/** A spot on the host's bottom border, the right-most free one; then the top border. */
	private boundarySpot(
		id: string,
		hostId: string,
		size: { width: number; height: number },
		label: { width: number; height: number } | undefined,
		plane: BpmnDiPlane,
	): Rect | undefined {
		const host = this.shapes.get(hostId)?.shape.bounds
		if (!host) return undefined
		const siblings = plane.shapes
			.filter((s) => {
				const el = this.elements.get(s.bpmnElement)
				return el?.type === "boundaryEvent" && (el as BpmnBoundaryEvent).attachedToRef === hostId
			})
			.map((s) => s.bounds)
		// The first free spot on the border, unless it or its label would sit on
		// another shape and a later spot would not.
		// The shape sits on the host's border by design; its label may not.
		const obstacles = this.obstacles(plane, id)
		const others = obstacles.filter((o) => o !== host)
		let first: Rect | undefined
		for (const y of [host.y + host.height - size.height / 2, host.y - size.height / 2]) {
			for (let x = host.x + host.width - size.width - 8; x >= host.x + 4; x -= 6) {
				const r = { x: Math.round(x), y: Math.round(y), ...size }
				if (siblings.some((s) => overlaps(r, s, 6))) continue
				first ??= r
				const l = label ? this.labelRect(r, label) : undefined
				if (others.some((o) => overlaps(r, o, 0))) continue
				if (l !== undefined && obstacles.some((o) => overlaps(l, o, 0))) continue
				return r
			}
		}
		if (first) return first
		this.result.unplaced.push({ id, reason: `no room left on the border of ${hostId}` })
		return undefined
	}

	private fits(r: Rect, box: Box): boolean {
		return (
			r.x >= box.inner.x &&
			r.y >= box.inner.y &&
			r.x + r.width <= box.maxRight &&
			r.y + r.height <= box.maxBottom
		)
	}

	/** Widens (or for a sub-process, deepens) the container and what holds it. */
	private growToFit(
		box: Box,
		r: Rect,
		label: { width: number; height: number } | undefined,
		plane: BpmnDiPlane,
	): void {
		const l = label ? this.labelRect(r, label) : r
		const needRight = Math.max(r.x + r.width, l.x + l.width) + INNER_PADDING
		const needBottom = r.y + r.height + INNER_PADDING
		this.growShape(box.id, needRight, needBottom, plane)
	}

	private growShape(elementId: string, right: number, bottom: number, plane: BpmnDiPlane): void {
		const entry = this.shapes.get(elementId)
		if (!entry) return
		const shape = entry.shape
		const b = shape.bounds
		const isSub = CONTAINER_TYPES.has(this.elements.get(elementId)?.type ?? "")
		let changed = false
		if (right > b.x + b.width) {
			b.width = Math.round(right - b.x)
			changed = true
		}
		if (isSub && bottom > b.y + b.height) {
			b.height = Math.round(bottom - b.y)
			changed = true
		}
		if (!changed) return
		this.result.resized.push(elementId)
		const edge = b.x + b.width
		if (isSub) {
			// What holds the sub-process grows with it.
			for (const other of plane.shapes) {
				if (other === shape || !this.isContainerShape(other)) continue
				const holds = contains(other.bounds, { x: b.x, y: b.y, width: 1, height: 1 })
				if (!holds || contains(other.bounds, b)) continue
				this.growShape(
					other.bpmnElement,
					edge + INNER_PADDING,
					b.y + b.height + INNER_PADDING,
					plane,
				)
			}
			return
		}
		// A lane or pool: every frame of the same pool shares its right edge.
		const pool = this.poolOfFrame(elementId)
		if (!pool) return
		for (const frameId of [pool.participantId, ...pool.laneIds]) {
			if (frameId === elementId) continue
			const frame = this.shapes.get(frameId)?.shape
			if (!frame || frame.bounds.x + frame.bounds.width >= edge) continue
			frame.bounds.width = Math.round(edge - frame.bounds.x)
			this.result.resized.push(frameId)
		}
	}

	private poolOfFrame(elementId: string): { participantId: string; laneIds: string[] } | undefined {
		for (const [processId, lanes] of this.lanesOfProcess) {
			const participantId = this.participantOf.get(processId)
			if (!participantId) continue
			if (participantId === elementId || lanes.some((l) => l.id === elementId)) {
				return { participantId, laneIds: lanes.map((l) => l.id) }
			}
		}
		return undefined
	}

	// -------------------------------------------------------------------------
	// Annotations and lanes
	// -------------------------------------------------------------------------

	private placeAnnotations(): void {
		for (const annotation of this.annotations.values()) {
			if (this.shapes.has(annotation.id)) continue
			const association = this.allAssociations().find(
				(a) => a.sourceRef === annotation.id || a.targetRef === annotation.id,
			)
			const anchorId =
				association &&
				(association.sourceRef === annotation.id ? association.targetRef : association.sourceRef)
			const anchor = anchorId ? this.shapes.get(anchorId) : undefined
			const plane = anchor?.plane ?? this.mainPlane
			const lines = Math.max(1, Math.ceil(((annotation.text ?? "").length * 7) / ANNOTATION_WIDTH))
			const size = { width: ANNOTATION_WIDTH, height: Math.max(30, lines * LABEL_HEIGHT + 12) }
			const scope = anchorId ? this.scopeOf.get(anchorId) : undefined
			const box = scope ? this.boxFor(scope, this.laneOf.get(anchorId ?? ""), plane) : undefined
			const spot = this.bestSpot(
				annotation.id,
				size,
				undefined,
				anchor ? anchorId : undefined,
				anchor ? "above" : "free",
				box,
				plane,
			)
			if (!spot) {
				this.result.unplaced.push({ id: annotation.id, reason: "no free spot found" })
				continue
			}
			if (box) this.growToFit(box, spot, undefined, plane)
			this.addShape(plane, annotation.id, spot, {})
			this.result.placed.push(annotation.id)
			this.spotted.push(annotation.id)
		}
	}

	/**
	 * Placement keeps new shapes clear of others when it can, but a crowded
	 * spot (a boundary event's border, a label) can leave no clean choice. Say
	 * so instead of reporting a clean result over a diagram that reads wrong.
	 */
	private reportOverlaps(): void {
		for (const id of this.spotted) {
			const own = this.shapes.get(id)
			// A sub-process drawn around its content overlaps that content by design.
			if (!own || this.isContainerShape(own.shape)) continue
			const host = (this.elements.get(id) as { attachedToRef?: string } | undefined)?.attachedToRef
			const mine = [own.shape.bounds, ...(own.shape.label?.bounds ? [own.shape.label.bounds] : [])]
			const clash = own.plane.shapes.find((other) => {
				if (other.bpmnElement === id || this.isContainerShape(other)) return false
				const theirHost = (this.elements.get(other.bpmnElement) as { attachedToRef?: string })
					?.attachedToRef
				// A boundary event sits on its host's border by design.
				if (other.bpmnElement === host || theirHost === id) return false
				const theirs = [other.bounds, ...(other.label?.bounds ? [other.label.bounds] : [])]
				return mine.some((m) => theirs.some((t) => overlaps(m, t, 0)))
			})
			if (!clash) continue
			this.result.unplaced.push({
				id,
				reason: `placed, but it or its label overlaps "${clash.bpmnElement}"; existing shapes do not move, so move one by hand or redraw with applyAutoLayout`,
			})
		}
	}

	private reportLanes(): void {
		for (const [processId, lanes] of this.lanesOfProcess) {
			const participant = this.participantOf.get(processId)
			if (!participant || !this.shapes.has(participant)) continue
			if (!lanes.some((l) => this.shapes.has(l.id))) continue
			for (const lane of lanes) {
				if (this.shapes.has(lane.id)) continue
				this.result.unplaced.push({
					id: lane.id,
					reason:
						"a new lane needs room in its pool, which moves the lanes below; draw it by hand or run applyAutoLayout",
				})
			}
		}
	}

	// -------------------------------------------------------------------------
	// Edges
	// -------------------------------------------------------------------------

	private routeEdges(): void {
		const connections: Array<{
			id: string
			sourceRef: string
			targetRef: string
			kind: "sequence" | "message" | "association"
			name?: string
		}> = []
		for (const scope of this.scopes.values()) {
			for (const f of scope.sequenceFlows) {
				connections.push({
					id: f.id,
					sourceRef: f.sourceRef,
					targetRef: f.targetRef,
					kind: "sequence",
					...(f.name ? { name: f.name } : {}),
				})
			}
		}
		for (const a of this.allAssociations()) {
			connections.push({
				id: a.id,
				sourceRef: a.sourceRef,
				targetRef: a.targetRef,
				kind: "association",
			})
		}
		for (const collaboration of this.defs.collaborations) {
			for (const m of collaboration.messageFlows) {
				connections.push({
					id: m.id,
					sourceRef: m.sourceRef,
					targetRef: m.targetRef,
					kind: "message",
					...(m.name ? { name: m.name } : {}),
				})
			}
		}
		for (const el of this.elements.values()) {
			const node = el as {
				dataInputAssociations?: Array<{ id?: string; sourceRefs: string[] }>
				dataOutputAssociations?: Array<{ id?: string; targetRef?: string }>
			}
			for (const a of node.dataInputAssociations ?? []) {
				const source = a.sourceRefs[0]
				if (a.id && source)
					connections.push({ id: a.id, sourceRef: source, targetRef: el.id, kind: "association" })
			}
			for (const a of node.dataOutputAssociations ?? []) {
				if (a.id && a.targetRef)
					connections.push({
						id: a.id,
						sourceRef: el.id,
						targetRef: a.targetRef,
						kind: "association",
					})
			}
		}

		const existing = new Map<string, { edge: BpmnDiEdge; plane: BpmnDiPlane }>()
		for (const diagram of this.defs.diagrams) {
			for (const edge of diagram.plane.edges)
				existing.set(edge.bpmnElement, { edge, plane: diagram.plane })
		}

		for (const c of connections) {
			const source = this.shapes.get(c.sourceRef)
			const target = this.shapes.get(c.targetRef)
			const current = existing.get(c.id)
			if (current) {
				if (this.options.rerouteStale === false || !source || !target) continue
				const wps = current.edge.waypoints
				const first = wps[0]
				const last = wps[wps.length - 1]
				if (
					first &&
					last &&
					distance(first, source.shape.bounds) <= STALE_DISTANCE &&
					distance(last, target.shape.bounds) <= STALE_DISTANCE
				) {
					continue
				}
				current.edge.waypoints = this.route(c.kind, source.shape, target.shape, current.plane, c.id)
				if (c.name && current.edge.label) {
					current.edge.label.bounds = this.edgeLabel(current.edge.waypoints, c.name, current.plane)
				}
				this.result.rerouted.push(c.id)
				continue
			}
			if (!source || !target) {
				// A data association to an undrawn data object is not an error; anything
				// else is worth reporting.
				if (
					this.elements.get(c.sourceRef)?.type !== "dataObject" &&
					this.elements.get(c.targetRef)?.type !== "dataObject"
				) {
					this.result.unplaced.push({ id: c.id, reason: "one of its ends has no shape" })
				}
				continue
			}
			const plane = c.kind === "message" ? this.mainPlane : target.plane
			const di: BpmnDiEdge = {
				id: this.diId(c.id),
				bpmnElement: c.id,
				waypoints: this.route(c.kind, source.shape, target.shape, plane, c.id),
				unknownAttributes: {},
			}
			if (c.name) di.label = { bounds: this.edgeLabel(di.waypoints, c.name, plane) }
			plane.edges.push(di)
			this.edgeIds.add(c.id)
			this.result.routed.push(c.id)
		}
	}

	private route(
		kind: "sequence" | "message" | "association",
		source: BpmnDiShape,
		target: BpmnDiShape,
		plane: BpmnDiPlane,
		edgeId: string,
	): Waypoint[] {
		const s = source.bounds
		const t = target.bounds
		const sourcePool = this.participants.has(source.bpmnElement)
		const targetPool = this.participants.has(target.bpmnElement)
		if (kind === "message" && (sourcePool || targetPool)) {
			// A pool end docks straight above or below the other end.
			const x = Math.round(
				sourcePool && targetPool
					? (Math.max(s.x, t.x) + Math.min(s.x + s.width, t.x + t.width)) / 2
					: sourcePool
						? clamp(t.x + t.width / 2, s.x + HEADER, s.x + s.width)
						: clamp(s.x + s.width / 2, t.x + HEADER, t.x + t.width),
			)
			const down = s.y + s.height / 2 < t.y + t.height / 2
			return [
				{ x, y: Math.round(down ? s.y + s.height : s.y) },
				{ x, y: Math.round(down ? t.y : t.y + t.height) },
			]
		}

		const sourceEl = this.elements.get(source.bpmnElement)
		const targetEl = this.elements.get(target.bpmnElement)
		const exempt = new Set([source.bpmnElement, target.bpmnElement])
		for (const el of [sourceEl, targetEl]) {
			if (el?.type === "boundaryEvent") exempt.add((el as BpmnBoundaryEvent).attachedToRef)
		}
		for (const shape of plane.shapes) {
			const el = this.elements.get(shape.bpmnElement)
			if (el?.type === "boundaryEvent" && exempt.has((el as BpmnBoundaryEvent).attachedToRef)) {
				exempt.add(shape.bpmnElement)
			}
		}
		const obstacles = plane.shapes
			.filter((sh) => !exempt.has(sh.bpmnElement) && !this.isContainerShape(sh))
			.map((sh) => sh.bounds)

		const sCx = s.x + s.width / 2
		const sCy = s.y + s.height / 2
		const tCy = t.y + t.height / 2
		if (kind === "sequence" && Math.abs(sCy - tCy) < 1 && t.x > s.x + s.width) {
			const straight = [
				{ x: Math.round(s.x + s.width), y: Math.round(sCy) },
				{ x: Math.round(t.x), y: Math.round(tCy) },
			]
			if (!obstacles.some((o) => segmentHits(straight as [Waypoint, Waypoint], o, 0))) {
				return straight
			}
		}

		let from: Port[]
		let to: Port[]
		if (kind === "sequence") {
			const fromBoundary = sourceEl?.type === "boundaryEvent"
			const hostTop = fromBoundary
				? this.shapes.get((sourceEl as BpmnBoundaryEvent).attachedToRef)?.shape.bounds
				: undefined
			const boundarySide: Side | undefined = hostTop
				? Math.abs(sCy - hostTop.y) < Math.abs(sCy - (hostTop.y + hostTop.height))
					? "top"
					: "bottom"
				: undefined
			from = boundarySide
				? sidePorts(s, sideOnly(boundarySide))
				: sidePorts(s, { right: 0, top: 15, bottom: 15, left: 120 })
			to = sidePorts(t, { left: 0, top: 15, bottom: 15, right: 120 })
		} else if (kind === "message") {
			const down = sCy < tCy
			from = sidePorts(
				s,
				down
					? { bottom: 0, left: 60, right: 60, top: 120 }
					: { top: 0, left: 60, right: 60, bottom: 120 },
			)
			to = sidePorts(
				t,
				down
					? { top: 0, left: 60, right: 60, bottom: 120 }
					: { bottom: 0, left: 60, right: 60, top: 120 },
			)
		} else {
			from = sidePorts(s)
			to = sidePorts(t)
		}
		const others = edgeSegments(plane, edgeId)
		const route = routeOrthogonal({
			from,
			to,
			obstacles,
			crossings: (a, b) => countCrossings(a, b, others),
		})
		if (route) return route.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) }))
		// No clear route at all: an elbow between facing sides.
		const midX = Math.round((s.x + s.width + t.x) / 2)
		return [
			{ x: Math.round(s.x + s.width), y: Math.round(sCy) },
			{ x: midX, y: Math.round(sCy) },
			{ x: midX, y: Math.round(tCy) },
			{ x: Math.round(t.x), y: Math.round(tCy) },
		].filter((p, i, all) => i === 0 || p.x !== all[i - 1]?.x || p.y !== all[i - 1]?.y)
	}

	/** A spot for a flow's name next to its first segments, clear of shapes and other labels. */
	private edgeLabel(waypoints: Waypoint[], name: string, plane: BpmnDiPlane): Rect {
		const width = Math.min(Math.max(name.length * 7, 40), 120)
		const height = LABEL_HEIGHT * Math.max(1, Math.ceil((name.length * 7) / width))
		const taken: Rect[] = []
		for (const shape of plane.shapes) {
			if (!this.isContainerShape(shape)) taken.push(shape.bounds)
			if (shape.label?.bounds) taken.push(shape.label.bounds)
		}
		for (const edge of plane.edges) if (edge.label?.bounds) taken.push(edge.label.bounds)
		const spots: Rect[] = []
		for (let i = 1; i < Math.min(waypoints.length, 4); i++) {
			const p = waypoints[i - 1] as Waypoint
			const q = waypoints[i] as Waypoint
			if (p.y === q.y) {
				const x = Math.min(p.x, q.x) + 6
				spots.push({ x, y: p.y - height - 4, width, height })
				spots.push({ x, y: p.y + 4, width, height })
			} else {
				const y = q.y > p.y ? p.y + 6 : p.y - height - 6
				spots.push({ x: p.x + 6, y, width, height })
				spots.push({ x: p.x - width - 6, y, width, height })
			}
		}
		const free = spots.find((r) => !taken.some((t) => overlaps(r, t, 2)))
		return round(free ?? spots[0] ?? { x: 0, y: 0, width, height })
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	private allAssociations(): BpmnAssociation[] {
		const out: BpmnAssociation[] = []
		for (const scope of this.scopes.values()) out.push(...scope.associations)
		for (const collaboration of this.defs.collaborations) out.push(...collaboration.associations)
		return out
	}

	private labelSize(el: BpmnFlowElement): { width: number; height: number } | undefined {
		const name = el.name
		if (!name) return undefined
		const width = externalLabelWidth(el.type, name)
		if (width === undefined) return undefined
		return { width, height: LABEL_HEIGHT }
	}

	private labelRect(shape: Rect, label: { width: number; height: number }): Rect {
		return {
			x: Math.round(shape.x + shape.width / 2 - label.width / 2),
			y: Math.round(shape.y + shape.height + 4),
			width: label.width,
			height: label.height,
		}
	}

	/** Pools and lanes: frames drawn around other shapes. */
	private isFrameShape(shape: BpmnDiShape): boolean {
		return (
			this.participants.has(shape.bpmnElement) ||
			[...this.lanesOfProcess.values()].some((lanes) =>
				lanes.some((l) => l.id === shape.bpmnElement),
			)
		)
	}

	/** Frames, and sub-processes drawn expanded around their content. */
	private isContainerShape(shape: BpmnDiShape): boolean {
		if (this.isFrameShape(shape)) return true
		const type = this.elements.get(shape.bpmnElement)?.type
		return type !== undefined && CONTAINER_TYPES.has(type) && shape.isExpanded !== false
	}

	/** Everything a new shape must keep clear of: shapes that are not frames, and their labels. */
	private obstacles(plane: BpmnDiPlane, self: string): Rect[] {
		const out: Rect[] = []
		for (const shape of plane.shapes) {
			if (shape.bpmnElement === self) continue
			if (this.isContainerShape(shape)) continue
			out.push(shape.bounds)
			if (shape.label?.bounds) out.push(shape.label.bounds)
		}
		return out
	}

	/** Containers the new shape is not inside, so it may not cross their border. */
	private foreignFrames(plane: BpmnDiPlane, box: Box | undefined): Rect[] {
		const own = box ? this.shapes.get(box.id)?.shape.bounds : undefined
		return plane.shapes
			.filter((shape) => {
				if (!this.isContainerShape(shape)) return false
				if (!own) return true
				// Ancestors of the box (its pool, its parent lane) contain it.
				return !contains(shape.bounds, own)
			})
			.map((shape) => shape.bounds)
	}

	private planeExtent(plane: BpmnDiPlane): Rect {
		if (plane.shapes.length === 0) return { x: 0, y: 0, width: 600, height: 200 }
		const xs = plane.shapes.map((s) => s.bounds)
		const minX = Math.min(...xs.map((b) => b.x))
		const minY = Math.min(...xs.map((b) => b.y))
		const maxY = Math.max(...xs.map((b) => b.y + b.height))
		const maxX = Math.max(...xs.map((b) => b.x + b.width))
		return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
	}

	private contentIn(area: Rect, plane: BpmnDiPlane): Rect | undefined {
		const inside = plane.shapes
			.filter((s) => !this.isFrameShape(s) && contains(area, s.bounds))
			.map((s) => s.bounds)
		if (inside.length === 0) return undefined
		const minX = Math.min(...inside.map((b) => b.x))
		const minY = Math.min(...inside.map((b) => b.y))
		const maxX = Math.max(...inside.map((b) => b.x + b.width))
		const maxY = Math.max(...inside.map((b) => b.y + b.height))
		return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
	}

	private addShape(
		plane: BpmnDiPlane,
		elementId: string,
		bounds: Rect,
		extra: Partial<BpmnDiShape>,
	): BpmnDiShape {
		const shape: BpmnDiShape = {
			id: this.diId(elementId),
			bpmnElement: elementId,
			...extra,
			bounds: round(bounds),
			unknownAttributes: {},
		}
		plane.shapes.push(shape)
		this.shapes.set(elementId, { shape, plane })
		return shape
	}

	private diId(elementId: string): string {
		let id = `${elementId}_di`
		for (let n = 2; this.diIds.has(id); n++) id = `${elementId}_di_${n}`
		this.diIds.add(id)
		return id
	}
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

function round(b: Rect): Rect {
	return {
		x: Math.round(b.x),
		y: Math.round(b.y),
		width: Math.round(b.width),
		height: Math.round(b.height),
	}
}

function shift(b: Rect, dx: number, dy: number): Rect {
	return { x: b.x + dx, y: b.y + dy, width: b.width, height: b.height }
}

function clamp(v: number, lo: number, hi: number): number {
	return Math.min(Math.max(v, lo), hi)
}

function overlaps(a: Rect, b: Rect, margin: number): boolean {
	return (
		a.x < b.x + b.width + margin &&
		b.x < a.x + a.width + margin &&
		a.y < b.y + b.height + margin &&
		b.y < a.y + a.height + margin
	)
}

function contains(outer: Rect, inner: Rect): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

function distance(p: Waypoint, r: Rect): number {
	const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.width))
	const dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.height))
	return Math.hypot(dx, dy)
}

function sideOnly(side: Side): Partial<Record<Side, number>> {
	const all: Side[] = ["top", "right", "bottom", "left"]
	const out: Partial<Record<Side, number>> = {}
	for (const s of all) out[s] = s === side ? 0 : Number.POSITIVE_INFINITY
	return out
}

type Segment = [Waypoint, Waypoint]

function edgeSegments(plane: BpmnDiPlane, skip?: string): Segment[] {
	const out: Segment[] = []
	for (const edge of plane.edges) {
		if (edge.bpmnElement === skip) continue
		for (let i = 1; i < edge.waypoints.length; i++) {
			out.push([edge.waypoints[i - 1] as Waypoint, edge.waypoints[i] as Waypoint])
		}
	}
	return out
}

/** Whether a segment passes through a rectangle grown by `margin`. */
function segmentHits([p, q]: Segment, r: Rect, margin: number): boolean {
	const x0 = r.x - margin
	const y0 = r.y - margin
	const x1 = r.x + r.width + margin
	const y1 = r.y + r.height + margin
	if (Math.max(p.x, q.x) <= x0 || Math.min(p.x, q.x) >= x1) return false
	if (Math.max(p.y, q.y) <= y0 || Math.min(p.y, q.y) >= y1) return false
	if (p.x === q.x || p.y === q.y) return true
	// A diagonal segment: test it against the rectangle by clipping.
	let t0 = 0
	let t1 = 1
	const dx = q.x - p.x
	const dy = q.y - p.y
	const clip = (pp: number, qq: number): boolean => {
		if (pp === 0) return qq >= 0
		const t = qq / pp
		if (pp < 0) {
			if (t > t1) return false
			if (t > t0) t0 = t
		} else {
			if (t < t0) return false
			if (t < t1) t1 = t
		}
		return true
	}
	return clip(-dx, p.x - x0) && clip(dx, x1 - p.x) && clip(-dy, p.y - y0) && clip(dy, y1 - p.y)
}

/** How many other segments the orthogonal segment a→b crosses. */
function countCrossings(a: Waypoint, b: Waypoint, others: Segment[]): number {
	let n = 0
	const horizontal = a.y === b.y
	for (const [p, q] of others) {
		if (horizontal && p.x === q.x) {
			if (
				p.x > Math.min(a.x, b.x) &&
				p.x < Math.max(a.x, b.x) &&
				a.y > Math.min(p.y, q.y) &&
				a.y < Math.max(p.y, q.y)
			) {
				n++
			}
		} else if (!horizontal && p.y === q.y) {
			if (
				p.y > Math.min(a.y, b.y) &&
				p.y < Math.max(a.y, b.y) &&
				a.x > Math.min(p.x, q.x) &&
				a.x < Math.max(p.x, q.x)
			) {
				n++
			}
		}
	}
	return n
}
