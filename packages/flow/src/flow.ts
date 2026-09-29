import { Bpmn, type BpmnDefinitions, type BranchBuilder, type ProcessBuilder } from "@bpmnkit/core"
import {
	AGENT_PROMPT_HEADER,
	AGENT_RESULT_HEADER,
	DEFAULT_AGENT_RESULT,
	agentJobType,
	promptVariables,
} from "./agent.js"
import { type FlowWorker, type FlowWorkerOptions, startFlowWorker } from "./worker.js"

/** What a handler step learns about the job it serves — enough for an idempotency key. */
export interface StepContext {
	jobKey: string
	processInstanceKey: string
	/** Retries left, counting this attempt. */
	retries: number
}

/**
 * A handler step's code. It gets the instance's variables and returns the ones
 * it adds, or nothing. Delivery is at least once: a crash between the handler
 * finishing and the engine hearing about it runs the handler again.
 */
// biome-ignore lint/suspicious/noConfusingVoidType: a handler that returns nothing is typed `void`
export type StepHandler<V, O extends object | void> = (
	variables: V,
	context: StepContext,
) => O | Promise<O>

// biome-ignore lint/suspicious/noExplicitAny lint/suspicious/noConfusingVoidType: a step list holds handlers of every variable shape
type AnyHandler = StepHandler<any, object | void>

/** One step of a flow, in the order the flow runs them. */
export type FlowStep =
	| { kind: "run"; id: string; name: string; jobType: string; retries: number; handler: AnyHandler }
	| { kind: "agent"; id: string; name: string; jobType: string; prompt: string; result: string }
	| { kind: "wait"; id: string; name: string; message: string; correlationKey: string }
	| { kind: "approve"; id: string; name: string; assignee?: string; candidateGroups?: string }
	| {
			kind: "loop"
			id: string
			name: string
			counter: string
			until: string
			max: number
			escalate: ApproveOptions
			body: readonly FlowStep[]
			between: readonly FlowStep[]
	  }

/** A `run` step, with its job type and handler. */
export type RunStep = Extract<FlowStep, { kind: "run" }>

/** `A` with `B`'s keys replaced by `B`'s types. */
type Merge<A, B> = { [K in keyof A as K extends keyof B ? never : K]: A[K] } & B

type Placeholders<S extends string> = S extends `${string}{{${infer K}}}${infer Rest}`
	? K | Placeholders<Rest>
	: never

/** `S` when every `{{name}}` in it is a known variable, otherwise an error message type. */
type CheckedPrompt<S extends string, V> = [Exclude<Placeholders<S>, keyof V & string>] extends [
	never,
]
	? S
	: `unknown variable in prompt: ${Exclude<Placeholders<S>, keyof V & string>}`

export interface RunOptions {
	/** Label on the task. Defaults to the step id. */
	name?: string
	/** Attempts before the engine raises an incident. Default 3. */
	retries?: number
}

export interface AgentOptions<S extends string, R extends string> {
	/** The kind of work — the workforce serves it to profiles hired for this role. */
	role: string
	/** Restrict the step to workers of this rank. Omit to let any rank take it. */
	rank?: string
	/** What the agent is told. `{{name}}` is replaced with the variable `name`. */
	prompt: S
	/** Variable the agent's output is written to. Default `"result"`. */
	result?: R
	/** Label on the task. Defaults to the step id. */
	name?: string
}

export interface WaitOptions<K> {
	/** The variable a published message must carry as its correlation key. */
	correlationKey: K
	/** Message name. Defaults to the step id. */
	message?: string
	/** Label on the event. Defaults to the step id. */
	name?: string
}

export interface ApproveOptions {
	/** Label on the task. Defaults to the step id. */
	name?: string
	/** Static assignee, or a FEEL expression starting with `=`. */
	assignee?: string
	/** Candidate groups, comma-separated, or a FEEL expression starting with `=`. */
	candidateGroups?: string
}

