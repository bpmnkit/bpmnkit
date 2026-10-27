import type { XmlElement } from "../types/xml-element.js"
import { assertBpmnDefinitions, assertCompactDiagram } from "./argument-guards.js"
import type {
	BpmnCollaboration,
	BpmnDefinitions,
	BpmnFlowElement,
	BpmnLane,
	BpmnLaneSet,
	BpmnMessageFlow,
	BpmnParticipant,
	BpmnProcess,
	BpmnSequenceFlow,
} from "./bpmn-model.js"
import {
	type CompactDiagram,
	type CompactElement,
	type CompactLane,
	type CompactMessageFlow,
	type CompactParticipant,
	buildFlowElement,
	compactifyLanes,
	compactifyMessageFlow,
	compactifyParticipant,
	defaultFlows,
	executability,
	expandCollaborations,
	fillLanes,
	isPooled,
	makeEventDef,
	withLanes,
} from "./compact.js"
import type { BpmnOperation } from "./operations.js"
import { allLanes, poolLanedProcesses, pruneLaneRefs } from "./swimlanes.js"
import {
	bpmnElementName,
	ensureZeebeExtension,
	isZeebePlacementAllowed,
} from "./zeebe-extensions.js"

/**
 * Applies the {@link BpmnOperation} vocabulary directly to a
 * {@link BpmnDefinitions}.
 *
 * The operations were originally applied to a `CompactDiagram`, which meant
 * every edit round-tripped the model through a projection that models about
 * fifteen properties — so editing a task's name silently discarded the
 * document's pools, lanes, data associations and `zeebe:ioMapping` detail.
 * Applying the same operations here touches only what an operation names and
 * leaves the rest of the element untouched.
 *
 * Unresolved ids are reported rather than ignored. The original implementation
 * skipped any operation whose target did not exist, so a patch with a
 * misspelled id reported success and changed nothing.
 */

/** An operation that could not be applied, and why. */
export interface OperationProblem {
	/** Position in the operation list, so a caller can point at the offender. */
	index: number
	/** The operation as given. */
	operation: BpmnOperation
	/** What went wrong, in a form worth showing a user. */
	reason: string
}

export interface ApplyBpmnOperationsResult {
	/** The edited model. The input is never mutated. */
	definitions: BpmnDefinitions
	/** How many operations took effect. */
	applied: number
	/** Operations that did not, each with a reason. */
	problems: OperationProblem[]
}

export interface ApplyBpmnOperationsOptions {
	/**
	 * Throw if any operation fails, leaving the model untouched. Default `true`
	 * — silence is what made the previous implementation dangerous.
	 */
	strict?: boolean
}

/** Thrown by {@link applyBpmnOperations} in strict mode. */
export class OperationError extends Error {
	readonly problems: OperationProblem[]

	constructor(problems: OperationProblem[]) {
		super(
			`${problems.length} operation(s) could not be applied: ${problems
				.map((problem) => `[${problem.index}] ${problem.reason}`)
				.join("; ")}`,
		)
		this.name = "OperationError"
		this.problems = problems
	}
}

interface Container {
	flowElements: BpmnFlowElement[]
	sequenceFlows: BpmnSequenceFlow[]
}

function containersOf(definitions: BpmnDefinitions): Container[] {
	const containers: Container[] = []
	const visit = (container: Container): void => {
		containers.push(container)
		for (const element of container.flowElements) {
			if ("flowElements" in element && "sequenceFlows" in element) {
				visit(element as unknown as Container)
			}
		}
	}
	for (const process of definitions.processes) visit(process)
	return containers
}

function findElement(
	definitions: BpmnDefinitions,
	id: string,
): { container: Container; element: BpmnFlowElement } | undefined {
	for (const container of containersOf(definitions)) {
		const element = container.flowElements.find((candidate) => candidate.id === id)
		if (element) return { container, element }
	}
	return undefined
}

