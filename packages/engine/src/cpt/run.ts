import { ensureWasmInit } from "../wasm-init.js"
import type {
	CptCaseResult,
	CptInstruction,
	CptJobSelector,
	CptReport,
	CptTestCase,
	CptUserTaskSelector,
} from "./types.js"
import { parseCptFile } from "./validate.js"

// Only the snapshot fields the runner reads; reebe-wasm types snapshot() as `any`.
interface Snapshot {
	processInstances: { key: number; bpmn_process_id: string; state: string }[]
	elementInstances: {
		process_instance_key: number
		element_id: string
		element_type: string
		state: string
	}[]
	jobs: {
		key: number
		job_type: string
		state: string
		element_id: string
		bpmn_process_id: string
	}[]
	userTasks: { key: number; element_id: string; bpmn_process_id: string; state: string }[]
	incidents: { element_id: string; error_message: string | null; state: string }[]
	eventLog: { intent: string; payload: Record<string, unknown> }[]
}

interface Engine {
	deploy(xml: string): unknown
	create_process_instance(processId: string, variables: string): unknown
	activate_job(key: number, worker: string, timeout: number): unknown
	complete_job(key: number, variables: string): unknown
	complete_job_with_result(key: number, variables: string, result: string): unknown
	complete_user_task(key: number, variables: string): unknown
	snapshot(): unknown
	free(): void
}

const ACTIVE_ELEMENT = new Set(["ACTIVATING", "ACTIVATED", "COMPLETING"])
const WORKER = "casen-test"
const JOB_TIMEOUT_MS = 300_000

const fail = (message: string): never => {
	throw new Error(message)
}

const errorText = (e: unknown): string => {
	if (e instanceof Error) return e.message
	if (typeof e === "string") return e
	try {
		return JSON.stringify(e)
	} catch {
		return String(e)
	}
}

const list = (items: string[]): string => (items.length > 0 ? items.join(", ") : "(none)")

const describeSelector = (sel: object): string =>
	Object.entries(sel)
		.map(([k, v]) => `${k} "${String(v)}"`)
		.join(", ")

/** What the engine holds after draining, so a "not found" says what *is* there. */
function describeState(snap: Snapshot): string {
	const active = snap.elementInstances
		.filter((e) => ACTIVE_ELEMENT.has(e.state) && e.element_type !== "PROCESS")
		.map((e) => e.element_id)
	const jobs = openJobs(snap).map((j) => `${j.job_type}@${j.element_id}`)
	const tasks = openUserTasks(snap).map((t) => t.element_id)
	const incidents = snap.incidents
		.filter((i) => i.state === "ACTIVE")
		.map((i) => `${i.element_id}: ${i.error_message ?? "(no message)"}`)
	return [
		`  active elements: ${list(active)}`,
		`  open jobs: ${list(jobs)}`,
		`  open user tasks: ${list(tasks)}`,
		`  incidents: ${list(incidents)}`,
	].join("\n")
}

const openJobs = (snap: Snapshot) =>
	snap.jobs.filter((j) => j.state === "ACTIVATABLE").sort((a, b) => a.key - b.key)

const openUserTasks = (snap: Snapshot) =>
	snap.userTasks.filter((t) => t.state === "CREATED").sort((a, b) => a.key - b.key)

function findJob(snap: Snapshot, sel: CptJobSelector) {
	const job = openJobs(snap).find(
		(j) =>
			(sel.jobType === undefined || j.job_type === sel.jobType) &&
			(sel.elementId === undefined || j.element_id === sel.elementId) &&
			(sel.processDefinitionId === undefined || j.bpmn_process_id === sel.processDefinitionId),
	)
	return job ?? fail(`no open job matches ${describeSelector(sel)}\n${describeState(snap)}`)
}

