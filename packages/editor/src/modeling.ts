import type {
	BpmnAssociation,
	BpmnBoundaryEvent,
	BpmnBounds,
	BpmnCollaboration,
	BpmnDefinitions,
	BpmnDiEdge,
	BpmnDiShape,
	BpmnEventDefinition,
	BpmnFlowElement,
	BpmnLaneSet,
	BpmnMessageFlow,
	BpmnMultiInstanceLoopCharacteristics,
	BpmnSequenceFlow,
	BpmnTextAnnotation,
	BpmnWaypoint,
	DiColor,
} from "@bpmnkit/core"
import { BIOC_NS, COLOR_NS, allLanes, primaryProcess, writeDiColor } from "@bpmnkit/core"
import {
	computeWaypoints,
	computeWaypointsAvoiding,
	computeWaypointsWithPorts,
	edgeLabelBounds,
	portFromWaypoint,
	routeEntersShape,
	routeOrthogonal,
	waypointsIntersectObstacles,
} from "./geometry.js"
import { type IdFactory, genId } from "./id.js"
import { type MessageEnd, canMessageFlow, eventTrigger } from "./rules.js"
import {
	lockedIds,
	messageRoute,
	participantOf,
	removeSwimlanes,
	rerouteMessage,
	swimlaneIds,
	unmovableIds,
} from "./swimlanes.js"
import type { CreateShapeType, PortDir } from "./types.js"

// ── Empty definitions ─────────────────────────────────────────────────────────

/** Creates a minimal valid BpmnDefinitions with one process and one diagram. */
export function createEmptyDefinitions(): BpmnDefinitions {
	const processId = genId("Process")
	const planeId = genId("BPMNPlane")
	return {
		id: genId("Definitions"),
		targetNamespace: "http://bpmn.io/schema/bpmn",
		namespaces: {
			bpmn: "http://www.omg.org/spec/BPMN/20100524/MODEL",
			bpmndi: "http://www.omg.org/spec/BPMN/20100524/DI",
			dc: "http://www.omg.org/spec/DD/20100524/DC",
			di: "http://www.omg.org/spec/DD/20100524/DI",
		},
		unknownAttributes: {},
		errors: [],
		escalations: [],
		messages: [],
		signals: [],
		collaborations: [],
		processes: [
			{
				id: processId,
				extensionElements: [],
				flowElements: [],
				sequenceFlows: [],
				textAnnotations: [],
				associations: [],
				groups: [],
				unknownAttributes: {},
			},
		],
		diagrams: [
			{
				id: genId("BPMNDiagram"),
				plane: {
					id: planeId,
					bpmnElement: processId,
					shapes: [],
					edges: [],
				},
			},
		],
	}
}

// ── Helper: build a new flow element ─────────────────────────────────────────

function makeFlowElement(type: CreateShapeType, id: string, name?: string): BpmnFlowElement {
	const base = {
		id,
		name,
		incoming: [] as string[],
		outgoing: [] as string[],
		extensionElements: [] as never[],
		unknownAttributes: {} as Record<string, string>,
	}

	switch (type) {
		case "startEvent":
			return { ...base, type: "startEvent", eventDefinitions: [] }
		case "messageStartEvent":
			return { ...base, type: "startEvent", eventDefinitions: [{ type: "message" }] }
		case "timerStartEvent":
			return { ...base, type: "startEvent", eventDefinitions: [{ type: "timer" }] }
		case "conditionalStartEvent":
			return { ...base, type: "startEvent", eventDefinitions: [{ type: "conditional" }] }
		case "signalStartEvent":
			return { ...base, type: "startEvent", eventDefinitions: [{ type: "signal" }] }
		case "endEvent":
			return { ...base, type: "endEvent", eventDefinitions: [] }
		case "messageEndEvent":
			return { ...base, type: "endEvent", eventDefinitions: [{ type: "message" }] }
		case "escalationEndEvent":
			return { ...base, type: "endEvent", eventDefinitions: [{ type: "escalation" }] }
		case "errorEndEvent":
			return { ...base, type: "endEvent", eventDefinitions: [{ type: "error" }] }
		case "compensationEndEvent":
			return { ...base, type: "endEvent", eventDefinitions: [{ type: "compensate" }] }
		case "signalEndEvent":
			return { ...base, type: "endEvent", eventDefinitions: [{ type: "signal" }] }
		case "terminateEndEvent":
			return { ...base, type: "endEvent", eventDefinitions: [{ type: "terminate" }] }
		case "intermediateThrowEvent":
			return { ...base, type: "intermediateThrowEvent", eventDefinitions: [] }
		case "intermediateCatchEvent":
			return { ...base, type: "intermediateCatchEvent", eventDefinitions: [] }
		case "messageCatchEvent":
			return { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "message" }] }
		case "messageThrowEvent":
			return { ...base, type: "intermediateThrowEvent", eventDefinitions: [{ type: "message" }] }
		case "timerCatchEvent":
			return { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "timer" }] }
		case "escalationThrowEvent":
			return {
				...base,
				type: "intermediateThrowEvent",
				eventDefinitions: [{ type: "escalation" }],
			}
		case "conditionalCatchEvent":
			return {
				...base,
				type: "intermediateCatchEvent",
				eventDefinitions: [{ type: "conditional" }],
			}
		case "linkCatchEvent":
			return { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "link" }] }
		case "linkThrowEvent":
			return { ...base, type: "intermediateThrowEvent", eventDefinitions: [{ type: "link" }] }
		case "compensationThrowEvent":
			return {
				...base,
				type: "intermediateThrowEvent",
				eventDefinitions: [{ type: "compensate" }],
			}
		case "signalCatchEvent":
			return { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "signal" }] }
		case "signalThrowEvent":
			return { ...base, type: "intermediateThrowEvent", eventDefinitions: [{ type: "signal" }] }
		case "task":
			return { ...base, type: "task" }
		case "serviceTask":
			return { ...base, type: "serviceTask" }
		case "userTask":
			return { ...base, type: "userTask" }
		case "scriptTask":
			return { ...base, type: "scriptTask" }
		case "sendTask":
			return { ...base, type: "sendTask" }
		case "receiveTask":
			return { ...base, type: "receiveTask" }
		case "businessRuleTask":
			return { ...base, type: "businessRuleTask" }
		case "manualTask":
			return { ...base, type: "manualTask" }
		case "callActivity":
			return { ...base, type: "callActivity" }
		case "subProcess":
			return {
				...base,
				type: "subProcess",
				flowElements: [],
				sequenceFlows: [],
				textAnnotations: [],
				associations: [],
				groups: [],
			}
		case "adHocSubProcess":
			return {
				...base,
				type: "adHocSubProcess",
				flowElements: [],
				sequenceFlows: [],
				textAnnotations: [],
				associations: [],
				groups: [],
			}
		case "transaction":
			return {
				...base,
				type: "transaction",
				flowElements: [],
				sequenceFlows: [],
				textAnnotations: [],
				associations: [],
				groups: [],
			}
		case "exclusiveGateway":
			return { ...base, type: "exclusiveGateway" }
		case "parallelGateway":
			return { ...base, type: "parallelGateway" }
		case "inclusiveGateway":
			return { ...base, type: "inclusiveGateway" }
		case "eventBasedGateway":
			return { ...base, type: "eventBasedGateway" }
		case "complexGateway":
			return { ...base, type: "complexGateway" }
		case "textAnnotation":
			throw new Error("textAnnotation is not a flow element — use createAnnotation()")
	}
}

// ── Container subprocess helpers ──────────────────────────────────────────────

/** Recursively collects all descendant flow element IDs and sequence flow IDs. */
function collectDescendantIds(el: BpmnFlowElement, out: Set<string>): void {
	if (
		el.type !== "subProcess" &&
		el.type !== "adHocSubProcess" &&
		el.type !== "eventSubProcess" &&
		el.type !== "transaction"
	)
		return
	for (const child of el.flowElements) {
		out.add(child.id)
		collectDescendantIds(child, out)
	}
	for (const sf of el.sequenceFlows) {
		out.add(sf.id)
	}
}

/** Flattens all sequence flows from all nesting levels into a Map. */
function collectAllSequenceFlows(
	flowElements: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
	out: Map<string, BpmnSequenceFlow>,
): void {
	for (const sf of sequenceFlows) {
		out.set(sf.id, sf)
	}
	for (const el of flowElements) {
		if (
			el.type === "subProcess" ||
			el.type === "adHocSubProcess" ||
			el.type === "eventSubProcess" ||
			el.type === "transaction"
		) {
			collectAllSequenceFlows(el.flowElements, el.sequenceFlows, out)
		}
	}
}

/** Returns the innermost container element ID whose bounds contain (cx, cy), or null. */
function findContainerForPoint(defs: BpmnDefinitions, cx: number, cy: number): string | null {
	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram) return null

	const containerIds = new Set<string>()
	const gatherContainers = (elements: BpmnFlowElement[]): void => {
		for (const el of elements) {
			if (
				el.type === "subProcess" ||
				el.type === "adHocSubProcess" ||
				el.type === "eventSubProcess" ||
				el.type === "transaction"
			) {
				containerIds.add(el.id)
				gatherContainers(el.flowElements)
			}
		}
	}
	gatherContainers(process.flowElements)

	let bestId: string | null = null
	let bestArea = Number.POSITIVE_INFINITY
	for (const shape of diagram.plane.shapes) {
		if (!containerIds.has(shape.bpmnElement)) continue
		const { x, y, width, height } = shape.bounds
		if (cx >= x && cx <= x + width && cy >= y && cy <= y + height) {
			const area = width * height
			if (area < bestArea) {
				bestArea = area
				bestId = shape.bpmnElement
			}
		}
	}
	return bestId
}

/** Recursively finds the container by ID and appends newElement to its flowElements. */
function addToContainer(
	flowElements: BpmnFlowElement[],
	containerId: string,
	newElement: BpmnFlowElement,
): BpmnFlowElement[] {
	return flowElements.map((el) => {
		if (
			el.type !== "subProcess" &&
			el.type !== "adHocSubProcess" &&
			el.type !== "eventSubProcess" &&
			el.type !== "transaction"
		)
			return el
		if (el.id === containerId) {
			return { ...el, flowElements: [...el.flowElements, newElement] }
		}
		return { ...el, flowElements: addToContainer(el.flowElements, containerId, newElement) }
	})
}

