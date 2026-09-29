import type { ActivatedJob, PollOptions, WorkerClient } from "@bpmnkit/worker-client"
import { describe, expect, it, vi } from "vitest"
import { defineFlow } from "../src/index.js"

interface Settled {
	key: string
	outcome: "complete" | "fail"
	payload: unknown
}

/** A client that serves `jobs` by type once, then idles until its poll is aborted. */
function fakeClient(jobs: Record<string, Array<Record<string, unknown>>>) {
	const settled: Settled[] = []
	const polls: Array<{ type: string; options?: PollOptions }> = []
	const client: WorkerClient = {
		async *poll(type: string, options?: PollOptions) {
			polls.push({ type, options })
			for (const [i, variables] of (jobs[type] ?? []).entries()) {
				const key = `${type}#${i}`
				const job: ActivatedJob = {
					key,
					jobType: type,
					processInstanceKey: "7",
					bpmnProcessId: "f",
					elementId: type,
					retries: 3,
					variables,
					customHeaders: {},
					async complete(output) {
						settled.push({ key, outcome: "complete", payload: output })
					},
					async fail(message) {
						settled.push({ key, outcome: "fail", payload: message })
					},
					async throwError() {},
				}
				yield job
			}
			const signal = options?.signal
			if (signal && !signal.aborted) {
				await new Promise((r) => signal.addEventListener("abort", r, { once: true }))
			}
		},
	} as WorkerClient
	return { client, settled, polls }
}

describe("flow.worker()", () => {
	it("polls each handler step, completes with its output and fails on a throw", async () => {
		const seen: unknown[] = []
		const flow = defineFlow("f")
			.input<{ n: number }>()
			.run("double", ({ n }, ctx) => {
				seen.push(ctx)
				if (n < 0) throw new Error("negative")
				return { doubled: n * 2 }
			})
			.agent("think", { role: "r", prompt: "{{doubled}}" })
			.run("noop", () => undefined)
			.build()
		const { client, settled, polls } = fakeClient({
			"f.double": [{ n: 2 }, { n: -1 }],
			"f.noop": [{}],
		})

		const worker = flow.worker({ client, timeout: 60_000 })
		await vi.waitFor(() => expect(settled).toHaveLength(3))
		await worker.stop()
		await worker.done

		expect(polls.map((p) => p.type)).toEqual(["f.double", "f.noop"])
		expect(polls[0]?.options).toMatchObject({ maxJobs: 1, timeout: 60_000 })
		expect(settled).toEqual(
			expect.arrayContaining([
				{ key: "f.double#0", outcome: "complete", payload: { doubled: 4 } },
				{ key: "f.double#1", outcome: "fail", payload: "negative" },
				{ key: "f.noop#0", outcome: "complete", payload: {} },
			]),
		)
		expect(seen[0]).toEqual({ jobKey: "f.double#0", processInstanceKey: "7", retries: 3 })
	})

	it("stops when the caller's signal aborts", async () => {
		const flow = defineFlow("f")
			.run("a", () => undefined)
			.build()
		const { client } = fakeClient({})
		const controller = new AbortController()
		const worker = flow.worker({ client, signal: controller.signal })
		controller.abort()
		await expect(worker.done).resolves.toBeUndefined()
	})

	it("rejects done when a poll ends with an error", async () => {
		const flow = defineFlow("f")
			.run("a", () => undefined)
			.build()
		const client = {
			// biome-ignore lint/correctness/useYield: the poll fails before it has a job
			async *poll() {
				throw new Error("401 Unauthorized")
			},
		} as WorkerClient
		await expect(flow.worker({ client }).done).rejects.toThrow("401")
	})
})
