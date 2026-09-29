import {
	type ActivatedJob,
	type WorkerClient,
	type WorkerClientOptions,
	createWorkerClient,
} from "@bpmnkit/worker-client"
import type { FlowStep } from "./flow.js"

export interface FlowWorkerOptions extends WorkerClientOptions {
	/** Use this client instead of creating one from the other options. */
	client?: WorkerClient
	/**
	 * Jobs activated per poll. Default 1: a step's jobs run one after another, and
	 * a job activated but waiting its turn still counts down its lock.
	 */
	maxJobs?: number
	/** Job lock timeout in milliseconds. Default 300_000. */
	timeout?: number
	/** Called with transient poll errors and with jobs the engine would not settle. Default: a warning on stderr. */
	onError?: (error: Error) => void
	/** Stops the worker when it aborts, as {@link FlowWorker.stop} does. */
	signal?: AbortSignal
}

/** A running flow worker. */
export interface FlowWorker {
	/**
	 * Settles when every step's poll has ended — after `stop()`, or rejected with
	 * the first error polling cannot recover from (rejected credentials, a 4xx).
	 */
	readonly done: Promise<void>
	/** Stops polling. Resolves once the jobs in progress are settled. */
	stop(): Promise<void>
}

/** Polls every `run` step's job type and settles each job with its handler's outcome. */
export function startFlowWorker(
	steps: readonly FlowStep[],
	options: FlowWorkerOptions,
): FlowWorker {
	const client = options.client ?? createWorkerClient({ workerName: "bpmnkit-flow", ...options })
	const controller = new AbortController()
	options.signal?.addEventListener("abort", () => controller.abort(), { once: true })
	if (options.signal?.aborted) controller.abort()
	const onError =
		options.onError ?? ((error: Error) => console.warn(`[flow-worker] ${error.message}`))

	const loops = steps.flatMap((step) => {
		if (step.kind !== "run") return []
		return [
			(async () => {
				const jobs = client.poll(step.jobType, {
					maxJobs: options.maxJobs ?? 1,
					timeout: options.timeout,
					onError,
					signal: controller.signal,
				})
				for await (const job of jobs) {
					await settle(job, step.handler, onError)
				}
			})(),
		]
	})
	const done = Promise.all(loops).then(() => undefined)
	// A rejected `done` nobody awaits must not crash the process before the caller looks.
	done.catch(() => {})

	return {
		done,
		async stop() {
			controller.abort()
			await done.catch(() => {})
		},
	}
}

async function settle(
	job: ActivatedJob,
	handler: Extract<FlowStep, { kind: "run" }>["handler"],
	onError: (error: Error) => void,
): Promise<void> {
	let output: unknown
	try {
		output = await handler(job.variables, {
			jobKey: job.key,
			processInstanceKey: job.processInstanceKey,
			retries: job.retries,
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		await job.fail(message).catch(onError)
		return
	}
	await job.complete({ ...(output as object | undefined) }).catch(onError)
}