/** Recursively searches all levels for an element/flow by ID and updates its name. */
function updateNameInElements(
	flowElements: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
	id: string,
	name: string,
): { elements: BpmnFlowElement[]; flows: BpmnSequenceFlow[]; updated: boolean } {
	const elIndex = flowElements.findIndex((el) => el.id === id)
	if (elIndex >= 0) {
		const newElements = [...flowElements]
		const el = newElements[elIndex]
		if (el) newElements[elIndex] = { ...el, name }
		return { elements: newElements, flows: sequenceFlows, updated: true }
	}

	const sfIndex = sequenceFlows.findIndex((sf) => sf.id === id)
	if (sfIndex >= 0) {
		const newFlows = [...sequenceFlows]
		const sf = newFlows[sfIndex]
		if (sf) newFlows[sfIndex] = { ...sf, name }
		return { elements: flowElements, flows: newFlows, updated: true }
	}

	for (let i = 0; i < flowElements.length; i++) {
		const el = flowElements[i]
		if (
			el &&
			(el.type === "subProcess" ||
				el.type === "adHocSubProcess" ||
				el.type === "eventSubProcess" ||
				el.type === "transaction")
		) {
			const r = updateNameInElements(el.flowElements, el.sequenceFlows, id, name)
			if (r.updated) {
				const newElements = [...flowElements]
				newElements[i] = { ...el, flowElements: r.elements, sequenceFlows: r.flows }
				return { elements: newElements, flows: sequenceFlows, updated: true }
			}
		}
	}

	return { elements: flowElements, flows: sequenceFlows, updated: false }
}

/**
 * Recursively removes deleted elements from all nesting levels.
 * Mutates allRemovedIds (adds removed flow IDs) for DI edge cleanup.
 */
function removeFromContainers(
	flowElements: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
	idSet: Set<string>,
	allRemovedIds: Set<string>,
): { flowElements: BpmnFlowElement[]; sequenceFlows: BpmnSequenceFlow[] } {
	const flowsToRemove = new Set(
		sequenceFlows
			.filter((sf) => idSet.has(sf.id) || idSet.has(sf.sourceRef) || idSet.has(sf.targetRef))
			.map((sf) => sf.id),
	)
	for (const fid of flowsToRemove) allRemovedIds.add(fid)

	const newSequenceFlows = sequenceFlows.filter((sf) => !flowsToRemove.has(sf.id))
	const newFlowElements = flowElements
		.filter((el) => !idSet.has(el.id))
		.map((el): BpmnFlowElement => {
			const cleaned = {
				...el,
				incoming: el.incoming.filter((ref) => !allRemovedIds.has(ref)),
				outgoing: el.outgoing.filter((ref) => !allRemovedIds.has(ref)),
			} as BpmnFlowElement
			// A default pointing at a removed flow would export as a dangling reference.
			if (
				"default" in cleaned &&
				cleaned.default !== undefined &&
				allRemovedIds.has(cleaned.default)
			) {
				cleaned.default = undefined
			}
			const activityDefault = cleaned.unknownAttributes.default
			if (activityDefault !== undefined && allRemovedIds.has(activityDefault)) {
				const { default: _removed, ...rest } = cleaned.unknownAttributes
				cleaned.unknownAttributes = rest
			}
			if (
				cleaned.type === "subProcess" ||
				cleaned.type === "adHocSubProcess" ||
				cleaned.type === "eventSubProcess" ||
				cleaned.type === "transaction"
			) {
				const r = removeFromContainers(
					cleaned.flowElements,
					cleaned.sequenceFlows,
					idSet,
					allRemovedIds,
				)
				return { ...cleaned, flowElements: r.flowElements, sequenceFlows: r.sequenceFlows }
			}
			return cleaned
		})

	return { flowElements: newFlowElements, sequenceFlows: newSequenceFlows }
}

/** Recursively finds element by ID and applies updateFn to it. */
function updateRefInElements(
	flowElements: BpmnFlowElement[],
	id: string,
	updateFn: (el: BpmnFlowElement) => BpmnFlowElement,
): BpmnFlowElement[] {
	return flowElements.map((el) => {
		if (el.id === id) return updateFn(el)
		if (
			el.type === "subProcess" ||
			el.type === "adHocSubProcess" ||
			el.type === "eventSubProcess" ||
			el.type === "transaction"
		) {
			return { ...el, flowElements: updateRefInElements(el.flowElements, id, updateFn) }
		}
		return el
	})
}

// ── Create shape ─────────────────────────────────────────────────────────────

export function createShape(
	defs: BpmnDefinitions,
	type: CreateShapeType,
	bounds: BpmnBounds,
	name?: string,
	ids: IdFactory = genId,
): { defs: BpmnDefinitions; id: string } {
	const id = ids(type)
	const shapeId = ids(`${type}_di`)
	const flowElement = makeFlowElement(type, id, name)

	const process = defs.processes[0]
	if (!process) return { defs, id }

	const diagram = defs.diagrams[0]
	if (!diagram) return { defs, id }

	const diShape: BpmnDiShape = {
		id: shapeId,
		bpmnElement: id,
		bounds,
		unknownAttributes: {},
	}
	// The bpmn-js Viewer draws the "X" only when the shape says so; the Modeler
	// assumes it.
	if (type === "exclusiveGateway") diShape.isMarkerVisible = true

	const cx = bounds.x + bounds.width / 2
	const cy = bounds.y + bounds.height / 2
	const containerId = findContainerForPoint(defs, cx, cy)

	const newDefs: BpmnDefinitions = {
		...defs,
		processes: [
			{
				...process,
				flowElements:
					containerId !== null
						? addToContainer(process.flowElements, containerId, flowElement)
						: [...process.flowElements, flowElement],
			},
			...defs.processes.slice(1),
		],
		diagrams: [
			{
				...diagram,
				plane: {
					...diagram.plane,
					shapes: [...diagram.plane.shapes, diShape],
				},
			},
			...defs.diagrams.slice(1),
		],
	}

	return { defs: newDefs, id }
}

// ── Create boundary event ─────────────────────────────────────────────────────

export function createBoundaryEvent(
	defs: BpmnDefinitions,
	hostId: string,
	eventDefType: string | null,
	bounds: BpmnBounds,
	cancelActivity = true,
	ids: IdFactory = genId,
): { defs: BpmnDefinitions; id: string } {
	const id = ids("BoundaryEvent")
	const shapeId = ids("BoundaryEvent_di")
	// The event lands in `processes[0]`; Flowable rejects one attached to another scope.
	if (!canEndFlow(defs, hostId)) return { defs, id }

	const process = defs.processes[0]
	if (!process) return { defs, id }
	const diagram = defs.diagrams[0]
	if (!diagram) return { defs, id }

	const eventDefs = eventDefType ? [{ type: eventDefType } as BpmnEventDefinition] : []
	const boundaryEvent: BpmnBoundaryEvent = {
		type: "boundaryEvent",
		id,
		attachedToRef: hostId,
		cancelActivity,
		eventDefinitions: eventDefs,
		incoming: [],
		outgoing: [],
		extensionElements: [],
		unknownAttributes: {},
	}

	const diShape: BpmnDiShape = {
		id: shapeId,
		bpmnElement: id,
		bounds,
		unknownAttributes: {},
	}

	return {
		defs: {
			...defs,
			processes: [
				{
					...process,
					flowElements: [...process.flowElements, boundaryEvent],
				},
				...defs.processes.slice(1),
			],
			diagrams: [
				{
					...diagram,
					plane: {
						...diagram.plane,
						shapes: [...diagram.plane.shapes, diShape],
					},
				},
				...defs.diagrams.slice(1),
			],
		},
		id,
	}
}

// ── Create connection ─────────────────────────────────────────────────────────

/**
 * Connects `sourceId` to `targetId`, as {@link connectionKind} decides: a
 * message flow (routed by `messageRoute`, `waypoints` unused) when the ends are
 * in different pools, else a sequence flow of `processes[0]` drawn along
 * `waypoints`. `defs` itself when neither may connect them.
 */
export function createConnection(
	defs: BpmnDefinitions,
	sourceId: string,
	targetId: string,
	waypoints: BpmnWaypoint[],
	ids: IdFactory = genId,
): { defs: BpmnDefinitions; id: string } {
	const kind = connectionKind(defs, sourceId, targetId)
	if (kind === "message") return createMessageFlow(defs, sourceId, targetId, ids)
	// Minted before the check, as before message flows existed, so older recorded ops replay the same ids.
	const id = ids("Flow")
	const edgeId = ids("Flow_di")
	if (kind === undefined) return { defs, id }

	const process = defs.processes[0]
	if (!process) return { defs, id }

	const diagram = defs.diagrams[0]
	if (!diagram) return { defs, id }

	const sf: BpmnSequenceFlow = {
		id,
		sourceRef: sourceId,
		targetRef: targetId,
		extensionElements: [],
		unknownAttributes: {},
	}

	const edge: BpmnDiEdge = {
		id: edgeId,
		bpmnElement: id,
		waypoints,
		unknownAttributes: {},
	}

	// Update source.outgoing and target.incoming (recursive — handles subprocess children)
	let updatedElements = updateRefInElements(
		process.flowElements,
		sourceId,
		(el) => ({ ...el, outgoing: [...el.outgoing, id] }) as BpmnFlowElement,
	)
	updatedElements = updateRefInElements(
		updatedElements,
		targetId,
		(el) => ({ ...el, incoming: [...el.incoming, id] }) as BpmnFlowElement,
	)

	const newDefs: BpmnDefinitions = {
		...defs,
		processes: [
			{
				...process,
				flowElements: updatedElements,
				sequenceFlows: [...process.sequenceFlows, sf],
			},
			...defs.processes.slice(1),
		],
		diagrams: [
			{
				...diagram,
				plane: {
					...diagram.plane,
					edges: [...diagram.plane.edges, edge],
				},
			},
			...defs.diagrams.slice(1),
		],
	}

	return { defs: newDefs, id }
}

/**
 * What a connection from `sourceId` to `targetId` adds: a `"message"` flow when
 * the ends lie in different pools ({@link participantOf}) and
 * {@link canMessageFlow} allows them, a partner's locked node included (the
 * message is the collaboration's, its process stays as it is); a
 * `"sequence"` flow when they lie in one pool, or there are no pools, and
 * {@link canEndFlow} allows both; undefined when neither is allowed. The
 * sequence-flow rules of `canConnect` are the editor's to apply. Reads the
 * primary process, so it holds whatever order the file lists processes in.
 */