export interface LoopOptions<C extends string, W extends object> {
	/** FEEL condition that ends the loop once it holds after a round, e.g. `verdict = "APPROVE"`. */
	until: string
	/** Rounds before the loop gives up and asks a person (`escalate`). At least 1. */
	max: number
	/** Variable counting the rounds done, 1 after the first. Default `"round"`. */
	counter?: C
	/** Label on the loop's gateway. Defaults to the loop id. */
	name?: string
	/** The user task a person gets when `max` rounds did not satisfy `until`. */
	escalate?: ApproveOptions
	/**
	 * Steps run between two rounds — only after a round that did not end the
	 * loop. They see what the body added, e.g. a review to address.
	 */
	between?: (b: FlowBuilder<NoInfer<W>>) => FlowBuilder<object>
}

const ID = /^[A-Za-z_][\w.-]*$/
const FEEL_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/

/** The elements a loop adds around its body, by the id it is given. */
function loopElementIds(id: string) {
	return {
		start: `${id}-start`,
		join: id,
		next: `${id}-next`,
		check: `${id}-check`,
		escalate: `${id}-escalate`,
		end: `${id}-end`,
	}
}

/** Every element id the steps take, loops' own elements included. */
function takenIds(steps: readonly FlowStep[]): string[] {
	return steps.flatMap((s) =>
		s.kind === "loop"
			? [...Object.values(loopElementIds(s.id)), ...takenIds(s.body), ...takenIds(s.between)]
			: [s.id],
	)
}

/** Ids and loop counters an enclosing flow already uses, for a loop body's builder. */
interface Scope {
	taken: readonly string[]
	counters: readonly string[]
}

const ROOT: Scope = { taken: ["start", "end"], counters: [] }

/**
 * A flow under construction. Every method returns a new builder whose variable
 * type `V` includes what the step adds, so later steps — handlers, prompts,
 * correlation keys — can only use variables an earlier step provides.
 */
export class FlowBuilder<V extends object> {
	/** @internal */
	constructor(
		private readonly id: string,
		private readonly label: string | undefined,
		private readonly steps: readonly FlowStep[],
		private readonly scope: Scope = ROOT,
	) {}

	/** Declares the variables an instance is started with. Adds no step. */
	input<I extends object>(): FlowBuilder<Merge<V, I>> {
		return new FlowBuilder(this.id, this.label, this.steps, this.scope)
	}

	/** A step whose handler runs in this flow's worker, on job type `<flowId>.<stepId>`. */
	// biome-ignore lint/suspicious/noConfusingVoidType: a handler that returns nothing is typed `void`
	run<O extends object | void>(
		id: string,
		handler: StepHandler<V, O>,
		options: RunOptions = {},
	): FlowBuilder<O extends object ? Merge<V, O> : V> {
		return this.add({
			kind: "run",
			id,
			name: options.name ?? id,
			jobType: `${this.id}.${id}`,
			retries: options.retries ?? 3,
			handler: handler as AnyHandler,
		})
	}

	/** A step served by a coding agent from the workforce (`casen agent work`). */
	agent<const S extends string, const R extends string = typeof DEFAULT_AGENT_RESULT>(
		id: string,
		options: AgentOptions<S & CheckedPrompt<S, V>, R>,
	): FlowBuilder<Merge<V, { [K in R]: string }>> {
		return this.add({
			kind: "agent",
			id,
			name: options.name ?? id,
			jobType: agentJobType(options.role, options.rank),
			prompt: options.prompt,
			result: options.result ?? DEFAULT_AGENT_RESULT,
		})
	}

	/**
	 * A durable wait for a message. The instance parks until a message with this
	 * name is published with the value of `correlationKey` as its key; the
	 * message's variables (`P`) join the instance's.
	 */
	waitFor<P extends object = Record<never, never>>(
		id: string,
		options: WaitOptions<keyof V & string>,
	): FlowBuilder<Merge<V, P>> {
		return this.add({
			kind: "wait",
			id,
			name: options.name ?? id,
			message: options.message ?? id,
			correlationKey: options.correlationKey,
		})
	}

	/** A human approval — a Camunda user task. The variables it is completed with (`P`) join the instance's. */
	approve<P extends object = Record<never, never>>(
		id: string,
		options: ApproveOptions = {},
	): FlowBuilder<Merge<V, P>> {
		return this.add({
			kind: "approve",
			id,
			name: options.name ?? id,
			assignee: options.assignee,
			candidateGroups: options.candidateGroups,
		})
	}

