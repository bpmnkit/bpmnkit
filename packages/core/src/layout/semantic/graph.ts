import type { BpmnBoundaryEvent, BpmnFlowElement, BpmnSequenceFlow } from "../../bpmn/bpmn-model.js"

/** Flow-node types that end a path — used to score candidate spine edges. */
const END_TYPES = new Set(["endEvent"])

/**
 * Adjacency for one process scope, with cycles broken and ranks assigned.
 *
 * Boundary events are not ranked themselves: they dock onto their host, and an
 * implicit host → handler edge carries their successors forward instead. That
 * keeps a handler path strictly to the right of the activity it guards.
 */
export interface SemanticGraph {
	/** Rankable flow nodes, in declaration order. Boundary events excluded. */
	nodes: BpmnFlowElement[]
	byId: Map<string, BpmnFlowElement>
	outgoing: Map<string, BpmnSequenceFlow[]>
	incoming: Map<string, BpmnSequenceFlow[]>
	/** hostId → boundary events attached to it, in declaration order. */
	attachers: Map<string, BpmnBoundaryEvent[]>
	/** Ids of sequence flows that close a cycle; excluded from ranking. */
	backEdges: Set<string>
	/** Weakly connected components, each a node-id list in declaration order. */
	components: string[][]
	/** Semantic start node id per component, index-aligned with `components`. */
	starts: string[]
	/** Longest-path rank per node id. */
	ranks: Map<string, number>
	/** Lazily built: ids from which an end (or terminal) node is reachable. See {@link reachesEnd}. */
	endReach?: Set<string>
	/** Nodes of the handlers placed on an exception row by `placeExceptionRow`. */
	exceptionRow: Set<string>
	/**
	 * Stack one-node detours under their sibling target. Off inside pools, where
	 * message routing depends on the pool's shape, and inside containers.
	 */
	stackDetours: boolean
	/** Ids of flows between adjacent lanes that share their source's column; see `laneHandoffs`. */
	handoffs: Set<string>
}

/**
 * The node a flow leaves from for layout purposes. A flow out of a boundary
 * event belongs to the host's position, not the event's.
 */
function effectiveSource(flow: BpmnSequenceFlow, byId: Map<string, BpmnFlowElement>): string {
	const source = byId.get(flow.sourceRef)
	if (source?.type === "boundaryEvent") return (source as BpmnBoundaryEvent).attachedToRef
	return flow.sourceRef
}

export function buildSemanticGraph(
	flowElements: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
	/** Stack one-node detours under their sibling target; see {@link feedsSibling}. */
	stackDetours = false,
): SemanticGraph {
	const byId = new Map<string, BpmnFlowElement>()
	for (const el of flowElements) byId.set(el.id, el)

	const nodes: BpmnFlowElement[] = []
	const attachers = new Map<string, BpmnBoundaryEvent[]>()
	for (const el of flowElements) {
		// A data object has no shape: its references are what a diagram draws.
		if (el.type === "dataObject") continue
		if (el.type === "boundaryEvent") {
			const be = el as BpmnBoundaryEvent
			const list = attachers.get(be.attachedToRef)
			if (list) list.push(be)
			else attachers.set(be.attachedToRef, [be])
		} else {
			nodes.push(el)
		}
	}

	const outgoing = new Map<string, BpmnSequenceFlow[]>()
	const incoming = new Map<string, BpmnSequenceFlow[]>()
	for (const flow of sequenceFlows) {
		const from = effectiveSource(flow, byId)
		if (!byId.has(from) || !byId.has(flow.targetRef)) continue
		const out = outgoing.get(from)
		if (out) out.push(flow)
		else outgoing.set(from, [flow])
		const inc = incoming.get(flow.targetRef)
		if (inc) inc.push(flow)
		else incoming.set(flow.targetRef, [flow])
	}

	const graph: SemanticGraph = {
		nodes,
		byId,
		outgoing,
		incoming,
		attachers,
		backEdges: new Set(),
		components: [],
		starts: [],
		ranks: new Map(),
		exceptionRow: new Set(),
		stackDetours,
		handoffs: new Set(),
	}

	findComponents(graph)
	markBackEdges(graph)
	assignRanks(graph)
	return graph
}

/** Weakly connected components, discovered in declaration order. */
function findComponents(graph: SemanticGraph): void {
	const seen = new Set<string>()
	for (const node of graph.nodes) {
		if (seen.has(node.id)) continue
		const members: string[] = []
		const stack = [node.id]
		while (stack.length > 0) {
			const id = stack.pop()
			if (id === undefined || seen.has(id)) continue
			seen.add(id)
			members.push(id)
			for (const f of graph.outgoing.get(id) ?? []) stack.push(f.targetRef)
			for (const f of graph.incoming.get(id) ?? []) stack.push(effectiveSource(f, graph.byId))
		}
		// Declaration order within the component keeps ties deterministic.
		const order = new Map(graph.nodes.map((n, i) => [n.id, i]))
		members.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
		graph.components.push(members)
		graph.starts.push(pickStart(members, graph))
	}
}