export function connectionKind(
	defs: BpmnDefinitions,
	sourceId: string,
	targetId: string,
): "message" | "sequence" | undefined {
	const from = participantOf(defs, sourceId)
	const to = participantOf(defs, targetId)
	if (from && to && from.id !== to.id) {
		const source = messageEndOf(defs, sourceId)
		const target = messageEndOf(defs, targetId)
		return source && target && canMessageFlow(source, target) ? "message" : undefined
	}
	return canEndFlow(defs, sourceId) && canEndFlow(defs, targetId) ? "sequence" : undefined
}

/** `id` as a message-flow end: a pool, or a flow node of any process; undefined for anything else. */
function messageEndOf(defs: BpmnDefinitions, id: string): MessageEnd | undefined {
	if (defs.collaborations.some((c) => c.participants.some((p) => p.id === id))) {
		return { type: "participant" }
	}
	for (const process of defs.processes) {
		const el = findDeep(process.flowElements, id, 0)
		if (el) return { type: el.type, trigger: eventTrigger(el) }
	}
	return undefined
}

/**
 * Adds a message flow from `sourceId` to `targetId`, without a `messageRef`,
 * to the collaboration that holds the primary process's pool (the first one
 * when none does), with an edge on `diagrams[0]`. `defs` itself when either
 * end is not drawn there: a message flow without its edge would be invisible.
 */
function createMessageFlow(
	defs: BpmnDefinitions,
	sourceId: string,
	targetId: string,
	ids: IdFactory,
): { defs: BpmnDefinitions; id: string } {
	const id = ids("MessageFlow")
	const edgeId = ids("MessageFlow_di")
	const diagram = defs.diagrams[0]
	const source = diagram?.plane.shapes.find((s) => s.bpmnElement === sourceId)
	const target = diagram?.plane.shapes.find((s) => s.bpmnElement === targetId)
	const primary = primaryProcess(defs)
	const own = defs.collaborations.findIndex((c) =>
		c.participants.some((p) => p.processRef !== undefined && p.processRef === primary?.id),
	)
	const at = Math.max(own, 0)
	const collaboration = defs.collaborations[at]
	if (!diagram || !source || !target || !collaboration) return { defs, id }

	const pools = participantIds(defs)
	const flow: BpmnMessageFlow = {
		id,
		sourceRef: sourceId,
		targetRef: targetId,
		unknownAttributes: {},
	}
	const edge: BpmnDiEdge = {
		id: edgeId,
		bpmnElement: id,
		waypoints: messageRoute(source.bounds, target.bounds, pools.has(sourceId), pools.has(targetId)),
		unknownAttributes: {},
	}
	const collaborations = [...defs.collaborations]
	collaborations[at] = { ...collaboration, messageFlows: [...collaboration.messageFlows, flow] }
	return {
		defs: {
			...defs,
			collaborations,
			diagrams: [
				{ ...diagram, plane: { ...diagram.plane, edges: [...diagram.plane.edges, edge] } },
				...defs.diagrams.slice(1),
			],
		},
		id,
	}
}

/** The ids of every pool. */
function participantIds(defs: BpmnDefinitions): Set<string> {
	return new Set(defs.collaborations.flatMap((c) => c.participants.map((p) => p.id)))
}

/** Every message flow of every collaboration, by id. */
function messageFlowsById(defs: BpmnDefinitions): Map<string, BpmnMessageFlow> {
	return new Map(defs.collaborations.flatMap((c) => c.messageFlows.map((f) => [f.id, f] as const)))
}

/**
 * `edge` of message flow `flow` once the shapes `moves` names moved and are
 * drawn as `shapes`: translated, label included, when both ends moved by the
 * same offset, so a route the user bent keeps its bends; re-routed by
 * `messageRoute` when only one did; `edge` itself when neither did.
 */
function redockMessage(
	edge: BpmnDiEdge,
	flow: BpmnMessageFlow,
	moves: ReadonlyMap<string, { dx: number; dy: number }>,
	shapes: readonly BpmnDiShape[],
	pools: ReadonlySet<string>,
): BpmnDiEdge {
	const from = moves.get(flow.sourceRef)
	const to = moves.get(flow.targetRef)
	if (!from && !to) return edge
	if (!from || !to || from.dx !== to.dx || from.dy !== to.dy) {
		return rerouteMessage(edge, flow, shapes, pools)
	}
	const label = edge.label?.bounds
	return {
		...edge,
		waypoints: edge.waypoints.map((p) => ({ ...p, x: p.x + from.dx, y: p.y + from.dy })),
		...(edge.label && label
			? {
					label: {
						...edge.label,
						bounds: { ...label, x: label.x + from.dx, y: label.y + from.dy },
					},
				}
			: {}),
	}
}

/**
 * Whether a sequence flow of `processes[0]` may start or end at `id`: not at a
 * pool or a lane (a sequence flow to a participant is invalid BPMN) and not at
 * a node of another process ({@link lockedIds}).
 */
export function canEndFlow(defs: BpmnDefinitions, id: string): boolean {
	return !swimlaneIds(defs).has(id) && !lockedIds(defs).has(id)
}

// ── Move shapes ───────────────────────────────────────────────────────────────

/** Returns true if the boundary event center is within the host bounds (with a margin). */
function isOnHostBoundary(eventBounds: BpmnBounds, hostBounds: BpmnBounds): boolean {
	const margin = 24
	const cx = eventBounds.x + eventBounds.width / 2
	const cy = eventBounds.y + eventBounds.height / 2
	return (
		cx >= hostBounds.x - margin &&
		cx <= hostBounds.x + hostBounds.width + margin &&
		cy >= hostBounds.y - margin &&
		cy <= hostBounds.y + hostBounds.height + margin
	)
}

export function moveShapes(
	defs: BpmnDefinitions,
	moves: Array<{ id: string; dx: number; dy: number }>,
): BpmnDefinitions {
	// Here, not where the editor builds the op, so a replayed op agrees.
	const frozen = unmovableIds(defs)
	const movable = moves.filter((m) => !frozen.has(m.id))
	if (movable.length === 0) return defs

	const moveMap = new Map(movable.map((m) => [m.id, m]))

	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram) return defs
	// Pools and lanes hold the shapes; as obstacles they would re-route every edge inside them.
	const containers = swimlaneIds(defs)
	const messages = messageFlowsById(defs)
	const pools = participantIds(defs)

	// Cascade: boundary events attached to moved shapes also move, but only if they
	// are currently positioned on/near the host boundary (not moved away by the user).
	const extendedMoves = [...movable]
	for (const el of process.flowElements) {
		if (el.type === "boundaryEvent" && moveMap.has(el.attachedToRef) && !moveMap.has(el.id)) {
			const hostShape = diagram.plane.shapes.find((s) => s.bpmnElement === el.attachedToRef)
			const eventShape = diagram.plane.shapes.find((s) => s.bpmnElement === el.id)
			if (hostShape && eventShape && isOnHostBoundary(eventShape.bounds, hostShape.bounds)) {
				const hostMove = moveMap.get(el.attachedToRef)
				if (hostMove) extendedMoves.push({ id: el.id, dx: hostMove.dx, dy: hostMove.dy })
			}
		}
	}

	// Cascade: descendants of moving container elements (subprocesses) also move.
	const seenIds = new Set(extendedMoves.map((m) => m.id))
	const cascadeDescendants = (elements: BpmnFlowElement[]): void => {
		for (const el of elements) {
			if (
				el.type === "subProcess" ||
				el.type === "adHocSubProcess" ||
				el.type === "eventSubProcess" ||
				el.type === "transaction"
			) {
				if (moveMap.has(el.id)) {
					const move = moveMap.get(el.id)
					if (move) {
						const descIds = new Set<string>()
						collectDescendantIds(el, descIds)
						for (const descId of descIds) {
							if (!seenIds.has(descId)) {
								seenIds.add(descId)
								extendedMoves.push({ id: descId, dx: move.dx, dy: move.dy })
							}
						}
					}
				}
				cascadeDescendants(el.flowElements)
			}
		}
	}
	cascadeDescendants(process.flowElements)

	const extendedMoveMap = new Map(extendedMoves.map((m) => [m.id, m]))

	// Update DI shape bounds (and label bounds, if present)
	const newShapes = diagram.plane.shapes.map((s) => {
		const m = extendedMoveMap.get(s.bpmnElement)
		if (!m) return s
		return {
			...s,
			bounds: {
				...s.bounds,
				x: s.bounds.x + m.dx,
				y: s.bounds.y + m.dy,
			},
			label:
				s.label?.bounds !== undefined
					? {
							...s.label,
							bounds: {
								x: s.label.bounds.x + m.dx,
								y: s.label.bounds.y + m.dy,
								width: s.label.bounds.width,
								height: s.label.bounds.height,
							},
						}
					: s.label,
		}
	})

	// Update edge waypoints
	// After each move, ensure sequence flows:
	//  1. Never pass behind/through other elements (obstacle avoidance)
	//  2. Never share the same connection point on an element (port deconfliction)
	const allFlows = new Map<string, BpmnSequenceFlow>()
	collectAllSequenceFlows(process.flowElements, process.sequenceFlows, allFlows)

	// Build a lookup of post-move shape bounds
	const shapeBoundsMap = new Map<string, BpmnBounds>()
	for (const s of newShapes) {
		if (!containers.has(s.bpmnElement)) shapeBoundsMap.set(s.bpmnElement, s.bounds)
	}

	const newEdges = diagram.plane.edges.map((edge) => {
		// Handle sequence flows (search all nesting levels)
		const flow = allFlows.get(edge.bpmnElement)
		if (flow) {
			if (edge.waypoints.length < 2) return edge

			const srcMove = extendedMoveMap.get(flow.sourceRef)
			const tgtMove = extendedMoveMap.get(flow.targetRef)
			const srcShape = newShapes.find((s) => s.bpmnElement === flow.sourceRef)
			const tgtShape = newShapes.find((s) => s.bpmnElement === flow.targetRef)
			if (!srcShape || !tgtShape) return edge

			// Obstacles = all shapes except this edge's source and target
			const obstacles = newShapes
				.filter(
					(s) =>
						s.bpmnElement !== flow.sourceRef &&
						s.bpmnElement !== flow.targetRef &&
						!containers.has(s.bpmnElement),
				)
				.map((s) => s.bounds)

			if (srcMove || tgtMove) {
				// At least one endpoint moved — always re-route from port midpoints so that
				// connection points are centered on the side and obstacles are avoided.
				return {
					...edge,
					waypoints: computeWaypointsAvoiding(srcShape.bounds, tgtShape.bounds, obstacles),
				}
			}

			// Neither endpoint moves — validate the existing waypoints fully.
			// This catches both: (a) a moved shape now blocking the path, and
			// (b) pre-existing invalid paths loaded from XML that pass through
			// a shape's interior.  Any invalid path is re-routed.
			if (
				waypointsIntersectObstacles(edge.waypoints, obstacles) ||
				routeEntersShape(edge.waypoints, srcShape.bounds) ||
				routeEntersShape(edge.waypoints, tgtShape.bounds)
			) {
				return {
					...edge,
					waypoints: computeWaypointsAvoiding(srcShape.bounds, tgtShape.bounds, obstacles),
				}
			}

			return edge
		}

		const message = messages.get(edge.bpmnElement)
		if (message) return redockMessage(edge, message, extendedMoveMap, newShapes, pools)

		// Handle association edges
		const assoc = process.associations.find((a) => a.id === edge.bpmnElement)
		if (assoc) {
			const srcMove = extendedMoveMap.get(assoc.sourceRef)
			const tgtMove = extendedMoveMap.get(assoc.targetRef)
			if (!srcMove && !tgtMove) return edge

			if (srcMove && tgtMove) {
				return {
					...edge,
					waypoints: edge.waypoints.map((wp) => ({ x: wp.x + srcMove.dx, y: wp.y + srcMove.dy })),
				}
			}
			const srcShape = newShapes.find((s) => s.bpmnElement === assoc.sourceRef)
			const tgtShape = newShapes.find((s) => s.bpmnElement === assoc.targetRef)
			if (srcShape && tgtShape) {
				return { ...edge, waypoints: computeWaypoints(srcShape.bounds, tgtShape.bounds) }
			}
		}

		return edge
	})

	// Port deconfliction: spread edges that share the same connection point on a shape
	const deconflictedEdges = deconflictPorts(newEdges, shapeBoundsMap, allFlows)

	return {
		...defs,
		diagrams: [
			{
				...diagram,
				plane: { ...diagram.plane, shapes: newShapes, edges: deconflictedEdges },
			},
			...defs.diagrams.slice(1),
		],
	}
}