function findFlow(
	definitions: BpmnDefinitions,
	id: string,
): { container: Container; flow: BpmnSequenceFlow } | undefined {
	for (const container of containersOf(definitions)) {
		const flow = container.sequenceFlows.find((candidate) => candidate.id === id)
		if (flow) return { container, flow }
	}
	return undefined
}

/**
 * The container an operation should act in: a named process or sub-process, or
 * the first process when none is named.
 */
function resolveContainer(
	definitions: BpmnDefinitions,
	parentId: string | undefined,
): Container | undefined {
	if (parentId === undefined) return definitions.processes[0]

	const process = definitions.processes.find((candidate) => candidate.id === parentId)
	if (process) return process

	const found = findElement(definitions, parentId)
	if (!found) return undefined
	const element = found.element
	return "flowElements" in element && "sequenceFlows" in element
		? (element as unknown as Container)
		: undefined
}

function nextFlowId(definitions: BpmnDefinitions): string {
	const taken = new Set(
		containersOf(definitions).flatMap((container) => container.sequenceFlows.map((f) => f.id)),
	)
	let index = taken.size + 1
	while (taken.has(`flow_${index}`)) index++
	return `flow_${index}`
}

/**
 * Finds an extension element by name, creating it if it is not there yet.
 *
 * Zeebe extensions go through {@link ensureZeebeExtension}, which refuses a
 * placement the schema forbids — writing `zeebe:calledDecision` onto a service
 * task produces a file Camunda rejects at deploy time, and an operation that
 * asks for it is a mistake worth reporting here rather than there.
 */
function ensureExtension(element: BpmnFlowElement, name: string): XmlElement {
	if (name.startsWith("zeebe:")) return ensureZeebeExtension(element, name)
	const existing = element.extensionElements.find((candidate) => candidate.name === name)
	if (existing) return existing
	const created: XmlElement = { name, attributes: {}, children: [] }
	element.extensionElements.push(created)
	return created
}

/** The Zeebe extension each patch field writes to, for the placement check. */
const PATCH_EXTENSIONS: ReadonlyArray<[keyof CompactElement, string]> = [
	["jobType", "zeebe:taskDefinition"],
	["formId", "zeebe:formDefinition"],
	["calledProcess", "zeebe:calledElement"],
	["decisionId", "zeebe:calledDecision"],
	["script", "zeebe:script"],
	["inputs", "zeebe:ioMapping"],
	["outputs", "zeebe:ioMapping"],
	["nativeUserTask", "zeebe:userTask"],
	["taskHeaders", "zeebe:taskHeaders"],
]

/**
 * Reports a patch field that would write an extension the Zeebe schema does not
 * allow on this element — `decisionId` on a service task, say.
 *
 * Checked before anything is written so the operation stays atomic: it is
 * reported like any other failed operation rather than thrown, which is what
 * lets a non-strict caller apply the rest of the batch and show the user what
 * was rejected.
 */
function misplacedExtensions(
	element: BpmnFlowElement,
	patch: Partial<CompactElement>,
): string | undefined {
	const owner = bpmnElementName(element)
	for (const [field, extension] of PATCH_EXTENSIONS) {
		if (patch[field] === undefined) continue
		if (isZeebePlacementAllowed(owner, extension)) continue
		return `${String(field)} writes <${extension}>, which the Zeebe schema does not allow on <${owner}>`
	}
	return undefined
}

/**
 * Sets one attribute on one extension element.
 *
 * Deliberately not a wholesale replacement: `zeebe:taskDefinition` also carries
 * `retries`, `zeebe:calledElement` carries `propagateAllChildVariables`, and the
 * compact form models none of them. Rebuilding the element from the compact
 * fields would drop them, which is the loss this module exists to avoid.
 */
function setExtensionAttribute(
	element: BpmnFlowElement,
	extensionName: string,
	attribute: string,
	value: string,
): void {
	ensureExtension(element, extensionName).attributes[attribute] = value
}