/**
 * A component starts at its earliest declared start event, else its earliest
 * node with no incoming flow, else its earliest declared node.
 */
function pickStart(members: string[], graph: SemanticGraph): string {
	const startEvent = members.find((id) => graph.byId.get(id)?.type === "startEvent")
	if (startEvent) return startEvent
	const source = members.find((id) => (graph.incoming.get(id) ?? []).length === 0)
	return source ?? members[0] ?? ""
}

/**
 * Depth-first from each semantic start; an edge onto a node already on the
 * traversal stack closes a cycle and is excluded from ranking.
 */
function markBackEdges(graph: SemanticGraph): void {
	const state = new Map<string, "open" | "done">()

	const visit = (id: string): void => {
		state.set(id, "open")
		for (const flow of graph.outgoing.get(id) ?? []) {
			const target = flow.targetRef
			const targetState = state.get(target)
			if (targetState === "open") graph.backEdges.add(flow.id)
			else if (targetState === undefined) visit(target)
		}
		state.set(id, "done")
	}

	for (const start of graph.starts) if (start && !state.has(start)) visit(start)
	// Nodes only reachable through a cycle still need a traversal root.
	for (const node of graph.nodes) if (!state.has(node.id)) visit(node.id)
}

const GATEWAY_TYPES = new Set([
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
	"complexGateway",
])

/** True when a node merges more than one path. */
function isJoin(graph: SemanticGraph, id: string): boolean {
	return (graph.incoming.get(id) ?? []).length > 1
}

/**
 * Nested joins of one gateway type may share a rank and connect vertically —
 * closing an inner branch and the branch around it is one moment in the flow,
 * not two. Joins of different types keep their forward step, because the change
 * of gateway is itself part of the story.
 */
function sharesRank(graph: SemanticGraph, flow: BpmnSequenceFlow): boolean {
	const source = graph.byId.get(flow.sourceRef)
	const target = graph.byId.get(flow.targetRef)
	if (!source || !target) return false
	if (source.type !== target.type || !GATEWAY_TYPES.has(source.type)) return false
	return isJoin(graph, source.id) && isJoin(graph, target.id)
}

/**
 * A one-node detour of a split that leads straight into the split's other
 * target (order pigment, then mix paint) shares that target's column: it is
 * stacked under (or over) it and flows in vertically, instead of pushing the
 * target and everything after it one column right. True for the detour's
 * flow into that target.
 */
function feedsSibling(graph: SemanticGraph, flow: BpmnSequenceFlow): boolean {
	if (!graph.stackDetours) return false
	const into = graph.incoming.get(flow.sourceRef) ?? []
	const out = graph.outgoing.get(flow.sourceRef) ?? []
	if (into.length !== 1 || out.length !== 1) return false
	const split = into[0] as BpmnSequenceFlow
	if (graph.byId.get(split.sourceRef)?.type === "boundaryEvent") return false
	if (graph.backEdges.has(split.id) || graph.backEdges.has(flow.id)) return false
	return (graph.outgoing.get(split.sourceRef) ?? []).some(
		(f) => f.targetRef === flow.targetRef && f !== split && !graph.backEdges.has(f.id),
	)
}

/** True when `id` is a detour stacked under its sibling target (see {@link feedsSibling}). */
export function isDetour(graph: SemanticGraph, id: string): boolean {
	const out = graph.outgoing.get(id) ?? []
	return out.length === 1 && feedsSibling(graph, out[0] as BpmnSequenceFlow)
}

/** True when `flow` enters a detour that {@link feedsSibling}: the spine takes the sibling instead. */
export function entersDetour(graph: SemanticGraph, flow: BpmnSequenceFlow): boolean {
	return isDetour(graph, flow.targetRef)
}

interface HandlerEntry {
	host: string
	/** The side the event docks on: -1 top, 1 bottom. Handlers on one side share a row. */
	side: 1 | -1
	flows: BpmnSequenceFlow[]
}

/**
 * The entry flows of each boundary event's handler, in host then event order.
 * Only a handler entered by that flow alone is listed: a shared target belongs
 * to whatever else reaches it.
 */