// ── Port deconfliction ────────────────────────────────────────────────────────

/**
 * Spreads edge connection points when multiple flows share the same port
 * midpoint on a shape.  Groups edges by (shapeId, port-side) and offsets
 * them evenly along that side so no two flows touch the exact same point.
 */
function deconflictPorts(
	edges: BpmnDiEdge[],
	shapeBoundsMap: Map<string, BpmnBounds>,
	allFlows: Map<string, BpmnSequenceFlow>,
): BpmnDiEdge[] {
	type TermRef = { edgeIdx: number; isSource: boolean; port: PortDir }
	const groups = new Map<string, TermRef[]>()

	for (let i = 0; i < edges.length; i++) {
		const edge = edges[i]
		if (!edge || edge.waypoints.length < 2) continue
		const flow = allFlows.get(edge.bpmnElement)
		if (!flow) continue
		const srcBounds = shapeBoundsMap.get(flow.sourceRef)
		const tgtBounds = shapeBoundsMap.get(flow.targetRef)
		if (!srcBounds || !tgtBounds) continue

		const firstWp = edge.waypoints[0]
		const lastWp = edge.waypoints[edge.waypoints.length - 1]
		if (!firstWp || !lastWp) continue

		const srcPort = portFromWaypoint(firstWp, srcBounds)
		const tgtPort = portFromWaypoint(lastWp, tgtBounds)

		const srcKey = `${flow.sourceRef}:${srcPort}`
		const tgtKey = `${flow.targetRef}:${tgtPort}`

		const sg = groups.get(srcKey) ?? []
		sg.push({ edgeIdx: i, isSource: true, port: srcPort })
		groups.set(srcKey, sg)

		const tg = groups.get(tgtKey) ?? []
		tg.push({ edgeIdx: i, isSource: false, port: tgtPort })
		groups.set(tgtKey, tg)
	}

	// Compute spread waypoints for groups with collisions
	const newSrcTerminals = new Map<number, BpmnWaypoint>()
	const newSrcPorts = new Map<number, PortDir>()
	const newTgtTerminals = new Map<number, BpmnWaypoint>()
	const newTgtPorts = new Map<number, PortDir>()

	for (const [key, group] of groups) {
		if (group.length <= 1) continue
		const colonIdx = key.indexOf(":")
		const shapeId = key.slice(0, colonIdx)
		const portStr = key.slice(colonIdx + 1)
		if (portStr !== "top" && portStr !== "right" && portStr !== "bottom" && portStr !== "left")
			continue
		const port: PortDir = portStr
		const bounds = shapeBoundsMap.get(shapeId)
		if (!bounds) continue

		const n = group.length
		const isH = port === "left" || port === "right"
		const available = isH ? bounds.height - 30 : bounds.width - 30
		const spacing = Math.min(25, available / Math.max(n - 1, 1))

		for (let i = 0; i < n; i++) {
			const term = group[i]
			if (!term) continue
			const offset = (i - (n - 1) / 2) * spacing
			let newPt: BpmnWaypoint
			if (port === "right") {
				newPt = { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 + offset }
			} else if (port === "left") {
				newPt = { x: bounds.x, y: bounds.y + bounds.height / 2 + offset }
			} else if (port === "bottom") {
				newPt = { x: bounds.x + bounds.width / 2 + offset, y: bounds.y + bounds.height }
			} else {
				newPt = { x: bounds.x + bounds.width / 2 + offset, y: bounds.y }
			}

			if (term.isSource) {
				newSrcTerminals.set(term.edgeIdx, newPt)
				newSrcPorts.set(term.edgeIdx, port)
			} else {
				newTgtTerminals.set(term.edgeIdx, newPt)
				newTgtPorts.set(term.edgeIdx, port)
			}
		}
	}

	if (newSrcTerminals.size === 0 && newTgtTerminals.size === 0) return edges

	const result = [...edges]
	for (let i = 0; i < result.length; i++) {
		const newSrcPt = newSrcTerminals.get(i)
		const newTgtPt = newTgtTerminals.get(i)
		if (!newSrcPt && !newTgtPt) continue

		const edge = result[i]
		if (!edge || edge.waypoints.length < 2) continue
		const flow = allFlows.get(edge.bpmnElement)
		if (!flow) continue
		const srcBounds = shapeBoundsMap.get(flow.sourceRef)
		const tgtBounds = shapeBoundsMap.get(flow.targetRef)
		if (!srcBounds || !tgtBounds) continue

		const firstWp = edge.waypoints[0]
		const lastWp = edge.waypoints[edge.waypoints.length - 1]
		if (!firstWp || !lastWp) continue

		const srcPt = newSrcPt ?? firstWp
		const tgtPt = newTgtPt ?? lastWp
		const srcPort = newSrcPorts.get(i) ?? portFromWaypoint(srcPt, srcBounds)
		const tgtPort = newTgtPorts.get(i) ?? portFromWaypoint(tgtPt, tgtBounds)

		// Compute obstacles for this edge (all shapes except its src and tgt)
		const obstacles: BpmnBounds[] = []
		for (const [shapeId, bounds] of shapeBoundsMap) {
			if (shapeId !== flow.sourceRef && shapeId !== flow.targetRef) {
				obstacles.push(bounds)
			}
		}

		const candidate = routeOrthogonal(srcPt, srcPort, tgtPt, tgtPort)
		// If the spread route passes through an obstacle, fall back to the obstacle-avoiding
		// route (which exits from the port midpoint, but never goes behind an element).
		result[i] = {
			...edge,
			waypoints: waypointsIntersectObstacles(candidate, obstacles)
				? computeWaypointsAvoiding(srcBounds, tgtBounds, obstacles)
				: candidate,
		}
	}

	return result
}

// ── Resize shape ──────────────────────────────────────────────────────────────

export function resizeShape(
	defs: BpmnDefinitions,
	id: string,
	newBounds: BpmnBounds,
): BpmnDefinitions {
	// A partner's node is not in processes[0]: only its drawing would change.
	if (lockedIds(defs).has(id)) return defs
	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram) return defs

	const newShapes = diagram.plane.shapes.map((s) =>
		s.bpmnElement === id ? { ...s, bounds: newBounds } : s,
	)

	const messages = messageFlowsById(defs)
	const pools = participantIds(defs)
	// Recompute terminal waypoints for connected edges
	const newEdges = diagram.plane.edges.map((edge) => {
		const message = messages.get(edge.bpmnElement)
		if (message) {
			const touches = message.sourceRef === id || message.targetRef === id
			return touches ? rerouteMessage(edge, message, newShapes, pools) : edge
		}
		const flow = process.sequenceFlows.find((sf) => sf.id === edge.bpmnElement)
		if (!flow) return edge

		const isSource = flow.sourceRef === id
		const isTarget = flow.targetRef === id
		if (!isSource && !isTarget) return edge

		// Find the other shape's bounds
		const otherId = isSource ? flow.targetRef : flow.sourceRef
		const otherShape = diagram.plane.shapes.find((s) => s.bpmnElement === otherId)
		if (!otherShape) return edge

		const wps = isSource
			? computeWaypoints(newBounds, otherShape.bounds)
			: computeWaypoints(otherShape.bounds, newBounds)

		return { ...edge, waypoints: wps }
	})

	return {
		...defs,
		diagrams: [
			{
				...diagram,
				plane: { ...diagram.plane, shapes: newShapes, edges: newEdges },
			},
			...defs.diagrams.slice(1),
		],
	}
}

// ── Delete elements ───────────────────────────────────────────────────────────

/** Deep enough for any lane tree or sub-process the parser builds; a deeper walk means a cycle. */
const MAX_NESTING = 64

