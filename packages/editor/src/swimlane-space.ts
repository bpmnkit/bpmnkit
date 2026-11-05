/**
 * The space tool on planes with pools and lanes. See ./swimlanes.ts for the model.
 *
 * @packageDocumentation
 */
import {
	type BpmnAssociation,
	type BpmnBounds,
	type BpmnCollaboration,
	type BpmnDefinitions,
	type BpmnDiEdge,
	type BpmnDiPlane,
	type BpmnDiShape,
	type BpmnDiagram,
	type BpmnFlowElement,
	type BpmnLane,
	type BpmnLaneSet,
	type BpmnMessageFlow,
	type BpmnParticipant,
	type BpmnProcess,
	type BpmnSequenceFlow,
	type BpmnWaypoint,
	allLanes,
	assignLane,
	laneForNewNode,
	laneOf,
	leafLanes,
	pinPrimaryProcess,
	primaryProcess,
} from "@bpmnkit/core"
import { computeWaypointsAvoiding, edgeLabelBounds } from "./geometry.js"
import type { IdFactory } from "./id.js"
import {
	ALONG,
	MAX_DEPTH,
	type SpaceAxis,
	copyTouched,
	diagramIndexOf,
	pushBeyond,
	straighten,
	swimlaneIds,
} from "./swimlanes.js"

// ── Making space ────────────────────────────────────────────────────────────────

/**
 * The host of every boundary event at any sub-process depth, by event id: the
 * space tool moves a node by its own centre, but an event goes with its host.
 * A sub-process's content goes by its own centre, unlike {@link anchors}:
 * a sub-process the line crosses grows, and its content beyond the line moves.
 */
function hostAnchors(defs: BpmnDefinitions): Map<string, string> {
	const hosts = new Map<string, string>()
	const walk = (elements: readonly BpmnFlowElement[], depth: number): void => {
		if (depth > MAX_DEPTH) throw new Error("sub-processes nested too deep, or cyclic")
		for (const el of elements) {
			if (el.type === "boundaryEvent") hosts.set(el.id, el.attachedToRef)
			if ("flowElements" in el) walk(el.flowElements, depth + 1)
		}
	}
	for (const process of defs.processes) walk(process.flowElements, 0)
	return hosts
}

/** What a `space` op made: the new document, and the shapes it moved. */
export interface Spaced {
	defs: BpmnDefinitions
	moved: string[]
}

/**
 * The `space` op (decision U10), on the plane that draws the
 * {@link primaryProcess}: room for `delta` along `axis` at `line` (an x for
 * `h`, a y for `v`), on the side `delta` points to, as the space tool makes
 * it. What lies beyond the line moves by `delta`, at any process, drawing only
 * ({@link pushBeyond}: by centre, waypoints beyond it shift, so routes keep
 * their bends). The pools, lanes and expanded sub-processes the line crosses
 * grow by as much, from their edge on this side of the line: pools and lanes
 * widen for `h` (a pool takes its lanes along, so they keep reaching its
 * header strip), the lane chain and pool the line crosses deepen for `v`, and
 * a band that ends on the line grows too, so the bands still tile. No node
 * changes band. Only the diagram is copied. `undefined`, refused, for a
 * `delta` of 0, when the line crosses a pool or lane drawn vertically (the
 * bands are laid out horizontally only; a vertical one the line passes moves
 * whole or stays), and when nothing lies beyond the line.
 */
export function makeSpace(
	defs: BpmnDefinitions,
	axis: SpaceAxis,
	line: number,
	delta: number,
): Spaced | undefined {
	const index = diagramIndexOf(defs, primaryProcess(defs))
	const source = defs.diagrams[index]
	if (delta === 0 || !source) return undefined
	const swimlanes = swimlaneIds(defs)
	const shapes = source.plane.shapes
	const a = ALONG[axis]
	const crossed = (b: BpmnBounds) => {
		const [start, end] = [a.start(b), a.start(b) + a.size(b)]
		return delta > 0
			? start < line - 0.5 && end >= line - 0.5
			: end > line + 0.5 && start <= line + 0.5
	}
	const growing = shapes.filter(
		(s) => (swimlanes.has(s.bpmnElement) || s.isExpanded === true) && crossed(s.bounds),
	)
	// Stretching a vertical pool or lane would lay its bands out the wrong way; one the line
	// passes moves whole or stays, like any shape.
	if (growing.some((s) => swimlanes.has(s.bpmnElement) && s.isHorizontal === false))
		return undefined
	const grows = new Set(growing.map((s) => s.bpmnElement))
	if (axis === "h") {
		for (const pool of defs.collaborations.flatMap((c) => c.participants)) {
			if (!grows.has(pool.id)) continue
			const process = defs.processes.find((p) => p.id === pool.processRef)
			for (const lane of allLanes(process?.laneSet)) grows.add(lane.id)
		}
	}
	const next = copyTouched(defs, { diagrams: [source] })
	const plane = next.diagrams[index]?.plane
	if (!plane) return undefined
	// A host that grows stretches from the line, so its events go by their own centre: the one
	// on its far edge moves with that edge, the one on its near edge stays.
	const hosts = hostAnchors(defs)
	for (const [event, host] of hosts) if (grows.has(host)) hosts.delete(event)
	const { moved, kinked } = pushBeyond(plane, axis, line, delta, grows, hosts, defs)
	if (moved.size === 0 && grows.size === 0) return undefined
	for (const s of plane.shapes) {
		if (!grows.has(s.bpmnElement)) continue
		const [start, size] = [a.start(s.bounds), a.size(s.bounds)]
		s.bounds =
			delta > 0
				? a.span(s.bounds, start, size + delta)
				: a.span(s.bounds, start + delta, size - delta)
	}
	straighten(defs, plane, kinked)
	return { defs: next, moved: [...moved] }
}
