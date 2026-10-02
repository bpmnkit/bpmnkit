import type { BpmnDefinitions, BpmnFlowElement } from "@bpmnkit/core"
import { parseZeebeExt, parseZeebeLoop } from "../zeebe.js"
import { createProcessTest } from "./process-test.js"
import type { ProcessRun } from "./process-test.js"

/** Options for {@link dryRun}. */
export interface DryRunOptions {
	/** The process to start. Defaults to the first. */
	processId?: string
	/** Variables to start with. */
	variables?: Record<string, unknown>
	/**
	 * What every connector answers, mapped through its `resultVariable` and
	 * `resultExpression` as the connector runtime does. Defaults to an empty
	 * HTTP 200: `{ status: 200, headers: {}, body: {} }`.
	 */
	response?: unknown
	/** Messages, timers and waits to get past before giving up (default 50). */
	maxSteps?: number
}

/** What {@link dryRun} did to move the run on, in order. */
export type DryRunStep =
	| { kind: "message"; elementId: string; message: string }
	| { kind: "timer"; elementIds: string[] }

/** The outcome of {@link dryRun}. */
export interface DryRunResult {
	processId: string
	/** The run reached the end: every token finished. */
	reachedEnd: boolean
	state: ProcessRun["state"]
	/** Elements entered, in order. */
	path: string[]
	/** Connector tasks the run passed, each answered with the mocked response. */
	connectors: { elementId: string; type: string }[]
	/** Messages delivered and timers fired on the way. */
	steps: DryRunStep[]
	/** Where the run stopped, when it did not reach the end. */
	stoppedAt: string[]
	/** Why it stopped: the incident, or what it was still waiting for. */
	error?: string
}

const DEFAULT_RESPONSE = { status: 200, headers: {}, body: {} }

/** A connector's job type: Camunda's own and the `io.camunda.connectors.…` ones. */
function isConnectorType(type: string): boolean {
	return /^io\.camunda[.:]/.test(type)
}

function walk(elements: readonly BpmnFlowElement[], visit: (el: BpmnFlowElement) => void): void {
	for (const el of elements) {
		visit(el)
		if ("flowElements" in el && Array.isArray(el.flowElements)) walk(el.flowElements, visit)
	}
}

/** The message an element waits for, as `publishMessage` takes it: its ref, or its own id without one. */
function messageOf(el: BpmnFlowElement): string | undefined {
	if (el.type === "receiveTask") return el.messageRef ?? el.id
	if ("eventDefinitions" in el) {
		for (const def of el.eventDefinitions) {
			if (def.type === "message") return def.messageRef ?? el.id
		}
	}
	return undefined
}

/**
 * Runs a process once from start to end with every outside call mocked — the
 * proof that a generated diagram is executable, not only well-formed
 * (`doc/ai-connector-generation-plan.md` WS7).
 *
 * - Every connector answers {@link DryRunOptions.response}; every other job
 *   (service tasks, user tasks, agents) completes with no variables.
 * - A gateway takes whatever its conditions pick with those variables, which
 *   is the default flow when none holds.
 * - A multi-instance over a variable (`=recipients`) runs once, over a
 *   one-item list, unless the variables give the list.
 * - When the run waits, the message it waits for is delivered, or else the
 *   clock moves on a day to fire its timers.
 *
 * Never throws for a process that cannot run: `reachedEnd` is false, with
 * where it stopped and why.
 */
export async function dryRun(
	definitions: BpmnDefinitions,
	options: DryRunOptions = {},
): Promise<DryRunResult> {
	const processId = options.processId ?? definitions.processes[0]?.id
	const process = definitions.processes.find((p) => p.id === processId)
	if (processId === undefined || process === undefined) {
		throw new Error(
			`dryRun: no process ${processId === undefined ? "in the definitions" : `"${processId}"`}`,
		)
	}
	const byId = new Map<string, BpmnFlowElement>()
	const connectorTypes = new Map<string, string>()
	const jobTypes = new Set<string>(["serviceTask", "userTask"])
	/** Collections a multi-instance reads straight from a variable: one item each, unless given. */
	const collections: Record<string, unknown[]> = {}
	for (const p of definitions.processes) {
		walk(p.flowElements, (el) => {
			byId.set(el.id, el)
			const loop = "loopCharacteristics" in el ? el.loopCharacteristics : undefined
			const name = loop
				? /^=?\s*([A-Za-z_]\w*)\s*$/.exec(
						parseZeebeLoop(loop.extensionElements).inputCollection ?? "",
					)?.[1]
				: undefined
			if (name !== undefined) collections[name] = [{}]
			const type = parseZeebeExt(el.extensionElements).taskDefinition?.type
			if (type === undefined) return
			jobTypes.add(type)
			if (isConnectorType(type)) connectorTypes.set(el.id, type)
		})
	}

	const test = await createProcessTest({ bpmn: definitions })
	const steps: DryRunStep[] = []
	try {
		const response = options.response ?? DEFAULT_RESPONSE
		for (const type of jobTypes) {
			if (isConnectorType(type)) test.mockConnector(type, { response })
			else test.mockJob(type, { result: {} })
		}
		let run: ProcessRun
		try {
			run = await test.start(processId, { ...collections, ...options.variables })
		} catch (err) {
			return {
				processId,
				reachedEnd: false,
				state: "failed",
				path: [],
				connectors: [],
				steps,
				stoppedAt: [],
				error: err instanceof Error ? err.message : String(err),
			}
		}

		const maxSteps = options.maxSteps ?? 50
		for (let step = 0; step < maxSteps && run.state === "active"; step++) {
			const before = run.enteredElements.length
			const waiting = run.activeElements.flatMap((id) => {
				const el = byId.get(id)
				if (el?.type !== "eventBasedGateway") return [id]
				// An event-based gateway waits on the events after it
				return process.sequenceFlows.filter((f) => f.sourceRef === id).map((f) => f.targetRef)
			})
			const target = waiting
				.map((id) => {
					const el = byId.get(id)
					return { id, message: el && messageOf(el) }
				})
				.find((w) => w.message !== undefined)
			const moved = () => run.state !== "active" || run.enteredElements.length > before
			if (target?.message !== undefined) {
				try {
					await run.publishMessage(target.message)
					steps.push({ kind: "message", elementId: target.id, message: target.message })
				} catch {
					// Nothing took it: let the clock try instead
				}
			}
			if (moved()) continue
			const timers = [...run.activeElements]
			await run.advanceTime("P1D")
			if (!moved()) break
			steps.push({ kind: "timer", elementIds: timers })
		}

		const path = [...run.enteredElements]
		const result: DryRunResult = {
			processId,
			reachedEnd: run.state === "completed",
			state: run.state,
			path,
			connectors: path
				.filter((id, i) => connectorTypes.has(id) && path.indexOf(id) === i)
				.map((id) => ({ elementId: id, type: connectorTypes.get(id) ?? "" })),
			steps,
			stoppedAt: run.state === "completed" ? [] : [...run.activeElements],
		}
		if (run.error !== undefined) result.error = run.error
		else if (run.state === "active") {
			result.error = `still waiting at ${run.activeElements.join(", ")} after ${maxSteps} steps`
		}
		return result
	} finally {
		test.dispose()
	}
}