/**
 * Removes `ids` from `processes[0]` and its diagram, with what depends on them:
 * boundary events of a removed host, the content of a removed sub-process, the
 * sequence flows, associations and message flows that touch a removed element,
 * and the removed nodes' refs in every lane. Then the lanes and pools among
 * `ids` that `canDeleteSwimlane` allows: a lane's neighbour takes its
 * band and nodes, a black box goes with its messages.
 *
 * The own pool, a pool that draws a process with content, a lane with child
 * lanes and the {@link lockedIds} of other processes are left out, so a mixed
 * selection deletes the rest. `defs` itself when nothing is left to remove.
 */
export function deleteElements(defs: BpmnDefinitions, ids: string[]): BpmnDefinitions {
	const swimlanes = swimlaneIds(defs)
	return removeSwimlanes(
		deleteContent(defs, ids, swimlanes),
		ids.filter((id) => swimlanes.has(id)),
	)
}

/** {@link deleteElements} for everything but the swimlanes. */
function deleteContent(
	defs: BpmnDefinitions,
	ids: string[],
	swimlanes: ReadonlySet<string>,
): BpmnDefinitions {
	const kept = new Set([...swimlanes, ...lockedIds(defs)])
	const idSet = new Set(ids.filter((id) => !kept.has(id)))
	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (idSet.size === 0 || !process || !diagram) return defs

	// Cascade: boundary events whose host is deleted, and the content of deleted containers
	for (const el of process.flowElements) {
		if (el.type === "boundaryEvent" && idSet.has(el.attachedToRef)) idSet.add(el.id)
	}
	for (const el of process.flowElements) {
		if (idSet.has(el.id)) collectDescendantIds(el, idSet)
	}

	// Recursively remove elements and collect all removed flow IDs into allRemovedIds
	const allRemovedIds = new Set<string>(idSet)
	const { flowElements: newFlowElements, sequenceFlows: newSequenceFlows } = removeFromContainers(
		process.flowElements,
		process.sequenceFlows,
		idSet,
		allRemovedIds,
	)
	// Associations of the process, then of the collaborations: they may point at a removed flow too.
	const newAssociations = withoutDangling(process.associations, allRemovedIds)
	const collaborations = defs.collaborations.map((c) => pruneCollaboration(c, allRemovedIds))

	const newDiShapes = diagram.plane.shapes.filter((s) => !idSet.has(s.bpmnElement))
	const newDiEdges = diagram.plane.edges.filter((e) => !allRemovedIds.has(e.bpmnElement))

	return {
		...defs,
		collaborations,
		processes: [
			{
				...process,
				flowElements: newFlowElements,
				sequenceFlows: newSequenceFlows,
				textAnnotations: process.textAnnotations.filter((ta) => !idSet.has(ta.id)),
				associations: newAssociations,
				laneSet: withoutLaneRefs(process.laneSet, idSet, 0),
			},
			...defs.processes.slice(1),
		],
		diagrams: [
			{
				...diagram,
				plane: { ...diagram.plane, shapes: newDiShapes, edges: newDiEdges },
			},
			...defs.diagrams.slice(1),
		],
	}
}

/**
 * `links` without those that are, or start or end at, a `removed` id. The ids
 * of the links it drops are added to `removed`, so their DI edges go as well.
 */
function withoutDangling<T extends { id: string; sourceRef: string; targetRef: string }>(
	links: T[],
	removed: Set<string>,
): T[] {
	const gone = links.filter(
		(l) => removed.has(l.id) || removed.has(l.sourceRef) || removed.has(l.targetRef),
	)
	if (gone.length === 0) return links
	for (const link of gone) removed.add(link.id)
	return links.filter((l) => !removed.has(l.id))
}

/**
 * `collaboration` without the message flows and associations that touch a
 * `removed` id and without removed text annotations; the same object when it
 * names none. Dropped link ids are added to `removed`, as {@link withoutDangling} does.
 */
function pruneCollaboration(
	collaboration: BpmnCollaboration,
	removed: Set<string>,
): BpmnCollaboration {
	const textAnnotations = collaboration.textAnnotations.filter((ta) => !removed.has(ta.id))
	const messageFlows = withoutDangling(collaboration.messageFlows, removed)
	const associations = withoutDangling(collaboration.associations, removed)
	if (
		textAnnotations.length === collaboration.textAnnotations.length &&
		messageFlows === collaboration.messageFlows &&
		associations === collaboration.associations
	) {
		return collaboration
	}
	return { ...collaboration, textAnnotations, messageFlows, associations }
}

/**
 * `laneSet` without flow node refs to `removed`, at every depth. Only the
 * lanes that listed a removed node are copied, so a third party's lane
 * layout, ref order included, is kept everywhere else.
 */
function withoutLaneRefs(
	laneSet: BpmnLaneSet | undefined,
	removed: ReadonlySet<string>,
	depth: number,
): BpmnLaneSet | undefined {
	if (!laneSet) return laneSet
	if (depth > MAX_NESTING) throw new Error("lanes nested too deep, or cyclic")
	let changed = false
	const lanes = laneSet.lanes.map((lane) => {
		const flowNodeRefs = lane.flowNodeRefs.filter((ref) => !removed.has(ref))
		const childLaneSet = withoutLaneRefs(lane.childLaneSet, removed, depth + 1)
		if (flowNodeRefs.length === lane.flowNodeRefs.length && childLaneSet === lane.childLaneSet) {
			return lane
		}
		changed = true
		return childLaneSet ? { ...lane, flowNodeRefs, childLaneSet } : { ...lane, flowNodeRefs }
	})
	return changed ? { ...laneSet, lanes } : laneSet
}

// ── Update label ──────────────────────────────────────────────────────────────

/**
 * Sets the label of `id`: the name of a flow element or sequence flow of
 * `processes[0]` (at any sub-process depth), of a lane of any process, of a
 * pool or a message flow, or the text of a process or collaboration text
 * annotation. A message flow given a name its edge has no label for gets one
 * (`edgeLabelBounds`), or the canvas would not show it. `defs` itself when no
 * element has that id or its label already reads `name`.
 */
export function updateLabel(defs: BpmnDefinitions, id: string, name: string): BpmnDefinitions {
	const process = defs.processes[0]
	if (!process) return defs
	// A label committed as it was (an empty one on an unnamed element too) is no edit: no undo step.
	if ((nameOf(defs, id) ?? "") === name) return defs

	// Check flow elements and sequence flows (recursive — handles subprocess children)
	const r = updateNameInElements(process.flowElements, process.sequenceFlows, id, name)
	if (r.updated) {
		return {
			...defs,
			processes: [
				{ ...process, flowElements: r.elements, sequenceFlows: r.flows },
				...defs.processes.slice(1),
			],
		}
	}

	// Check text annotations (text field, not name)
	const taIndex = process.textAnnotations.findIndex((ta) => ta.id === id)
	if (taIndex >= 0) {
		const newAnnotations = [...process.textAnnotations]
		const ta = newAnnotations[taIndex]
		if (ta) {
			newAnnotations[taIndex] = { ...ta, text: name }
		}
		return {
			...defs,
			processes: [{ ...process, textAnnotations: newAnnotations }, ...defs.processes.slice(1)],
		}
	}

	return renameLane(defs, id, name) ?? renameInCollaborations(defs, id, name) ?? defs
}

/** `defs` with lane `id` of whichever process has it renamed, or undefined when none has. */
function renameLane(defs: BpmnDefinitions, id: string, name: string): BpmnDefinitions | undefined {
	for (const [k, process] of defs.processes.entries()) {
		const laneSet = renamedLaneSet(process.laneSet, id, name, 0)
		if (!laneSet) continue
		const processes = [...defs.processes]
		processes[k] = { ...process, laneSet }
		return { ...defs, processes }
	}
	return undefined
}

/** A copy of `laneSet` with lane `id`, at any depth, renamed; undefined when it has no such lane. */
function renamedLaneSet(
	laneSet: BpmnLaneSet | undefined,
	id: string,
	name: string,
	depth: number,
): BpmnLaneSet | undefined {
	if (!laneSet) return undefined
	if (depth > MAX_NESTING) throw new Error("lanes nested too deep, or cyclic")
	for (const [k, lane] of laneSet.lanes.entries()) {
		const child =
			lane.id === id ? undefined : renamedLaneSet(lane.childLaneSet, id, name, depth + 1)
		if (lane.id !== id && !child) continue
		const lanes = [...laneSet.lanes]
		lanes[k] = child ? { ...lane, childLaneSet: child } : { ...lane, name }
		return { ...laneSet, lanes }
	}
	return undefined
}

/** `defs` with pool, message flow or collaboration text annotation `id` relabelled, or undefined when none is. */
function renameInCollaborations(
	defs: BpmnDefinitions,
	id: string,
	name: string,
): BpmnDefinitions | undefined {
	for (const [k, c] of defs.collaborations.entries()) {
		let next: BpmnCollaboration | undefined
		if (c.participants.some((p) => p.id === id)) {
			next = { ...c, participants: c.participants.map((p) => (p.id === id ? { ...p, name } : p)) }
		} else if (c.textAnnotations.some((ta) => ta.id === id)) {
			const textAnnotations = c.textAnnotations.map((ta) =>
				ta.id === id ? { ...ta, text: name } : ta,
			)
			next = { ...c, textAnnotations }
		} else if (c.messageFlows.some((f) => f.id === id)) {
			const messageFlows = c.messageFlows.map((f) => (f.id === id ? { ...f, name } : f))
			const collaborations = [...defs.collaborations]
			collaborations[k] = { ...c, messageFlows }
			const renamed = { ...defs, collaborations }
			return name ? withEdgeLabel(renamed, id) : renamed
		}
		if (!next) continue
		const collaborations = [...defs.collaborations]
		collaborations[k] = next
		return { ...defs, collaborations }
	}
	return undefined
}

/** `defs` with the edge of `elementId` given label bounds where it has none; `defs` when it has or is not drawn. */
function withEdgeLabel(defs: BpmnDefinitions, elementId: string): BpmnDefinitions {
	const diagrams = defs.diagrams.map((diagram) => {
		const at = diagram.plane.edges.findIndex((e) => e.bpmnElement === elementId)
		const edge = diagram.plane.edges[at]
		const bounds = edge && !edge.label?.bounds ? edgeLabelBounds(edge.waypoints) : undefined
		if (!edge || !bounds) return diagram
		const edges = [...diagram.plane.edges]
		edges[at] = { ...edge, label: { ...edge.label, bounds } }
		return { ...diagram, plane: { ...diagram.plane, edges } }
	})
	return diagrams.every((d, k) => d === defs.diagrams[k]) ? defs : { ...defs, diagrams }
}

