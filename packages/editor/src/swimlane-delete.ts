/**
 * Deleting pools and lanes. See ./swimlanes.ts for the model.
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
import { drawsAny, dropAssociationsTo, isBlackBox, removeLaneBand } from "./swimlanes.js"

// ── Deleting pools and lanes ────────────────────────────────────────────────────

/**
 * Whether a delete may take swimlane `id`: a leaf lane of the
 * {@link primaryProcess} (its neighbour takes its band and nodes) or a
 * {@link isBlackBox} pool. The own pool, a pool that draws a process with
 * content, a lane with child lanes and a lane of another process stay
 * (decision U2). `false` for an id that is no pool or lane.
 */
export function canDeleteSwimlane(defs: BpmnDefinitions, id: string): boolean {
	const lane = allLanes(primaryProcess(defs)?.laneSet).find((candidate) => candidate.id === id)
	if (lane) return (lane.childLaneSet?.lanes.length ?? 0) === 0
	const pool = defs.collaborations.flatMap((c) => c.participants).find((p) => p.id === id)
	return pool !== undefined && isBlackBox(defs, pool)
}

/**
 * Returns a copy of `defs` without the black-box pool `poolId`: its
 * participant, its shapes, its message flows and their edges. Its process goes
 * too (decision U3) when no other pool draws it, it holds nothing (no flow
 * element, lane set, annotation or association) and does not say it is
 * executable; so does a diagram whose plane draws that process and nothing
 * else. `undefined` when `poolId` is no pool or not a black box.
 */
export function removeBlackBox(defs: BpmnDefinitions, poolId: string): BpmnDefinitions | undefined {
	const pool = defs.collaborations.flatMap((c) => c.participants).find((p) => p.id === poolId)
	if (!pool || !isBlackBox(defs, pool)) return undefined
	const gone = new Set([poolId])
	for (const flow of defs.collaborations.flatMap((c) => c.messageFlows)) {
		if (flow.sourceRef === poolId || flow.targetRef === poolId) gone.add(flow.id)
	}
	// Only what held the pool or its messages is copied (8b.6).
	let next: BpmnDefinitions = {
		...defs,
		collaborations: defs.collaborations.map((c) =>
			c.participants.some((p) => gone.has(p.id)) || c.messageFlows.some((f) => gone.has(f.id))
				? {
						...c,
						participants: c.participants.filter((p) => !gone.has(p.id)),
						messageFlows: c.messageFlows.filter((f) => !gone.has(f.id)),
					}
				: c,
		),
		diagrams: defs.diagrams.map((d) =>
			drawsAny(d, gone)
				? {
						...d,
						plane: {
							...d.plane,
							shapes: d.plane.shapes.filter((s) => !gone.has(s.bpmnElement)),
							edges: d.plane.edges.filter((e) => !gone.has(e.bpmnElement)),
						},
					}
				: d,
		),
	}
	next = dropAssociationsTo(next, gone)

	const process = next.processes.find((p) => p.id === pool.processRef)
	const stillDrawn = next.collaborations.some((c) =>
		c.participants.some((p) => p.processRef === process?.id),
	)
	const planes = next.diagrams.filter((d) => d.plane.bpmnElement === process?.id)
	const empty =
		process !== undefined &&
		process.isExecutable !== true &&
		process.flowElements.length === 0 &&
		!process.laneSet &&
		process.textAnnotations.length === 0 &&
		process.associations.length === 0
	const blankPlanes = planes.every((d) => d.plane.shapes.length === 0 && d.plane.edges.length === 0)
	if (process && empty && !stillDrawn && blankPlanes) {
		next.processes = next.processes.filter((p) => p !== process)
		next.diagrams = next.diagrams.filter((d) => !planes.includes(d))
	}
	return next
}

/**
 * Returns `defs` without the swimlanes among `ids` that {@link canDeleteSwimlane}
 * allows, on a document whose primary process is `processes[0]`: lanes deepest
 * first, so a parent selected with all its child lanes goes too, then black
 * boxes. The rest of `ids` is ignored. `defs` itself when none goes.
 */
export function removeSwimlanes(defs: BpmnDefinitions, ids: readonly string[]): BpmnDefinitions {
	const wanted = new Set(ids)
	let next = defs
	// Depth first lists a parent before its children; reversed, children come first.
	for (const lane of allLanes(defs.processes[0]?.laneSet).reverse()) {
		if (wanted.has(lane.id)) next = removeLaneBand(next, 0, lane.id) ?? next
	}
	for (const pool of defs.collaborations.flatMap((c) => c.participants)) {
		if (wanted.has(pool.id)) next = removeBlackBox(next, pool.id) ?? next
	}
	return next
}