	/**
	 * Repeats `body` until `until` holds, at most `max` times. The counter
	 * (default `round`) is 0 when the loop starts and counts the rounds done;
	 * `between` runs only when another round follows. When `max` rounds end
	 * without `until` holding, a person gets the `escalate` user task, and the
	 * flow continues after it.
	 *
	 * @example
	 * .loop("review-loop",
	 *   (b) => b.agent("review", { role: "pr-review", prompt: "Review {{pr}}", result: "verdict" }),
	 *   {
	 *     until: 'starts with(verdict, "APPROVE")',
	 *     max: 3,
	 *     between: (b) => b.agent("fix", { role: "feature", prompt: "Address: {{verdict}}" }),
	 *   })
	 */
	loop<W extends object, C extends string = "round">(
		id: string,
		body: (b: FlowBuilder<Merge<V, { [K in C]: number }>>) => FlowBuilder<W>,
		options: LoopOptions<C, W>,
	): FlowBuilder<W> {
		const counter: string = options.counter ?? "round"
		if (!FEEL_NAME.test(counter)) {
			throw new Error(`Loop counter "${counter}" must be a FEEL name matching ${FEEL_NAME}`)
		}
		if (this.scope.counters.includes(counter)) {
			throw new Error(`Loop "${id}" is inside a loop that already counts in "${counter}"`)
		}
		if (!Number.isInteger(options.max) || options.max < 1) {
			throw new Error(`Loop "${id}" needs a whole max of at least 1`)
		}
		const until = options.until.trim().replace(/^=/, "").trim()
		if (!until) throw new Error(`Loop "${id}" needs an until condition`)
		this.checkIds(Object.values(loopElementIds(id)))

		const scope = (taken: readonly FlowStep[]): Scope => ({
			taken: [
				...this.scope.taken,
				...takenIds(this.steps),
				...Object.values(loopElementIds(id)),
				...takenIds(taken),
			],
			counters: [...this.scope.counters, counter],
		})
		const inner = body(new FlowBuilder(this.id, undefined, [], scope([])))
		if (inner.steps.length === 0) throw new Error(`Loop "${id}" has no steps`)
		const between =
			options.between?.(new FlowBuilder<W>(this.id, undefined, [], scope(inner.steps))).steps ?? []
		return this.add({
			kind: "loop",
			id,
			name: options.name ?? id,
			counter,
			until,
			max: options.max,
			escalate: options.escalate ?? {},
			body: inner.steps,
			between,
		})
	}

	/** Finishes the flow. Throws when it has no steps. */
	build(): Flow<V> {
		if (this.steps.length === 0) throw new Error(`Flow "${this.id}" has no steps`)
		return new Flow(this.id, this.label, this.steps)
	}

	private add<W extends object>(step: FlowStep): FlowBuilder<W> {
		if (step.kind !== "loop") this.checkIds([step.id])
		return new FlowBuilder(this.id, this.label, [...this.steps, step], this.scope)
	}

	private checkIds(ids: readonly string[]): void {
		const taken = new Set([...this.scope.taken, ...takenIds(this.steps)])
		for (const id of ids) {
			if (!ID.test(id)) throw new Error(`Step id "${id}" must match ${ID}`)
			if (taken.has(id)) throw new Error(`Flow "${this.id}" already has a step "${id}"`)
		}
	}
}

/** Every `run` step, loop bodies included, in flow order. */
function runSteps(steps: readonly FlowStep[]): RunStep[] {
	return steps.flatMap((s) =>
		s.kind === "run" ? [s] : s.kind === "loop" ? [...runSteps(s.body), ...runSteps(s.between)] : [],
	)
}

/** Every `agent` step's job type, loop bodies included. */
function agentTypes(steps: readonly FlowStep[]): string[] {
	return steps.flatMap((s) =>
		s.kind === "agent"
			? [s.jobType]
			: s.kind === "loop"
				? [...agentTypes(s.body), ...agentTypes(s.between)]
				: [],
	)
}