/**
 * The label of `id`, the one {@link updateLabel} changes, read from the
 * {@link primaryProcess} first rather than from `processes[0]`, so the editor
 * can call it on the document as loaded. A partner's locked node is read too:
 * it cannot be renamed, but its name is still its name. Undefined when the
 * element has no label or there is no such element.
 */
export function nameOf(defs: BpmnDefinitions, id: string): string | undefined {
	const primary = primaryProcess(defs)
	const processes = primary ? [primary, ...defs.processes.filter((p) => p !== primary)] : []
	for (const process of processes) {
		const flows = new Map<string, BpmnSequenceFlow>()
		collectAllSequenceFlows(process.flowElements, process.sequenceFlows, flows)
		const named = findDeep(process.flowElements, id, 0) ?? flows.get(id)
		if (named) return named.name
		const note = process.textAnnotations.find((ta) => ta.id === id)
		if (note) return note.text
	}
	const lane = defs.processes.flatMap((p) => allLanes(p.laneSet)).find((l) => l.id === id)
	if (lane) return lane.name
	for (const c of defs.collaborations) {
		const pool = c.participants.find((p) => p.id === id)
		if (pool) return pool.name
		const message = c.messageFlows.find((f) => f.id === id)
		if (message) return message.name
		const note = c.textAnnotations.find((ta) => ta.id === id)
		if (note) return note.text
	}
	return undefined
}

/** The flow element `id` among `elements`, at any sub-process depth. */
function findDeep(
	elements: readonly BpmnFlowElement[],
	id: string,
	depth: number,
): BpmnFlowElement | undefined {
	if (depth > MAX_NESTING) throw new Error("sub-processes nested too deep, or cyclic")
	for (const el of elements) {
		if (el.id === id) return el
		const inner = "flowElements" in el ? findDeep(el.flowElements, id, depth + 1) : undefined
		if (inner) return inner
	}
	return undefined
}

// ── Update label position ─────────────────────────────────────────────────────

/** Updates the DI label bounds for a shape (sets explicit external label position). */
export function updateLabelPosition(
	defs: BpmnDefinitions,
	shapeId: string,
	labelBounds: BpmnBounds,
): BpmnDefinitions {
	const diagram = defs.diagrams[0]
	if (!diagram) return defs

	const newShapes = diagram.plane.shapes.map((s) =>
		s.bpmnElement === shapeId ? { ...s, label: { ...s.label, bounds: labelBounds } } : s,
	)

	return {
		...defs,
		diagrams: [
			{ ...diagram, plane: { ...diagram.plane, shapes: newShapes } },
			...defs.diagrams.slice(1),
		],
	}
}

// ── Update edge endpoint ──────────────────────────────────────────────────────

/**
 * Reconnects one endpoint of an edge to a different port on the same
 * source or target shape, recomputing the orthogonal route.
 */
export function updateEdgeEndpoint(
	defs: BpmnDefinitions,
	edgeId: string,
	isStart: boolean,
	newPort: PortDir,
): BpmnDefinitions {
	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram) return defs

	const edge = diagram.plane.edges.find((e) => e.bpmnElement === edgeId)
	if (!edge || edge.waypoints.length < 2) return defs

	const flow = process.sequenceFlows.find((sf) => sf.id === edgeId)
	if (!flow) return defs

	const srcShape = diagram.plane.shapes.find((s) => s.bpmnElement === flow.sourceRef)
	const tgtShape = diagram.plane.shapes.find((s) => s.bpmnElement === flow.targetRef)
	if (!srcShape || !tgtShape) return defs

	const first = edge.waypoints[0]
	const last = edge.waypoints[edge.waypoints.length - 1]
	if (!first || !last) return defs

	const srcPort = isStart ? newPort : portFromWaypoint(first, srcShape.bounds)
	const tgtPort = isStart ? portFromWaypoint(last, tgtShape.bounds) : newPort

	const newWaypoints = computeWaypointsWithPorts(srcShape.bounds, srcPort, tgtShape.bounds, tgtPort)

	const newEdges = diagram.plane.edges.map((e) =>
		e.bpmnElement === edgeId ? { ...e, waypoints: newWaypoints } : e,
	)

	return {
		...defs,
		diagrams: [
			{ ...diagram, plane: { ...diagram.plane, edges: newEdges } },
			...defs.diagrams.slice(1),
		],
	}
}

// ── Edge segment / waypoint manipulation ──────────────────────────────────────

/**
 * Moves an orthogonal edge segment perpendicularly by `delta` units.
 * For horizontal segments delta shifts Y; for vertical segments delta shifts X.
 * Both waypoints of the segment move together, stretching adjacent segments.
 */
export function moveEdgeSegment(
	defs: BpmnDefinitions,
	edgeId: string,
	segIdx: number,
	isHoriz: boolean,
	delta: number,
): BpmnDefinitions {
	const diagram = defs.diagrams[0]
	if (!diagram) return defs
	const edge = diagram.plane.edges.find((e) => e.bpmnElement === edgeId)
	if (!edge || segIdx >= edge.waypoints.length - 1) return defs
	const newWaypoints = edge.waypoints.map((wp, i) => {
		if (i === segIdx || i === segIdx + 1) {
			return isHoriz ? { ...wp, y: wp.y + delta } : { ...wp, x: wp.x + delta }
		}
		return wp
	})
	const newEdges = diagram.plane.edges.map((e) =>
		e.bpmnElement === edgeId ? { ...e, waypoints: newWaypoints } : e,
	)
	return {
		...defs,
		diagrams: [
			{ ...diagram, plane: { ...diagram.plane, edges: newEdges } },
			...defs.diagrams.slice(1),
		],
	}
}

/**
 * Inserts a new waypoint between waypoints[segIdx] and waypoints[segIdx+1].
 * Used for free-form bend creation (diagonal movement allowed).
 */
export function insertEdgeWaypoint(
	defs: BpmnDefinitions,
	edgeId: string,
	segIdx: number,
	pt: { x: number; y: number },
): BpmnDefinitions {
	const diagram = defs.diagrams[0]
	if (!diagram) return defs
	const edge = diagram.plane.edges.find((e) => e.bpmnElement === edgeId)
	if (!edge) return defs
	const newWaypoints = [
		...edge.waypoints.slice(0, segIdx + 1),
		pt,
		...edge.waypoints.slice(segIdx + 1),
	]
	const newEdges = diagram.plane.edges.map((e) =>
		e.bpmnElement === edgeId ? { ...e, waypoints: newWaypoints } : e,
	)
	return {
		...defs,
		diagrams: [
			{ ...diagram, plane: { ...diagram.plane, edges: newEdges } },
			...defs.diagrams.slice(1),
		],
	}
}

/**
 * Moves a single intermediate waypoint (by index) to a new position.
 * Start (0) and end (last) waypoints are not moveable via this function.
 */
export function moveEdgeWaypoint(
	defs: BpmnDefinitions,
	edgeId: string,
	wpIdx: number,
	pt: { x: number; y: number },
): BpmnDefinitions {
	const diagram = defs.diagrams[0]
	if (!diagram) return defs
	const edge = diagram.plane.edges.find((e) => e.bpmnElement === edgeId)
	if (!edge || wpIdx <= 0 || wpIdx >= edge.waypoints.length - 1) return defs
	const newWaypoints = edge.waypoints.map((wp, i) => (i === wpIdx ? { ...pt } : wp))
	const newEdges = diagram.plane.edges.map((e) =>
		e.bpmnElement === edgeId ? { ...e, waypoints: newWaypoints } : e,
	)
	return {
		...defs,
		diagrams: [
			{ ...diagram, plane: { ...diagram.plane, edges: newEdges } },
			...defs.diagrams.slice(1),
		],
	}
}

/**
 * Removes intermediate waypoints that lie exactly on the straight line between
 * their neighbours. Runs iteratively until no more collinear waypoints remain.
 */
export function removeCollinearWaypoints(defs: BpmnDefinitions, edgeId: string): BpmnDefinitions {
	const diagram = defs.diagrams[0]
	if (!diagram) return defs
	const edge = diagram.plane.edges.find((e) => e.bpmnElement === edgeId)
	if (!edge || edge.waypoints.length < 3) return defs

	const EPS = 1.0
	let waypoints = [...edge.waypoints]
	let changed = true
	while (changed) {
		changed = false
		const filtered: BpmnWaypoint[] = [waypoints[0] as BpmnWaypoint]
		for (let i = 1; i < waypoints.length - 1; i++) {
			const a = waypoints[i - 1] as BpmnWaypoint
			const b = waypoints[i] as BpmnWaypoint
			const c = waypoints[i + 1] as BpmnWaypoint
			const cross = Math.abs((c.x - a.x) * (b.y - a.y) - (b.x - a.x) * (c.y - a.y))
			if (cross < EPS) {
				changed = true
			} else {
				filtered.push(b)
			}
		}
		filtered.push(waypoints[waypoints.length - 1] as BpmnWaypoint)
		waypoints = filtered
	}

	const newEdges = diagram.plane.edges.map((e) =>
		e.bpmnElement === edgeId ? { ...e, waypoints } : e,
	)
	return {
		...defs,
		diagrams: [
			{ ...diagram, plane: { ...diagram.plane, edges: newEdges } },
			...defs.diagrams.slice(1),
		],
	}
}

// ── Change element type ───────────────────────────────────────────────────────

/** Activity types that carry `loopCharacteristics` (multi-instance / loop markers). */
const ACTIVITY_LOOP_TYPES: ReadonlySet<string> = new Set([
	"task",
	"serviceTask",
	"userTask",
	"scriptTask",
	"sendTask",
	"receiveTask",
	"businessRuleTask",
	"manualTask",
	"callActivity",
	"subProcess",
	"adHocSubProcess",
	"transaction",
])

/**
 * Replaces a flow element's type while preserving its id, name, and connections.
 * Use this for gateway type-switching (exclusive ↔ parallel) and task type-switching.
 */