/** Replaces the `zeebe:taskHeaders` children, which are a map and move together. */
function setTaskHeaders(element: BpmnFlowElement, headers: Record<string, string>): void {
	const extension = ensureExtension(element, "zeebe:taskHeaders")
	extension.children = Object.entries(headers).map(([key, value]) => ({
		name: "zeebe:header",
		attributes: { key, value },
		children: [],
	}))
}

/** Sets the named mappings of one kind, keeping the others of the `zeebe:ioMapping`. */
function setMappings(
	element: BpmnFlowElement,
	kind: "zeebe:input" | "zeebe:output",
	mappings: Record<string, string>,
): void {
	const ioMapping = ensureExtension(element, "zeebe:ioMapping")
	for (const [target, source] of Object.entries(mappings)) {
		const existing = ioMapping.children.find(
			(child) => child.name === kind && child.attributes.target === target,
		)
		if (existing) existing.attributes.source = source
		else ioMapping.children.push({ name: kind, attributes: { source, target }, children: [] })
	}
}

/**
 * Points a service task's result at a variable, keeping the rest of its
 * `zeebe:ioMapping`. On a business rule task the result variable lives on
 * `zeebe:calledDecision` instead.
 */
function setResultVariable(element: BpmnFlowElement, resultVariable: string): void {
	const calledDecision = element.extensionElements.find(
		(e) => e.name === "zeebe:calledDecision" || e.name === "zeebe:script",
	)
	if (calledDecision) {
		calledDecision.attributes.resultVariable = resultVariable
		return
	}

	const mapping = ensureExtension(element, "zeebe:ioMapping")
	const outputs = mapping.children.filter((child) => child.name === "zeebe:output")

	// `compactify` reads the result variable from the single output of an
	// ioMapping, whatever its source, so this has to write back to that same
	// one. Matching on a particular source instead appends a second output and
	// the mapping grows on every edit.
	const single = outputs.length === 1 ? outputs[0] : undefined
	if (single) {
		single.attributes.target = resultVariable
		return
	}

	// No output to update, or several with no way to tell which is primary:
	// add one wired to the connector response, the shape `expand` produces.
	mapping.children.push({
		name: "zeebe:output",
		attributes: { source: "= response", target: resultVariable },
		children: [],
	})
}

/**
 * Applies the compact fields a patch names onto an existing element.
 *
 * Only the named fields move, and each moves the smallest thing it can: one
 * attribute rather than one extension element, so everything the compact form
 * does not model stays exactly as it was.
 */
function patchElement(
	element: BpmnFlowElement,
	patch: Partial<CompactElement>,
): string | undefined {
	if (patch.type !== undefined && patch.type !== element.type) {
		return `changing type (${element.type} → ${patch.type}) needs a delete and an insert, so that what the new element should carry is explicit`
	}

	const misplaced = misplacedExtensions(element, patch)
	if (misplaced !== undefined) return misplaced

	if (patch.name !== undefined) element.name = patch.name
	if (patch.documentation !== undefined) element.documentation = patch.documentation
	if (patch.attachedTo !== undefined && "attachedToRef" in element) {
		element.attachedToRef = patch.attachedTo
	}
	if (patch.interrupting !== undefined && "cancelActivity" in element) {
		element.cancelActivity = patch.interrupting
	}
	if (patch.jobType !== undefined) {
		setExtensionAttribute(element, "zeebe:taskDefinition", "type", patch.jobType)
	}
	if (patch.formId !== undefined) {
		setExtensionAttribute(element, "zeebe:formDefinition", "formId", patch.formId)
	}
	if (patch.calledProcess !== undefined) {
		setExtensionAttribute(element, "zeebe:calledElement", "processId", patch.calledProcess)
	}
	if (patch.decisionId !== undefined) {
		setExtensionAttribute(element, "zeebe:calledDecision", "decisionId", patch.decisionId)
	}
	if (patch.script !== undefined) {
		const script = ensureExtension(element, "zeebe:script")
		script.attributes.expression = patch.script
		// Camunda will not deploy a script without the variable its value goes to
		script.attributes.resultVariable ??= patch.resultVariable ?? "result"
	}
	if (patch.resultVariable !== undefined) setResultVariable(element, patch.resultVariable)
	if (patch.inputs !== undefined) setMappings(element, "zeebe:input", patch.inputs)
	if (patch.outputs !== undefined) setMappings(element, "zeebe:output", patch.outputs)
	if (patch.nativeUserTask && element.type === "userTask")
		ensureExtension(element, "zeebe:userTask")
	if (patch.taskHeaders !== undefined) setTaskHeaders(element, patch.taskHeaders)

	if (patch.eventType !== undefined && "eventDefinitions" in element) {
		const current = element.eventDefinitions[0]?.type
		if (current !== patch.eventType) {
			const replacement = makeEventDef(patch.eventType)
			element.eventDefinitions = replacement ? [replacement] : []
		}
	}

	return undefined
}

