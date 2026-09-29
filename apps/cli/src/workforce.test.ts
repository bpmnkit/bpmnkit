import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
	type AgentProfile,
	type JobApi,
	type WorkforceEvent,
	loadWorkforce,
	runHarness,
	runWorkforce,
	saveWorkforce,
	validateProfile,
} from "./workforce.js"

const node = process.execPath

function profile(over: Partial<AgentProfile> = {}): AgentProfile {
	return {
		name: "echo",
		command: node,
		// Prints what arrives on stdin, upper-cased.
		args: [
			"-e",
			"let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(s.toUpperCase()))",
		],
		roles: ["review"],
		instances: 1,
		timeoutMinutes: 1,
		cwd: process.cwd(),
		...over,
	}
}

let dir: string
beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "casen-workforce-"))
})
afterEach(() => {
	rmSync(dir, { recursive: true, force: true })
})

describe("workforce file", () => {
	it("is empty when missing, and round-trips what is saved", () => {
		const path = join(dir, "sub", "workforce.json")
		expect(loadWorkforce(path)).toEqual([])
		saveWorkforce([profile()], path)
		expect(loadWorkforce(path)).toEqual([profile()])
		expect(JSON.parse(readFileSync(path, "utf8")).version).toBe(1)
	})

	it("refuses a file it cannot read as a workforce", () => {
		const path = join(dir, "workforce.json")
		writeFileSync(path, JSON.stringify({ agents: {} }))
		expect(() => loadWorkforce(path)).toThrow(/not a workforce file/)
	})
})

describe("validateProfile", () => {
	it("accepts a well-formed profile", () => {
		expect(() => validateProfile(profile({ rank: "senior" }))).not.toThrow()
	})

	it.each([
		[{ name: "has space" }, /Agent name/],
		[{ command: "" }, /command/],
		[{ roles: [] }, /role/],
		[{ roles: ["a:b"] }, /role/],
		[{ rank: "x y" }, /rank/],
		[{ instances: 0 }, /instances/],
		[{ timeoutMinutes: 0 }, /timeout/],
	])("rejects %o", (over, message) => {
		expect(() => validateProfile(profile(over as Partial<AgentProfile>))).toThrow(message)
	})
})

describe("runHarness", () => {
	it("sends the prompt on stdin when no argument asks for it", async () => {
		const result = await runHarness(profile(), "hello", { timeoutMs: 10_000 })
		expect(result).toEqual({ exitCode: 0, stdout: "HELLO\n", stderr: "", stopped: undefined })
	})

	it("puts the prompt into an argument that contains {prompt}", async () => {
		const p = profile({ args: ["-e", "console.log(process.argv[1])", "say: {prompt}"] })
		const result = await runHarness(p, "hi", { timeoutMs: 10_000 })
		expect(result.stdout).toBe("say: hi\n")
	})

	it("reports the exit code and stderr of a failing run", async () => {
		const p = profile({ args: ["-e", "console.error('boom');process.exit(3)"] })
		const result = await runHarness(p, "", { timeoutMs: 10_000 })
		expect(result).toMatchObject({ exitCode: 3, stderr: "boom\n" })
	})

	it("stops a run that takes too long", async () => {
		const p = profile({ args: ["-e", "setTimeout(()=>{},60000)"] })
		const result = await runHarness(p, "", { timeoutMs: 200 })
		expect(result.stopped).toBe("timeout")
	})

	it("stops a run when the signal aborts", async () => {
		const p = profile({ args: ["-e", "setTimeout(()=>{},60000)"] })
		const controller = new AbortController()
		const run = runHarness(p, "", { timeoutMs: 60_000, signal: controller.signal })
		controller.abort()
		expect((await run).stopped).toBe("abort")
	})

	it("rejects when the command does not exist", async () => {
		const p = profile({ command: join(dir, "no-such-cli"), args: [] })
		await expect(runHarness(p, "", { timeoutMs: 1_000 })).rejects.toThrow(/Could not start/)
	})
})

// ─── runWorkforce ─────────────────────────────────────────────────────────────

interface FakeJob {
	type: string
	jobKey: string
	retries?: number
	customHeaders?: Record<string, unknown>
	variables?: Record<string, unknown>
}

/** An engine that hands out `jobs` by type, once each, and records how they were settled. */
function fakeEngine(jobs: FakeJob[]) {
	const queue = [...jobs]
	const asked: string[] = []
	const completed: Array<{ key: string; variables: unknown }> = []
	const failed: Array<{ key: string; retries: unknown; message: unknown }> = []
	const api = {
		async activateJobs(req: { type: string }) {
			asked.push(req.type)
			const i = queue.findIndex((j) => j.type === req.type)
			if (i < 0) return { jobs: [] }
			const [job] = queue.splice(i, 1)
			return { jobs: [{ retries: 3, customHeaders: {}, variables: {}, ...job }] }
		},
		async completeJob(key: string, body?: { variables?: unknown }) {
			completed.push({ key, variables: body?.variables })
		},
		async failJob(key: string, body?: { retries?: number; errorMessage?: string }) {
			failed.push({ key, retries: body?.retries, message: body?.errorMessage })
		},
	} as unknown as JobApi
	return { api, asked, completed, failed, left: () => queue.length }
}