export function changeElementType(
	defs: BpmnDefinitions,
	id: string,
	newType: CreateShapeType,
): BpmnDefinitions {
	const process = defs.processes[0]
	if (!process) return defs

	const elIndex = process.flowElements.findIndex((el) => el.id === id)
	if (elIndex < 0) return defs
	const el = process.flowElements[elIndex]
	if (!el) return defs

	const base = {
		id: el.id,
		name: el.name,
		incoming: el.incoming,
		outgoing: el.outgoing,
		documentation: el.documentation,
		isForCompensation: el.isForCompensation,
		extensionElements: el.extensionElements,
		unknownAttributes: el.unknownAttributes,
	}

	let newEl: BpmnFlowElement
	switch (newType) {
		case "startEvent":
			newEl = { ...base, type: "startEvent", eventDefinitions: [] }
			break
		case "messageStartEvent":
			newEl = { ...base, type: "startEvent", eventDefinitions: [{ type: "message" }] }
			break
		case "timerStartEvent":
			newEl = { ...base, type: "startEvent", eventDefinitions: [{ type: "timer" }] }
			break
		case "conditionalStartEvent":
			newEl = { ...base, type: "startEvent", eventDefinitions: [{ type: "conditional" }] }
			break
		case "signalStartEvent":
			newEl = { ...base, type: "startEvent", eventDefinitions: [{ type: "signal" }] }
			break
		case "endEvent":
			newEl = { ...base, type: "endEvent", eventDefinitions: [] }
			break
		case "messageEndEvent":
			newEl = { ...base, type: "endEvent", eventDefinitions: [{ type: "message" }] }
			break
		case "escalationEndEvent":
			newEl = { ...base, type: "endEvent", eventDefinitions: [{ type: "escalation" }] }
			break
		case "errorEndEvent":
			newEl = { ...base, type: "endEvent", eventDefinitions: [{ type: "error" }] }
			break
		case "compensationEndEvent":
			newEl = { ...base, type: "endEvent", eventDefinitions: [{ type: "compensate" }] }
			break
		case "signalEndEvent":
			newEl = { ...base, type: "endEvent", eventDefinitions: [{ type: "signal" }] }
			break
		case "terminateEndEvent":
			newEl = { ...base, type: "endEvent", eventDefinitions: [{ type: "terminate" }] }
			break
		case "intermediateThrowEvent":
			newEl = { ...base, type: "intermediateThrowEvent", eventDefinitions: [] }
			break
		case "intermediateCatchEvent":
			newEl = { ...base, type: "intermediateCatchEvent", eventDefinitions: [] }
			break
		case "messageCatchEvent":
			newEl = { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "message" }] }
			break
		case "messageThrowEvent":
			newEl = { ...base, type: "intermediateThrowEvent", eventDefinitions: [{ type: "message" }] }
			break
		case "timerCatchEvent":
			newEl = { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "timer" }] }
			break
		case "escalationThrowEvent":
			newEl = {
				...base,
				type: "intermediateThrowEvent",
				eventDefinitions: [{ type: "escalation" }],
			}
			break
		case "conditionalCatchEvent":
			newEl = {
				...base,
				type: "intermediateCatchEvent",
				eventDefinitions: [{ type: "conditional" }],
			}
			break
		case "linkCatchEvent":
			newEl = { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "link" }] }
			break
		case "linkThrowEvent":
			newEl = { ...base, type: "intermediateThrowEvent", eventDefinitions: [{ type: "link" }] }
			break
		case "compensationThrowEvent":
			newEl = {
				...base,
				type: "intermediateThrowEvent",
				eventDefinitions: [{ type: "compensate" }],
			}
			break
		case "signalCatchEvent":
			newEl = { ...base, type: "intermediateCatchEvent", eventDefinitions: [{ type: "signal" }] }
			break
		case "signalThrowEvent":
			newEl = { ...base, type: "intermediateThrowEvent", eventDefinitions: [{ type: "signal" }] }
			break
		case "task":
			newEl = { ...base, type: "task" }
			break
		case "serviceTask":
			newEl = { ...base, type: "serviceTask" }
			break
		case "userTask":
			newEl = { ...base, type: "userTask" }
			break
		case "scriptTask":
			newEl = { ...base, type: "scriptTask" }
			break
		case "sendTask":
			newEl = { ...base, type: "sendTask" }
			break
		case "receiveTask":
			newEl = { ...base, type: "receiveTask" }
			break
		case "businessRuleTask":
			newEl = { ...base, type: "businessRuleTask" }
			break
		case "manualTask":
			newEl = { ...base, type: "manualTask" }
			break
		case "callActivity":
			newEl = { ...base, type: "callActivity" }
			break
		case "subProcess":
			newEl = {
				...base,
				type: "subProcess",
				flowElements: el.type === "subProcess" ? el.flowElements : [],
				sequenceFlows: el.type === "subProcess" ? el.sequenceFlows : [],
				textAnnotations: el.type === "subProcess" ? el.textAnnotations : [],
				associations: el.type === "subProcess" ? el.associations : [],
				groups: el.type === "subProcess" ? el.groups : [],
			}
			break
		case "adHocSubProcess":
			newEl = {
				...base,
				type: "adHocSubProcess",
				flowElements: el.type === "adHocSubProcess" ? el.flowElements : [],
				sequenceFlows: el.type === "adHocSubProcess" ? el.sequenceFlows : [],
				textAnnotations: el.type === "adHocSubProcess" ? el.textAnnotations : [],
				associations: el.type === "adHocSubProcess" ? el.associations : [],
				groups: el.type === "adHocSubProcess" ? el.groups : [],
			}
			break
		case "transaction":
			newEl = {
				...base,
				type: "transaction",
				flowElements: el.type === "transaction" ? el.flowElements : [],
				sequenceFlows: el.type === "transaction" ? el.sequenceFlows : [],
				textAnnotations: el.type === "transaction" ? el.textAnnotations : [],
				associations: el.type === "transaction" ? el.associations : [],
				groups: el.type === "transaction" ? el.groups : [],
			}
			break
		case "exclusiveGateway":
			newEl = { ...base, type: "exclusiveGateway" }
			break
		case "parallelGateway":
			newEl = { ...base, type: "parallelGateway" }
			break
		case "inclusiveGateway":
			newEl = { ...base, type: "inclusiveGateway" }
			break
		case "eventBasedGateway":
			newEl = { ...base, type: "eventBasedGateway" }
			break
		case "complexGateway":
			newEl = { ...base, type: "complexGateway" }
			break
		case "textAnnotation":
			throw new Error("textAnnotation is not a flow element — use createAnnotation()")
	}

	// Preserve a multi-instance/loop marker when morphing between activity types
	// that both support one (e.g. serviceTask ⇄ userTask, task → subProcess).
	const loop = "loopCharacteristics" in el ? el.loopCharacteristics : undefined
	if (loop && ACTIVITY_LOOP_TYPES.has(newEl.type)) {
		;(newEl as { loopCharacteristics?: BpmnMultiInstanceLoopCharacteristics }).loopCharacteristics =
			loop
	}

	const newElements = [...process.flowElements]
	newElements[elIndex] = newEl

	const newDefs: BpmnDefinitions = {
		...defs,
		processes: [{ ...process, flowElements: newElements }, ...defs.processes.slice(1)],
	}
	// Same reason as in createShape; an explicit value on the shape wins.
	if (newEl.type !== "exclusiveGateway") return newDefs
	return {
		...newDefs,
		diagrams: newDefs.diagrams.map((diagram) => ({
			...diagram,
			plane: {
				...diagram.plane,
				shapes: diagram.plane.shapes.map((s) =>
					s.bpmnElement === id && s.isMarkerVisible === undefined
						? { ...s, isMarkerVisible: true }
						: s,
				),
			},
		})),
	}
}

// ── Insert shape on edge ──────────────────────────────────────────────────────

/**
 * Splits an existing sequence flow by inserting a shape between its source and
 * target: removes the original edge and creates two new connections
 * (source → shapeId and shapeId → target). Returns `defs` unchanged when
 * `shapeId` cannot end a flow ({@link canEndFlow}): both connections would be
 * refused and the flow lost.
 */
export function insertShapeOnEdge(
	defs: BpmnDefinitions,
	edgeId: string,
	shapeId: string,
): BpmnDefinitions {
	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram || !canEndFlow(defs, shapeId)) return defs

	const flow = process.sequenceFlows.find((sf) => sf.id === edgeId)
	if (!flow) return defs

	const srcDi = diagram.plane.shapes.find((s) => s.bpmnElement === flow.sourceRef)
	const tgtDi = diagram.plane.shapes.find((s) => s.bpmnElement === flow.targetRef)
	const newDi = diagram.plane.shapes.find((s) => s.bpmnElement === shapeId)
	if (!srcDi || !tgtDi || !newDi) return defs

	const withoutEdge = deleteElements(defs, [edgeId])
	const r1 = createConnection(
		withoutEdge,
		flow.sourceRef,
		shapeId,
		computeWaypoints(srcDi.bounds, newDi.bounds),
	)
	const r2 = createConnection(
		r1.defs,
		shapeId,
		flow.targetRef,
		computeWaypoints(newDi.bounds, tgtDi.bounds),
	)
	return r2.defs
}

// ── Copy / paste ──────────────────────────────────────────────────────────────

export interface Clipboard {
	elements: BpmnFlowElement[]
	flows: BpmnSequenceFlow[]
	shapes: BpmnDiShape[]
	edges: BpmnDiEdge[]
}

/** True when a flow element is a container carrying its own children. */
function hasChildren(
	el: BpmnFlowElement,
): el is Extract<BpmnFlowElement, { flowElements: BpmnFlowElement[] }> {
	return "flowElements" in el
}

/** Collects every id that owns a DI shape within `el` (itself + recursive children). */
function collectShapeIds(el: BpmnFlowElement, out: Set<string>): void {
	out.add(el.id)
	if (hasChildren(el)) {
		for (const child of el.flowElements) collectShapeIds(child, out)
		for (const ta of el.textAnnotations) out.add(ta.id)
		for (const g of el.groups) out.add(g.id)
	}
}

/** Collects every id that owns a DI edge within `el` (nested flows + associations). */
function collectEdgeIds(el: BpmnFlowElement, out: Set<string>): void {
	if (hasChildren(el)) {
		for (const sf of el.sequenceFlows) out.add(sf.id)
		for (const a of el.associations) out.add(a.id)
		for (const child of el.flowElements) collectEdgeIds(child, out)
	}
}