function handlerEntries(
	graph: SemanticGraph,
	sideOf: (event: BpmnBoundaryEvent, host: string) => 1 | -1,
): HandlerEntry[] {
	const entries: HandlerEntry[] = []
	for (const [host, events] of graph.attachers) {
		for (const event of events) {
			const flows = (graph.outgoing.get(host) ?? []).filter(
				(f) =>
					f.sourceRef === event.id &&
					!graph.backEdges.has(f.id) &&
					(graph.incoming.get(f.targetRef) ?? []).length === 1,
			)
			if (flows.length === 0) continue
			// A rework loop (handler leads back to an earlier merge) is no exception
			// path: its back edge routes below the diagram anyway, so a row of its
			// own would only push the other branches down.
			if (flows.some((f) => loopsBack(graph, f.targetRef))) continue
			entries.push({ host, side: sideOf(event, host), flows })
		}
	}
	return entries
}

/** True when the handler chain starting at `entry` leaves through a back edge. */
function loopsBack(graph: SemanticGraph, entry: string): boolean {
	for (const id of chainOf(graph, entry))
		if ((graph.outgoing.get(id) ?? []).some((f) => graph.backEdges.has(f.id))) return true
	return false
}

/** The nodes only `entry` leads to: it, and successors reached from nowhere else. */
function chainOf(graph: SemanticGraph, entry: string): Set<string> {
	const chain = new Set([entry])
	const stack = [entry]
	while (stack.length > 0) {
		const id = stack.pop() as string
		for (const f of graph.outgoing.get(id) ?? []) {
			if (graph.backEdges.has(f.id) || chain.has(f.targetRef)) continue
			if ((graph.incoming.get(f.targetRef) ?? []).length !== 1) continue
			chain.add(f.targetRef)
			stack.push(f.targetRef)
		}
	}
	return chain
}

/**
 * Longest-path ranks over the acyclic remainder, then a bounded fixed point so
 * a boundary handler never precedes the activity it is attached to. `steps`
 * overrides the one-rank step of individual flows.
 */
export function assignRanks(
	graph: SemanticGraph,
	steps: ReadonlyMap<string, number> = new Map(),
): void {
	const { ranks } = graph
	for (const node of graph.nodes) ranks.set(node.id, 0)

	const forward = (id: string): BpmnSequenceFlow[] =>
		(graph.outgoing.get(id) ?? []).filter((f) => !graph.backEdges.has(f.id))

	// Longest path: relax every edge until no rank grows. |V| passes suffice
	// because the remaining graph is acyclic.
	for (let pass = 0; pass < graph.nodes.length + 1; pass++) {
		let changed = false
		for (const node of graph.nodes) {
			const rank = ranks.get(node.id) ?? 0
			for (const flow of forward(node.id)) {
				const step =
					sharesRank(graph, flow) || feedsSibling(graph, flow) || graph.handoffs.has(flow.id)
						? 0
						: (steps.get(flow.id) ?? 1)
				const target = ranks.get(flow.targetRef) ?? 0
				if (target < rank + step) {
					ranks.set(flow.targetRef, rank + step)
					changed = true
				}
			}
		}
		if (!changed) break
	}

	// Normalize each component so its start sits at rank 0.
	for (let i = 0; i < graph.components.length; i++) {
		const members = graph.components[i]
		if (!members) continue
		let min = Number.POSITIVE_INFINITY
		for (const id of members) min = Math.min(min, ranks.get(id) ?? 0)
		if (min === 0 || !Number.isFinite(min)) continue
		for (const id of members) ranks.set(id, (ranks.get(id) ?? 0) - min)
	}
}

/**
 * Exception row: re-rank so a boundary handler starts in its host's own column
 * and its flow drops straight down (or up) from the event, onto a row the
 * handlers of the spine share. A second event on one host fans out one column
 * right. A handler whose column is taken (a sibling branch on that side, or an
 * earlier handler's tail) keeps its step to the right, as before.
 *
 * Needs the hosts' bands, so it runs after a first band assignment; returns
 * true when ranks changed and bands must be assigned again.
 */