/** Runs the workforce until `until` holds, then stops it. */
async function work(
	api: JobApi,
	agents: AgentProfile[],
	until: () => void,
	onEvent: (e: WorkforceEvent) => void = () => {},
) {
	const controller = new AbortController()
	const done = runWorkforce(api, agents, {
		signal: controller.signal,
		onEvent,
		idleMs: 5,
		errorMs: 5,
	})
	await vi.waitFor(until, { timeout: 10_000 })
	controller.abort()
	await done
}

describe("runWorkforce", () => {
	it("renders the prompt, runs the agent and completes with its output", async () => {
		const engine = fakeEngine([
			{
				type: "agent:review",
				jobKey: "1",
				customHeaders: { prompt: "review {{pr}}", resultVariable: "verdict" },
				variables: { pr: 42 },
			},
			{ type: "agent:review", jobKey: "2", customHeaders: { prompt: "plain" } },
		])
		const events: WorkforceEvent[] = []
		await work(
			engine.api,
			[profile()],
			() => expect(engine.completed).toHaveLength(2),
			(e) => events.push(e),
		)
		expect(engine.completed).toEqual([
			{ key: "1", variables: { verdict: "REVIEW 42" } },
			{ key: "2", variables: { result: "PLAIN" } },
		])
		expect(events.map((e) => e.kind)).toEqual(["started", "completed", "started", "completed"])
	})

	it("serves the role on its own and at the agent's rank, taking turns", async () => {
		const engine = fakeEngine([
			{ type: "agent:senior:review", jobKey: "a", customHeaders: { prompt: "x" } },
			{ type: "agent:review", jobKey: "b", customHeaders: { prompt: "y" } },
		])
		await work(engine.api, [profile({ rank: "senior" })], () =>
			expect(engine.completed).toHaveLength(2),
		)
		expect(new Set(engine.asked)).toEqual(new Set(["agent:review", "agent:senior:review"]))
	})

	it("fails without retries when the prompt cannot be rendered", async () => {
		const engine = fakeEngine([
			{ type: "agent:review", jobKey: "1" },
			{ type: "agent:review", jobKey: "2", customHeaders: { prompt: "{{missing}}" } },
		])
		await work(engine.api, [profile()], () => expect(engine.failed).toHaveLength(2))
		expect(engine.failed).toEqual([
			{ key: "1", retries: 0, message: 'Job has no "prompt" task header' },
			{ key: "2", retries: 0, message: "Prompt refers to missing variable(s): missing" },
		])
	})

	it("fails with one retry fewer when the agent exits non-zero", async () => {
		const engine = fakeEngine([
			{ type: "agent:review", jobKey: "1", retries: 2, customHeaders: { prompt: "x" } },
		])
		const agent = profile({ args: ["-e", "console.error('no tokens');process.exit(1)"] })
		await work(engine.api, [agent], () => expect(engine.failed).toHaveLength(1))
		expect(engine.failed[0]).toMatchObject({ key: "1", retries: 1 })
		expect(engine.failed[0]?.message).toMatch(/exited with code 1: no tokens/)
	})

	it("hands a job back with its retries when stopped mid-run", async () => {
		const engine = fakeEngine([
			{ type: "agent:review", jobKey: "1", retries: 3, customHeaders: { prompt: "x" } },
		])
		const agent = profile({ args: ["-e", "setTimeout(()=>{},60000)"] })
		const controller = new AbortController()
		const events: WorkforceEvent[] = []
		const done = runWorkforce(engine.api, [agent], {
			signal: controller.signal,
			onEvent: (e) => events.push(e),
			idleMs: 5,
		})
		await vi.waitFor(() => expect(events.map((e) => e.kind)).toContain("started"))
		controller.abort()
		await done
		expect(engine.failed).toEqual([
			{ key: "1", retries: 3, message: "Workforce stopped before the agent finished" },
		])
	})

	it("runs as many jobs at once as the agent has instances", async () => {
		const engine = fakeEngine(
			["1", "2"].map((jobKey) => ({
				type: "agent:review",
				jobKey,
				customHeaders: { prompt: "x" },
			})),
		)
		// Each run waits for a marker file the other run would also be waiting on.
		const marker = join(dir, "started")
		const agent = profile({
			instances: 2,
			args: [
				"-e",
				`const fs=require('fs');fs.appendFileSync(${JSON.stringify(marker)},'x');const t=setInterval(()=>{if(fs.readFileSync(${JSON.stringify(marker)},'utf8').length>=2){clearInterval(t);console.log('ok')}},10)`,
			],
		})
		await work(engine.api, [agent], () => expect(engine.completed).toHaveLength(2))
	})

	it("reports activation errors and keeps polling", async () => {
		let calls = 0
		const api = {
			async activateJobs() {
				calls++
				if (calls === 1) throw new Error("503 Service Unavailable")
				return { jobs: [] }
			},
		} as unknown as JobApi
		const events: WorkforceEvent[] = []
		await work(
			api,
			[profile()],
			() => expect(calls).toBeGreaterThan(2),
			(e) => events.push(e),
		)
		expect(events[0]).toEqual({
			kind: "error",
			worker: "casen-agent:echo#1",
			message: "503 Service Unavailable",
		})
	})
})