/**
 * Applies operations to a copy of the model.
 *
 * @param definitions - The model to edit. Never mutated.
 * @param operations - Operations to apply, in order.
 * @param options - `strict` (default `true`) throws instead of returning problems.
 * @returns The edited model, how many operations landed, and what did not.
 * @throws {OperationError} In strict mode, when any operation fails. Nothing is
 *   applied — the caller's model and the returned one are both untouched.
 *
 * @example
 * ```typescript
 * import { applyBpmnOperations } from "@bpmnkit/core"
 *
 * const { definitions } = applyBpmnOperations(parsed, [
 *   { op: "rename", id: "Task_1", name: "Approve invoice" },
 * ])
 * ```
 */
export function applyBpmnOperations(
	definitions: BpmnDefinitions,
	operations: readonly BpmnOperation[],
	options: ApplyBpmnOperationsOptions = {},
): ApplyBpmnOperationsResult {
	assertBpmnDefinitions(definitions, "applyBpmnOperations")
	const draft = structuredClone(definitions) as BpmnDefinitions
	const problems: OperationProblem[] = []
	let applied = 0
	const inserted: string[] = []

	operations.forEach((operation, index) => {
		const reason = applyOne(draft, operation)
		if (reason !== undefined) problems.push({ index, operation, reason })
		else {
			applied++
			if (operation.op === "insert") inserted.push(operation.element.id)
		}
	})

	if ((options.strict ?? true) && problems.length > 0) {
		throw new OperationError(problems)
	}

	// After every operation rather than at the insert, so the flows a batch adds
	// next to a new node decide its lane.
	draft.processes = draft.processes.map((process) => fillLanes(process, inserted))
	return { definitions: draft, applied, problems }
}