export function copyElements(defs: BpmnDefinitions, ids: string[]): Clipboard {
	const idSet = new Set(ids)

	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram) {
		return { elements: [], flows: [], shapes: [], edges: [] }
	}

	const selected = process.flowElements.filter((el) => idSet.has(el.id))

	// Auto-include boundary events attached to any copied host (bpmn-js parity).
	const selectedIds = new Set(selected.map((el) => el.id))
	const boundaries = process.flowElements.filter(
		(el) =>
			el.type === "boundaryEvent" && selectedIds.has(el.attachedToRef) && !selectedIds.has(el.id),
	)
	const elements = [...selected, ...boundaries]
	const topIds = new Set(elements.map((el) => el.id))

	// All shape/edge ids within the copied subtree (recurses into sub-processes).
	const shapeIds = new Set<string>()
	const edgeIds = new Set<string>()
	for (const el of elements) {
		collectShapeIds(el, shapeIds)
		collectEdgeIds(el, edgeIds)
	}

	// Top-level flows whose endpoints are both copied.
	const flows = process.sequenceFlows.filter(
		(sf) => topIds.has(sf.sourceRef) && topIds.has(sf.targetRef),
	)
	for (const sf of flows) edgeIds.add(sf.id)

	const shapes = diagram.plane.shapes.filter((s) => shapeIds.has(s.bpmnElement))
	const edges = diagram.plane.edges.filter((e) => edgeIds.has(e.bpmnElement))

	return { elements, flows, shapes, edges }
}

/** Assigns a fresh id to `el` and every descendant / nested edge, recording the mapping. */
function buildIdMap(el: BpmnFlowElement, map: Map<string, string>, ids: IdFactory): void {
	map.set(el.id, ids(el.type))
	if (hasChildren(el)) {
		for (const child of el.flowElements) buildIdMap(child, map, ids)
		for (const sf of el.sequenceFlows) map.set(sf.id, ids("Flow"))
		for (const ta of el.textAnnotations) map.set(ta.id, ids("TextAnnotation"))
		for (const a of el.associations) map.set(a.id, ids("Association"))
		for (const g of el.groups) map.set(g.id, ids("Group"))
	}
}

/** Deep-clones `el`, remapping its own id, refs, and all nested children through `map`. */
function remapElement(el: BpmnFlowElement, map: Map<string, string>): BpmnFlowElement {
	const clone: BpmnFlowElement = {
		...el,
		id: map.get(el.id) ?? el.id,
		incoming: el.incoming.map((r) => map.get(r)).filter((r): r is string => r !== undefined),
		outgoing: el.outgoing.map((r) => map.get(r)).filter((r): r is string => r !== undefined),
	}
	if (clone.type === "boundaryEvent" && el.type === "boundaryEvent") {
		clone.attachedToRef = map.get(el.attachedToRef) ?? el.attachedToRef
	}
	if (hasChildren(el) && hasChildren(clone)) {
		clone.flowElements = el.flowElements.map((c) => remapElement(c, map))
		clone.sequenceFlows = el.sequenceFlows.map((sf) => remapFlow(sf, map))
		clone.textAnnotations = el.textAnnotations.map((ta) => ({
			...ta,
			id: map.get(ta.id) ?? ta.id,
		}))
		clone.associations = el.associations.map((a) => ({
			...a,
			id: map.get(a.id) ?? a.id,
			sourceRef: map.get(a.sourceRef) ?? a.sourceRef,
			targetRef: map.get(a.targetRef) ?? a.targetRef,
		}))
		clone.groups = el.groups.map((g) => ({ ...g, id: map.get(g.id) ?? g.id }))
	}
	return clone
}

function remapFlow(sf: BpmnSequenceFlow, map: Map<string, string>): BpmnSequenceFlow {
	return {
		...sf,
		id: map.get(sf.id) ?? sf.id,
		sourceRef: map.get(sf.sourceRef) ?? sf.sourceRef,
		targetRef: map.get(sf.targetRef) ?? sf.targetRef,
	}
}

export function pasteElements(
	defs: BpmnDefinitions,
	clipboard: Clipboard,
	offsetX: number,
	offsetY: number,
	ids: IdFactory = genId,
): { defs: BpmnDefinitions; newIds: Map<string, string>; topLevelIds: string[] } {
	const newIds = new Map<string, string>()
	// A clipboard of only pools, lanes or locked nodes copied nothing: no edit, no undo step.
	if (clipboard.elements.length === 0) return { defs, newIds, topLevelIds: [] }

	// Generate new IDs for every element (recursively) and top-level flow.
	for (const el of clipboard.elements) buildIdMap(el, newIds, ids)
	for (const sf of clipboard.flows) newIds.set(sf.id, ids("Flow"))

	const process = defs.processes[0]
	const diagram = defs.diagrams[0]
	if (!process || !diagram) return { defs, newIds, topLevelIds: [] }

	const newElements = clipboard.elements.map((el) => remapElement(el, newIds))
	const newFlows = clipboard.flows.map((sf) => remapFlow(sf, newIds))

	// Create new DI shapes with offset (covers nested descendants too).
	const newDiShapes: BpmnDiShape[] = clipboard.shapes.map((s) => {
		const newElId = newIds.get(s.bpmnElement) ?? s.bpmnElement
		return {
			...s,
			id: ids(`${newElId}_di`),
			bpmnElement: newElId,
			bounds: {
				...s.bounds,
				x: s.bounds.x + offsetX,
				y: s.bounds.y + offsetY,
			},
		}
	})

	// Create new DI edges with offset waypoints (covers nested flows/associations).
	const newDiEdges: BpmnDiEdge[] = clipboard.edges.map((e) => {
		const newFlowId = newIds.get(e.bpmnElement) ?? e.bpmnElement
		return {
			...e,
			id: ids(`${newFlowId}_di`),
			bpmnElement: newFlowId,
			waypoints: e.waypoints.map((wp) => ({
				x: wp.x + offsetX,
				y: wp.y + offsetY,
			})),
		}
	})

	const newDefs: BpmnDefinitions = {
		...defs,
		processes: [
			{
				...process,
				flowElements: [...process.flowElements, ...newElements],
				sequenceFlows: [...process.sequenceFlows, ...newFlows],
			},
			...defs.processes.slice(1),
		],
		diagrams: [
			{
				...diagram,
				plane: {
					...diagram.plane,
					shapes: [...diagram.plane.shapes, ...newDiShapes],
					edges: [...diagram.plane.edges, ...newDiEdges],
				},
			},
			...defs.diagrams.slice(1),
		],
	}

	const topLevelIds = clipboard.elements
		.map((el) => newIds.get(el.id))
		.filter((id): id is string => id !== undefined)

	return { defs: newDefs, newIds, topLevelIds }
}

// ── Create text annotation ────────────────────────────────────────────────────

export function createAnnotation(
	defs: BpmnDefinitions,
	bounds: BpmnBounds,
	text?: string,
	ids: IdFactory = genId,
): { defs: BpmnDefinitions; id: string } {
	const id = ids("TextAnnotation")
	const shapeId = ids("TextAnnotation_di")

	const annotation: BpmnTextAnnotation = { id, text, unknownAttributes: {} }
	const diShape: BpmnDiShape = { id: shapeId, bpmnElement: id, bounds, unknownAttributes: {} }

	const process = defs.processes[0]
	if (!process) return { defs, id }
	const diagram = defs.diagrams[0]
	if (!diagram) return { defs, id }

	return {
		defs: {
			...defs,
			processes: [
				{ ...process, textAnnotations: [...process.textAnnotations, annotation] },
				...defs.processes.slice(1),
			],
			diagrams: [
				{
					...diagram,
					plane: { ...diagram.plane, shapes: [...diagram.plane.shapes, diShape] },
				},
				...defs.diagrams.slice(1),
			],
		},
		id,
	}
}

export function createAnnotationWithLink(
	defs: BpmnDefinitions,
	bounds: BpmnBounds,
	sourceId: string,
	sourceBounds: BpmnBounds,
	text?: string,
	ids: IdFactory = genId,
): { defs: BpmnDefinitions; annotationId: string; associationId: string } {
	// A partner's node is not in processes[0]: its association would dangle there.
	if (lockedIds(defs).has(sourceId)) return { defs, annotationId: "", associationId: "" }
	const annotResult = createAnnotation(defs, bounds, text, ids)
	const annotationId = annotResult.id
	const assocId = ids("Association")
	const edgeId = ids("Association_di")

	const assoc: BpmnAssociation = {
		id: assocId,
		sourceRef: sourceId,
		targetRef: annotationId,
		associationDirection: "None",
		unknownAttributes: {},
	}
	const waypoints = computeWaypoints(sourceBounds, bounds)
	const edge: BpmnDiEdge = { id: edgeId, bpmnElement: assocId, waypoints, unknownAttributes: {} }

	const d = annotResult.defs
	const process = d.processes[0]
	const diagram = d.diagrams[0]
	if (!process || !diagram) return { defs: d, annotationId, associationId: assocId }

	return {
		defs: {
			...d,
			processes: [
				{ ...process, associations: [...process.associations, assoc] },
				...d.processes.slice(1),
			],
			diagrams: [
				{
					...diagram,
					plane: { ...diagram.plane, edges: [...diagram.plane.edges, edge] },
				},
				...d.diagrams.slice(1),
			],
		},
		annotationId,
		associationId: assocId,
	}
}

// ── Update shape color ────────────────────────────────────────────────────────

export function updateShapeColor(
	defs: BpmnDefinitions,
	id: string,
	color: DiColor,
): BpmnDefinitions {
	const diagram = defs.diagrams[0]
	if (!diagram) return defs

	const newShapes = diagram.plane.shapes.map((s) =>
		s.bpmnElement === id
			? { ...s, unknownAttributes: writeDiColor(s.unknownAttributes, color) }
			: s,
	)

	// Add color namespaces when any color is set
	const needsNs = !!(color.fill ?? color.stroke)
	const newNamespaces = needsNs
		? { ...defs.namespaces, bioc: BIOC_NS, color: COLOR_NS }
		: defs.namespaces

	return {
		...defs,
		namespaces: newNamespaces,
		diagrams: [
			{ ...diagram, plane: { ...diagram.plane, shapes: newShapes } },
			...defs.diagrams.slice(1),
		],
	}
}