/** Adds `steps` to the chain `b` is building, in order. */
function emit<B extends ProcessBuilder | BranchBuilder>(b: B, steps: readonly FlowStep[]): B {
	for (const step of steps) {
		switch (step.kind) {
			case "run":
				b.serviceTask(step.id, {
					name: step.name,
					taskType: step.jobType,
					retries: String(step.retries),
				})
				break
			case "agent":
				b.serviceTask(step.id, {
					name: step.name,
					taskType: step.jobType,
					taskHeaders: {
						[AGENT_PROMPT_HEADER]: step.prompt,
						[AGENT_RESULT_HEADER]: step.result,
					},
					documentation: `Agent prompt variables: ${promptVariables(step.prompt).join(", ") || "none"}`,
				})
				break
			case "wait":
				b.intermediateCatchEvent(step.id, {
					name: step.name,
					messageName: step.message,
					correlationKey: `=${step.correlationKey}`,
				})
				break
			case "approve":
				b.userTask(step.id, {
					name: step.name,
					zeebeUserTask: true,
					assignee: step.assignee,
					candidateGroups: step.candidateGroups,
				})
				break
			case "loop": {
				const ids = loopElementIds(step.id)
				const { counter, until, max } = step
				b.scriptTask(ids.start, {
					name: `Start ${step.name}`,
					expression: "=0",
					resultVariable: counter,
				}).exclusiveGateway(ids.join, { name: step.name })
				emit(b, step.body)
					.scriptTask(ids.next, {
						name: `Count ${step.name} round`,
						expression: `=${counter} + 1`,
						resultVariable: counter,
					})
					.exclusiveGateway(ids.check, { name: `${step.name} done?` })
					// `gave up` excludes `done`, so no engine's evaluation order can pick the wrong one.
					.branch("done", (br) => br.condition(`=${until}`).connectTo(ids.end))
					.branch("gave up", (br) =>
						br
							.condition(`=${counter} >= ${max} and not(${until})`)
							.userTask(ids.escalate, {
								name: step.escalate.name ?? `${step.name}: no result after ${max} rounds`,
								zeebeUserTask: true,
								assignee: step.escalate.assignee,
								candidateGroups: step.escalate.candidateGroups,
							})
							.connectTo(ids.end),
					)
					.branch("again", (br) => emit(br.defaultFlow(), step.between).connectTo(ids.join))
					.exclusiveGateway(ids.end)
				break
			}
		}
	}
	return b
}

/**
 * A finished flow: the steps, the BPMN they compile to, and the worker that
 * serves the handler steps. `V` is every variable the flow ends with.
 */
export class Flow<V extends object> {
	/** @internal */
	constructor(
		readonly id: string,
		private readonly label: string | undefined,
		readonly steps: readonly FlowStep[],
	) {}

	/** Every `.run()` step, loop bodies included — each job type with its handler. */
	get runSteps(): RunStep[] {
		return runSteps(this.steps)
	}

	/** Job types this flow's own worker serves — one per `.run()` step. */
	get jobTypes(): string[] {
		return this.runSteps.map((s) => s.jobType)
	}

	/** Job types the workforce must serve — one per `.agent()` step, without repeats. */
	get agentJobTypes(): string[] {
		return [...new Set(agentTypes(this.steps))]
	}

	/** The executable process, laid out. */
	definitions(): BpmnDefinitions {
		let b = Bpmn.createProcess(this.id).startEvent("start")
		if (this.label !== undefined) b = b.name(this.label)
		return emit(b, this.steps).endEvent("end").withAutoLayout().build({ explicitJoins: true })
	}

	/** The BPMN XML to deploy. */
	toXml(): string {
		return Bpmn.export(this.definitions())
	}

	/** Starts polling for this flow's `.run()` jobs. Returns at once; see {@link FlowWorker}. */
	worker(options: FlowWorkerOptions = {}): FlowWorker {
		return startFlowWorker(this.runSteps, options)
	}
}

/**
 * Starts a code-first flow. Chain its steps, then call `build()`:
 *
 * @example
 * const review = defineFlow("pr-review")
 *   .input<{ prKey: string }>()
 *   .run("fetch-diff", async ({ prKey }) => ({ diff: await gh.diff(prKey) }))
 *   .agent("review", { role: "pr-review", prompt: "Review this diff:\n{{diff}}", result: "verdict" })
 *   .waitFor("ci-green", { correlationKey: "prKey" })
 *   .approve("approve-merge")
 *   .run("merge", async ({ prKey }) => ({ merged: await gh.merge(prKey) }))
 *   .build()
 */
export function defineFlow(id: string, options: { name?: string } = {}): FlowBuilder<object> {
	if (!ID.test(id)) throw new Error(`Flow id "${id}" must match ${ID}`)
	return new FlowBuilder(id, options.name, [])
}