function applyOne(definitions: BpmnDefinitions, operation: BpmnOperation): string | undefined {
	switch (operation.op) {
		case "rename": {
			const found = findElement(definitions, operation.id)
			if (!found) return `no element with id "${operation.id}"`
			found.element.name = operation.name
			return undefined
		}

		case "update": {
			const found = findElement(definitions, operation.id)
			if (!found) return `no element with id "${operation.id}"`
			return patchElement(found.element, operation.patch)
		}

		case "delete": {
			const found = findElement(definitions, operation.id)
			if (!found) return `no element with id "${operation.id}"`
			found.container.flowElements = found.container.flowElements.filter(
				(element) => element.id !== operation.id,
			)
			// A flow to or from a removed element would dangle.
			found.container.sequenceFlows = found.container.sequenceFlows.filter(
				(flow) => flow.sourceRef !== operation.id && flow.targetRef !== operation.id,
			)
			recomputeRefs(found.container)
			// A lane ref or a message flow naming the removed node would dangle too.
			definitions.processes = definitions.processes.map((process) =>
				process === found.container ? pruneLaneRefs(process) : process,
			)
			for (const collaboration of definitions.collaborations) {
				collaboration.messageFlows = collaboration.messageFlows.filter(
					(flow) => flow.sourceRef !== operation.id && flow.targetRef !== operation.id,
				)
			}
			return undefined
		}

		case "insert": {
			const container = resolveContainer(definitions, operation.parent)
			if (!container) {
				return operation.parent === undefined
					? "the document has no process to insert into"
					: `no container with id "${operation.parent}"`
			}
			if (findElement(definitions, operation.element.id)) {
				return `id "${operation.element.id}" is already taken`
			}

			const element = buildFlowElement(operation.element, [], [])
			const anchor = operation.after ?? operation.before
			if (anchor !== undefined) {
				const at = container.flowElements.findIndex((candidate) => candidate.id === anchor)
				if (at === -1) return `no element with id "${anchor}" to insert next to`
				container.flowElements.splice(operation.after !== undefined ? at + 1 : at, 0, element)
			} else {
				container.flowElements.push(element)
			}
			return undefined
		}

		case "add_flow": {
			const container = resolveContainer(definitions, operation.parent)
			if (!container) {
				return operation.parent === undefined
					? "the document has no process to add a flow to"
					: `no container with id "${operation.parent}"`
			}
			if (!findElement(definitions, operation.from)) return `no element with id "${operation.from}"`
			if (!findElement(definitions, operation.to)) return `no element with id "${operation.to}"`

			const id = operation.id ?? nextFlowId(definitions)
			if (findFlow(definitions, id)) return `flow id "${id}" is already taken`

			const flow: BpmnSequenceFlow = {
				id,
				sourceRef: operation.from,
				targetRef: operation.to,
				extensionElements: [],
				unknownAttributes: {},
			}
			if (operation.name) flow.name = operation.name
			if (operation.condition) {
				flow.conditionExpression = { text: operation.condition, attributes: {} }
			}
			container.sequenceFlows.push(flow)
			recomputeRefs(container)
			return undefined
		}

		case "delete_flow": {
			const found = findFlow(definitions, operation.id)
			if (!found) return `no sequence flow with id "${operation.id}"`
			found.container.sequenceFlows = found.container.sequenceFlows.filter(
				(flow) => flow.id !== operation.id,
			)
			recomputeRefs(found.container)
			return undefined
		}

		case "redirect_flow": {
			const found = findFlow(definitions, operation.id)
			if (!found) return `no sequence flow with id "${operation.id}"`
			if (operation.from !== undefined) {
				if (!findElement(definitions, operation.from)) {
					return `no element with id "${operation.from}"`
				}
				found.flow.sourceRef = operation.from
			}
			if (operation.to !== undefined) {
				if (!findElement(definitions, operation.to)) return `no element with id "${operation.to}"`
				found.flow.targetRef = operation.to
			}
			recomputeRefs(found.container)
			return undefined
		}
	}
}

/** Rebuilds every element's `incoming`/`outgoing` from the container's flows. */
function recomputeRefs(container: Container): void {
	for (const element of container.flowElements) {
		element.incoming = []
		element.outgoing = []
	}
	const byId = new Map(container.flowElements.map((element) => [element.id, element]))
	for (const flow of container.sequenceFlows) {
		byId.get(flow.sourceRef)?.outgoing.push(flow.id)
		byId.get(flow.targetRef)?.incoming.push(flow.id)
	}
}