function findUserTask(snap: Snapshot, sel: CptUserTaskSelector) {
	const task = openUserTasks(snap).find(
		(t) =>
			(sel.elementId === undefined || t.element_id === sel.elementId) &&
			(sel.processDefinitionId === undefined || t.bpmn_process_id === sel.processDefinitionId),
	)
	return task ?? fail(`no open user task matches ${describeSelector(sel)}\n${describeState(snap)}`)
}

function findInstance(snap: Snapshot, processDefinitionId: string) {
	const pi = snap.processInstances
		.filter((p) => p.bpmn_process_id === processDefinitionId)
		.sort((a, b) => a.key - b.key)[0]
	return (
		pi ??
		fail(
			`no process instance matches processDefinitionId "${processDefinitionId}"\n${describeState(snap)}`,
		)
	)
}

/** Element ids in the order they completed in one process instance, the process itself excluded. */
function completionOrder(snap: Snapshot, processInstanceKey: number): string[] {
	return snap.eventLog
		.filter(
			(r) =>
				r.intent === "ELEMENT_COMPLETED" &&
				String(r.payload.processInstanceKey) === String(processInstanceKey) &&
				r.payload.elementType !== "PROCESS",
		)
		.map((r) => String(r.payload.elementId))
}

function assertElements(
	snap: Snapshot,
	ins: Extract<CptInstruction, { type: "ASSERT_ELEMENT_INSTANCES" }>,
): void {
	const pi = findInstance(snap, ins.processInstanceSelector.processDefinitionId)
	const ids = ins.elementSelectors.map((s) => s.elementId)
	const order = completionOrder(snap, pi.key)
	switch (ins.state) {
		case "IS_ACTIVE": {
			const active = new Set(
				snap.elementInstances
					.filter((e) => e.process_instance_key === pi.key && ACTIVE_ELEMENT.has(e.state))
					.map((e) => e.element_id),
			)
			const missing = ids.filter((id) => !active.has(id))
			if (missing.length > 0) {
				fail(`expected active but not: ${missing.join(", ")}\n${describeState(snap)}`)
			}
			return
		}
		case "IS_COMPLETED": {
			const missing = ids.filter((id) => !order.includes(id))
			if (missing.length > 0) {
				fail(
					`expected completed but not: ${missing.join(", ")}\n  completion order: ${list(order)}\n${describeState(snap)}`,
				)
			}
			return
		}
		case "IS_COMPLETED_IN_ORDER": {
			const positions = ids.map((id) => order.indexOf(id))
			const inOrder = positions.every((p, i) => p >= 0 && (i === 0 || p > (positions[i - 1] ?? -1)))
			if (!inOrder) {
				fail(
					`expected to complete in order ${ids.join(", ")}\n  completion order: ${list(order)}\n${describeState(snap)}`,
				)
			}
			return
		}
		default: {
			const unreachable: never = ins.state
			throw new Error(`unhandled state ${String(unreachable)}`)
		}
	}
}

function step(engine: Engine, ins: CptInstruction): void {
	const snap = () => engine.snapshot() as Snapshot
	switch (ins.type) {
		case "CREATE_PROCESS_INSTANCE":
			engine.create_process_instance(
				ins.processDefinitionSelector.processDefinitionId,
				JSON.stringify(ins.variables),
			)
			return
		case "COMPLETE_JOB": {
			const job = findJob(snap(), ins.jobSelector)
			engine.activate_job(job.key, WORKER, JOB_TIMEOUT_MS)
			engine.complete_job(job.key, JSON.stringify(ins.variables))
			return
		}
		case "COMPLETE_JOB_AD_HOC_SUB_PROCESS": {
			const job = findJob(snap(), ins.jobSelector)
			engine.activate_job(job.key, WORKER, JOB_TIMEOUT_MS)
			engine.complete_job_with_result(
				job.key,
				JSON.stringify(ins.variables),
				JSON.stringify({
					activateElements: ins.activateElements,
					isCompletionConditionFulfilled: ins.completionConditionFulfilled,
					isCancelRemainingInstances: ins.cancelRemainingInstances,
				}),
			)
			return
		}
		case "COMPLETE_USER_TASK": {
			const task = findUserTask(snap(), ins.userTaskSelector)
			engine.complete_user_task(task.key, JSON.stringify(ins.variables))
			return
		}
		case "ASSERT_ELEMENT_INSTANCES":
			assertElements(snap(), ins)
			return
		case "ASSERT_PROCESS_INSTANCE": {
			const s = snap()
			const pi = findInstance(s, ins.processInstanceSelector.processDefinitionId)
			const want = ins.state === "IS_ACTIVE" ? "ACTIVE" : "COMPLETED"
			if (pi.state !== want) {
				fail(
					`expected process instance ${pi.bpmn_process_id} to be ${want} but it is ${pi.state}\n${describeState(s)}`,
				)
			}
			return
		}
		default: {
			const unreachable: never = ins
			throw new Error(`unhandled instruction ${JSON.stringify(unreachable)}`)
		}
	}
}