export function placeExceptionRow(
	graph: SemanticGraph,
	bands: ReadonlyMap<string, number>,
	sideOf: (event: BpmnBoundaryEvent, host: string) => 1 | -1,
): boolean {
	const entries = handlerEntries(graph, sideOf)
	if (entries.length === 0) return false
	const componentOf = new Map<string, number>()
	graph.components.forEach((members, i) => {
		for (const id of members) componentOf.set(id, i)
	})
	const chains = new Map<string, Set<string>>()
	const handlerNodes = new Set<string>()
	for (const entry of entries) {
		for (const flow of entry.flows) {
			const chain = chainOf(graph, flow.targetRef)
			chains.set(flow.targetRef, chain)
			for (const id of chain) handlerNodes.add(id)
		}
	}
	const band = (id: string): number => bands.get(id) ?? 0
	const busy = new Set<HandlerEntry>()
	const blocked = new Set<string>()
	const rowKey = (entry: HandlerEntry): string =>
		`${componentOf.get(entry.host) ?? 0}:${band(entry.host)}:${entry.side}`
	for (const entry of entries) {
		const hostRank = graph.ranks.get(entry.host)
		const sibling = graph.nodes.some(
			(n) =>
				n.id !== entry.host &&
				!handlerNodes.has(n.id) &&
				graph.ranks.get(n.id) === hostRank &&
				componentOf.get(n.id) === componentOf.get(entry.host) &&
				(band(n.id) - band(entry.host)) * entry.side > 0,
		)
		if (sibling || band(entry.host) !== 0) busy.add(entry)
		if (sibling) blocked.add(rowKey(entry))
	}
	// One row per scope, band and side: when a sibling branch blocks one handler's
	// column, the row would be split between the handlers (a long drop for one, a
	// step for the other), so all of them keep the step.
	for (const entry of entries) if (blocked.has(rowKey(entry))) busy.add(entry)

	const steps = new Map<string, number>()
	for (const entry of entries)
		for (const flow of entry.flows) steps.set(flow.id, busy.has(entry) ? 1 : 0)
	if (busy.size === entries.length) return false
	const lastRank = (chain: Set<string>): number =>
		Math.max(...[...chain].map((id) => graph.ranks.get(id) ?? 0))

	/** Entries that keep their old step because they would collide on the row. */
	const demoted = new Set<HandlerEntry>()
	const demote = (entry: HandlerEntry): void => {
		demoted.add(entry)
		for (const flow of entry.flows) steps.set(flow.id, 1)
	}
	for (let round = 0; round <= entries.length; round++) {
		assignRanks(graph, steps)
		const { ranks } = graph
		const order = [...entries].sort((a, b) => (ranks.get(a.host) ?? 0) - (ranks.get(b.host) ?? 0))
		/** Per row and side: the first rank no earlier handler occupies. */
		const free = new Map<string, number>()
		const last = new Map<string, HandlerEntry>()
		let changed = false
		for (const entry of order) {
			if (busy.has(entry)) continue
			const key = `${componentOf.get(entry.host) ?? 0}:${band(entry.host)}:${entry.side}`
			const from = free.get(key) ?? Number.NEGATIVE_INFINITY
			if (!demoted.has(entry) && from > (ranks.get(entry.host) ?? 0)) {
				// An earlier handler on the row holds this host's column. A second
				// event of the same host steps right as before; for another host the
				// earlier handler's tail would sit in the way of its event, so both do.
				demote(entry)
				const before = last.get(key)
				if (before && before.host !== entry.host && !demoted.has(before)) demote(before)
				changed = true
				break
			}
			last.set(key, entry)
			let end = Number.NEGATIVE_INFINITY
			for (const flow of entry.flows)
				end = Math.max(end, lastRank(chains.get(flow.targetRef) ?? new Set()))
			free.set(key, Math.max(from, end + 1))
		}
		if (!changed) break
	}
	if (!entries.some((e) => !busy.has(e) && !demoted.has(e))) return false
	// Demoted handlers still sit on the row, one column right of their host.
	for (const entry of entries) {
		if (busy.has(entry)) continue
		for (const flow of entry.flows)
			for (const id of chains.get(flow.targetRef) ?? []) graph.exceptionRow.add(id)
	}
	return true
}

/**
 * True when an end event is reachable from `id` without traversing a back edge.
 * A node other than `id` itself that has no outgoing flow also ends the path.
 *
 * The reverse reachability set is computed once per graph, so repeated calls
 * from the spine tracer stay O(1) instead of re-walking the graph each time.
 */
export function reachesEnd(graph: SemanticGraph, id: string): boolean {
	const node = graph.byId.get(id)
	if (node && END_TYPES.has(node.type)) return true
	const endReach = graph.endReach ?? buildEndReach(graph)
	for (const flow of graph.outgoing.get(id) ?? []) {
		if (!graph.backEdges.has(flow.id) && endReach.has(flow.targetRef)) return true
	}
	return false
}

/**
 * Every node from which a path along non-back edges reaches an end event or a
 * node with no outgoing flow (both inclusive), found by one reverse walk.
 */
function buildEndReach(graph: SemanticGraph): Set<string> {
	const reach = new Set<string>()
	const stack: string[] = []
	for (const node of graph.byId.values()) {
		const out = graph.outgoing.get(node.id)
		if (END_TYPES.has(node.type) || out === undefined || out.length === 0) {
			reach.add(node.id)
			stack.push(node.id)
		}
	}
	while (stack.length > 0) {
		const id = stack.pop() as string
		for (const flow of graph.incoming.get(id) ?? []) {
			if (graph.backEdges.has(flow.id)) continue
			const from = effectiveSource(flow, graph.byId)
			if (!reach.has(from)) {
				reach.add(from)
				stack.push(from)
			}
		}
	}
	graph.endReach = reach
	return reach
}