/**
 * Applies a {@link CompactDiagram} onto an existing model as a set of changes,
 * rather than expanding it into a replacement.
 *
 * `expand(compact)` builds a whole new model from about fifteen properties per
 * element, so using it to apply an edit destroys everything the compact form
 * does not carry. This walks the same input as a description of the intended
 * topology and turns it into {@link BpmnOperation}s: elements that already exist
 * are patched in place and keep their extensions, new ones are inserted, and
 * ones the input no longer mentions are removed.
 *
 * Processes are only ever added, never removed — a caller sending one process of
 * a multi-process document means "this is how that process should look", not
 * "delete the others".
 *
 * Lanes, pools and executability follow the same rule: a key the compact leaves
 * out leaves that part of the model alone. A process's `lanes` rebuilds its
 * membership (an empty list removes the lane set), keeping the attributes and
 * extensions of every lane whose id survives; members that are not top-level
 * flow nodes are dropped and unlisted nodes are placed as {@link expand} places
 * them. `participants` and `messageFlows` replace those of the first
 * collaboration, keeping what the compact form does not carry (`messageRef`,
 * extensions, foreign attributes) on every id that survives. A laned process
 * without a pool then gets one. A process the compact adds gets the
 * `isExecutable` {@link expand} would give it, so a keyless partner pool is
 * not executable. Without the keys, a deleted node still leaves
 * its lanes and message flows, and an inserted one joins its predecessor's lane.
 *
 * @param definitions - The model to update. Never mutated.
 * @param compact - The intended topology.
 * @param options - `strict` (default `true`) throws instead of returning problems.
 * @returns The updated model, plus what applied and what did not.
 */
export function reconcileCompact(
	definitions: BpmnDefinitions,
	compact: CompactDiagram,
	options: ApplyBpmnOperationsOptions = {},
): ApplyBpmnOperationsResult {
	assertBpmnDefinitions(definitions, "reconcileCompact")
	assertCompactDiagram(compact, "reconcileCompact")
	const draft = structuredClone(definitions) as BpmnDefinitions

	// A new process gets the executability expand would give it: Flowable deploys
	// a process with no isExecutable, so a keyless partner pool must say false.
	// poolLanedProcesses cannot, as it only marks the pools it creates itself.
	const executable = executability(compact, isPooled(compact))
	compact.processes.forEach((compactProcess, index) => {
		if (!draft.processes.some((process) => process.id === compactProcess.id)) {
			draft.processes.push({
				id: compactProcess.id,
				name: compactProcess.name,
				...(executable[index] === false ? { isExecutable: false } : {}),
				extensionElements: [],
				flowElements: [],
				sequenceFlows: [],
				textAnnotations: [],
				associations: [],
				groups: [],
				unknownAttributes: {},
			})
		}
	})

	const result = applyBpmnOperations(draft, operationsForCompact(draft, compact), options)
	reconcileDefaultFlows(result.definitions, compact)
	return { ...result, definitions: reconcilePools(result.definitions, compact) }
}

/**
 * Applies the `executable`, `lanes`, `participants` and `messageFlows` keys
 * `compact` carries. A key that says what the model already says changes
 * nothing, so reconciling `compactify(defs)` onto `defs` stays a no-op.
 */
function reconcilePools(definitions: BpmnDefinitions, compact: CompactDiagram): BpmnDefinitions {
	const wanted = new Map(compact.processes.map((process) => [process.id, process]))
	let changed = false
	const processes = definitions.processes.map((process) => {
		const compactProcess = wanted.get(process.id)
		let next = process
		const executable = compactProcess?.executable
		// An absent attribute already means executable (Flowable), so `true` leaves it absent.
		if (executable !== undefined && executable !== (next.isExecutable !== false)) {
			next = { ...next, isExecutable: executable }
		}
		const lanes = compactProcess?.lanes
		if (lanes !== undefined && !sameJson(compactifyLanes(next), lanes)) {
			next = relane(next, lanes)
			changed = true
		}
		return next
	})
	const first = definitions.collaborations[0]
	const poolsChanged =
		(compact.participants !== undefined &&
			!sameJson(first?.participants.map(compactifyParticipant) ?? [], compact.participants)) ||
		(compact.messageFlows !== undefined &&
			!sameJson(first?.messageFlows.map(compactifyMessageFlow) ?? [], compact.messageFlows))
	if (!changed && !poolsChanged) return { ...definitions, processes }

	return poolLanedProcesses({
		...definitions,
		processes,
		collaborations: poolsChanged
			? reconcileCollaborations({ ...definitions, processes }, compact)
			: definitions.collaborations,
	})
}

/** Equal as JSON: key order counts, so a reordered but equal input reads as a change, which is safe. */
function sameJson(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b)
}