function runCase(makeEngine: () => Engine, bpmn: string, tc: CptTestCase): CptCaseResult {
	const engine = makeEngine()
	try {
		try {
			engine.deploy(bpmn)
		} catch (e) {
			return {
				name: tc.name,
				passed: false,
				failure: { index: -1, type: "DEPLOY", message: errorText(e) },
			}
		}
		for (const [index, ins] of tc.instructions.entries()) {
			try {
				step(engine, ins)
			} catch (e) {
				return {
					name: tc.name,
					passed: false,
					failure: { index, type: ins.type, message: errorText(e) },
				}
			}
		}
		return { name: tc.name, passed: true }
	} finally {
		engine.free()
	}
}

/**
 * Run a Camunda process-test (CPT) JSON file against `bpmn` on reebe-wasm.
 *
 * Each test case gets a fresh engine, as CPT isolates cases. reebe-wasm drains
 * synchronously, so where CPT would wait for a selector to match, a selector
 * that matches nothing after draining fails at once and the message lists the
 * active elements, open jobs, open user tasks and incidents.
 *
 * Selection rules:
 * - A `processInstanceSelector` matches the first-created (lowest-key) instance
 *   of that process id in the case.
 * - A job or user task selector matches the lowest-key open (activatable job /
 *   created user task) one whose given fields all match.
 * - `IS_COMPLETED_IN_ORDER` passes when every listed element has completed at
 *   least once and the positions of each element's *first* completion are
 *   strictly increasing in the listed order. Loops therefore only constrain the
 *   first pass through an element.
 *
 * A file that fails validation runs nothing: each error becomes a failed case
 * named "(test file)". `select` keeps only the named cases; a name that matches
 * no case is reported as a failed case. An engine rejection (reebe's message)
 * or a failed check fails its case at that instruction; later cases still run.
 */
export async function runCptTestCases(input: {
	bpmn: string
	cases: unknown
	select?: string[]
}): Promise<CptReport> {
	const parsed = parseCptFile(input.cases)
	if ("errors" in parsed) {
		return {
			cases: parsed.errors.map((message) => ({
				name: "(test file)",
				passed: false,
				failure: { index: -1, type: "VALIDATION", message },
			})),
		}
	}
	const { select } = input
	const testCases = select
		? parsed.file.testCases.filter((tc) => select.includes(tc.name))
		: parsed.file.testCases
	const unknown = (select ?? []).filter(
		(name) => !parsed.file.testCases.some((tc) => tc.name === name),
	)

	await ensureWasmInit()
	const mod = await import("@bpmnkit/reebe-wasm")
	const makeEngine = () => new mod.WasmEngine() as unknown as Engine

	const cases: CptCaseResult[] = testCases.map((tc) => runCase(makeEngine, input.bpmn, tc))
	for (const name of unknown) {
		cases.push({
			name,
			passed: false,
			failure: { index: -1, type: "SELECT", message: `no test case named "${name}"` },
		})
	}
	return { cases }
}