/** `process` with the membership `lanes` describes, keeping what each surviving lane carries. */
function relane(process: BpmnProcess, lanes: readonly CompactLane[]): BpmnProcess {
	const { laneSet: previous, ...bare } = process
	if (lanes.length === 0) return bare
	const rebuilt = pruneLaneRefs(withLanes(bare, lanes)).laneSet
	if (rebuilt === undefined) return bare

	const before = new Map(allLanes(previous).map((lane) => [lane.id, lane]))
	// `rebuilt` comes from buildLaneSet, which refuses a looping tree, so this terminates.
	const mergeSet = (built: BpmnLaneSet, old: BpmnLaneSet | undefined): BpmnLaneSet => ({
		...built,
		...old,
		lanes: built.lanes.map(mergeLane),
	})
	const mergeLane = (built: BpmnLane): BpmnLane => {
		const old = before.get(built.id)
		const { childLaneSet: _oldChildren, ...kept } = old ?? { unknownAttributes: {} }
		const lane: BpmnLane = { ...kept, id: built.id, flowNodeRefs: built.flowNodeRefs }
		if (built.name !== undefined) lane.name = built.name
		if (built.childLaneSet !== undefined) {
			lane.childLaneSet = mergeSet(built.childLaneSet, old?.childLaneSet)
		}
		return lane
	}
	return { ...bare, laneSet: mergeSet(rebuilt, previous) }
}

/** The collaborations once the compact's `participants` and `messageFlows` keys are applied. */
function reconcileCollaborations(
	definitions: BpmnDefinitions,
	compact: CompactDiagram,
): BpmnCollaboration[] {
	if (compact.participants === undefined && compact.messageFlows === undefined) {
		return definitions.collaborations
	}
	const [first, ...rest] = definitions.collaborations
	if (first === undefined) return expandCollaborations(compact, documentIds(definitions, compact))
	return [
		{
			...first,
			participants:
				compact.participants?.map((participant) =>
					mergeParticipant(
						first.participants.find((p) => p.id === participant.id),
						participant,
					),
				) ?? first.participants,
			messageFlows:
				compact.messageFlows?.map((flow) =>
					mergeMessageFlow(
						first.messageFlows.find((f) => f.id === flow.id),
						flow,
					),
				) ?? first.messageFlows,
		},
		...rest,
	]
}

function mergeParticipant(
	old: BpmnParticipant | undefined,
	wanted: CompactParticipant,
): BpmnParticipant {
	const { processRef: _oldRef, ...kept } = old ?? { unknownAttributes: {} }
	const participant: BpmnParticipant = { ...kept, id: wanted.id }
	if (wanted.name !== undefined) participant.name = wanted.name
	if (wanted.processId !== undefined) participant.processRef = wanted.processId
	return participant
}

function mergeMessageFlow(
	old: BpmnMessageFlow | undefined,
	wanted: CompactMessageFlow,
): BpmnMessageFlow {
	const flow: BpmnMessageFlow = {
		...(old ?? { unknownAttributes: {} }),
		id: wanted.id,
		sourceRef: wanted.source,
		targetRef: wanted.target,
	}
	if (wanted.name !== undefined) flow.name = wanted.name
	return flow
}

/** Ids a new collaboration must not take: every process, element, flow and lane, and the compact's pool ids. */
function documentIds(definitions: BpmnDefinitions, compact: CompactDiagram): Set<string> {
	const ids = new Set<string>()
	for (const container of containersOf(definitions)) {
		for (const item of [...container.flowElements, ...container.sequenceFlows]) ids.add(item.id)
	}
	for (const process of definitions.processes) {
		ids.add(process.id)
		for (const lane of allLanes(process.laneSet)) ids.add(lane.id)
	}
	for (const item of [...(compact.participants ?? []), ...(compact.messageFlows ?? [])]) {
		ids.add(item.id)
	}
	return ids
}

/**
 * Brings each gateway's `bpmn:default` in line with the flow the compact input
 * marks, clearing one the input no longer marks.
 *
 * It runs after the operations rather than as one of them because the attribute
 * names a flow: a default can only be set once the flow it points at exists, and
 * a flow that is being replaced is deleted and re-added under the same id.
 */
function reconcileDefaultFlows(definitions: BpmnDefinitions, compact: CompactDiagram): void {
	for (const compactProcess of compact.processes) {
		const process = definitions.processes.find((candidate) => candidate.id === compactProcess.id)
		if (!process) continue
		const wanted = defaultFlows(compactProcess.elements, compactProcess.flows)
		for (const element of process.flowElements) {
			// By type, not by `"default" in element`: a gateway built without the
			// attribute has no such key, and skipping it would drop a wanted default.
			if (
				element.type !== "exclusiveGateway" &&
				element.type !== "inclusiveGateway" &&
				element.type !== "complexGateway"
			) {
				continue
			}
			element.default = wanted.get(element.id)
		}
	}
}

/**
 * Derives the operations that would bring `definitions` in line with `compact`.
 *
 * Order matters. Removing an element also removes the flows attached to it, so
 * flows are settled first and any flow the removal would take with it is
 * re-added afterwards rather than redirected onto something that no longer
 * exists.
 *
 * A flow whose endpoints move is redirected, keeping whatever else it carries.
 * One whose name or condition changes is replaced, which does not preserve
 * extensions on the flow itself — rare enough to be worth the simpler rule.
 */
function operationsForCompact(
	definitions: BpmnDefinitions,
	compact: CompactDiagram,
): BpmnOperation[] {
	const operations: BpmnOperation[] = []

	for (const compactProcess of compact.processes) {
		const process = definitions.processes.find((candidate) => candidate.id === compactProcess.id)
		if (!process) continue

		const wanted = new Map(compactProcess.elements.map((element) => [element.id, element]))
		const wantedFlows = new Map(compactProcess.flows.map((flow) => [flow.id, flow]))
		const present = process.flowElements.map((element) => element.id)
		const removedElements = present.filter((id) => !wanted.has(id))
		const removed = new Set(removedElements)

		const replacedFlows = new Set<string>()

		for (const flow of process.sequenceFlows) {
			const want = wantedFlows.get(flow.id)
			const attachedToRemoved = removed.has(flow.sourceRef) || removed.has(flow.targetRef)

			if (want === undefined || attachedToRemoved) {
				operations.push({ op: "delete_flow", id: flow.id })
				if (want !== undefined) replacedFlows.add(flow.id)
				continue
			}

			// An empty label or condition is the same as none: the compact view omits
			// both, and treating "" as a change would delete and re-add the flow,
			// taking its extensions and condition attributes with it.
			const sameLabel = (want.name || undefined) === (flow.name || undefined)
			const sameCondition =
				(want.condition || undefined) === (flow.conditionExpression?.text || undefined)

			if (!sameLabel || !sameCondition) {
				operations.push({ op: "delete_flow", id: flow.id })
				replacedFlows.add(flow.id)
				continue
			}

			if (want.from !== flow.sourceRef || want.to !== flow.targetRef) {
				operations.push({ op: "redirect_flow", id: flow.id, from: want.from, to: want.to })
			}
		}

		for (const id of removedElements) operations.push({ op: "delete", id })

		for (const [id, element] of wanted) {
			if (removed.has(id)) continue
			if (present.includes(id)) {
				const { id: _id, children: _children, ...patch } = element
				operations.push({ op: "update", id, patch })
			} else {
				operations.push({ op: "insert", element, parent: process.id })
			}
		}

		const existingFlowIds = new Set(process.sequenceFlows.map((flow) => flow.id))
		for (const [id, flow] of wantedFlows) {
			if (existingFlowIds.has(id) && !replacedFlows.has(id)) continue
			operations.push({
				op: "add_flow",
				id,
				parent: process.id,
				from: flow.from,
				to: flow.to,
				name: flow.name,
				condition: flow.condition,
			})
		}
	}

	return operations
}
