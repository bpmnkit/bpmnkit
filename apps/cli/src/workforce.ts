/**
 * The agent workforce: coding-agent CLIs hired as durable job workers.
 *
 * A profile names a CLI command and the roles it takes on. `runWorkforce` polls
 * the job types those roles cover (see `agentJobTypes` in `@bpmnkit/flow`),
 * renders each job's prompt header with its variables, runs the CLI, and
 * settles the job with what the CLI printed. The engine owns the run state: a
 * workforce that dies forfeits only its job locks, and the jobs are handed out
 * again once the locks expire.
 */
import { spawn } from "node:child_process"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import type { CamundaClient } from "@bpmnkit/api"
import {
	AGENT_PROMPT_HEADER,
	AGENT_RESULT_HEADER,
	DEFAULT_AGENT_RESULT,
	agentJobTypes,
	renderPrompt,
} from "@bpmnkit/flow"
import { getConfigFilePath } from "@bpmnkit/profiles"

export interface AgentProfile {
	name: string
	/** The CLI to run, e.g. `claude`. */
	command: string
	/** Its arguments. An argument containing `{prompt}` receives the prompt; with none, it goes to stdin. */
	args: string[]
	/** The roles this agent takes on. */
	roles: string[]
	/** Rank, so a flow can send a step to this tier only. */
	rank?: string
	/** How many jobs this agent works on at once. */
	instances: number
	/** Minutes one run may take before it is stopped and the job failed. */
	timeoutMinutes: number
	/** Directory the CLI runs in. */
	cwd: string
}

interface WorkforceFile {
	version: 1
	agents: AgentProfile[]
}

/** `workforce.json`, next to casen's profile config. */
export function workforcePath(): string {
	return join(dirname(getConfigFilePath()), "workforce.json")
}

/**
 * The hired agents. A missing file is an empty workforce; a file that cannot be
 * read as one throws, because saving over it would lose every profile in it.
 */
export function loadWorkforce(path = workforcePath()): AgentProfile[] {
	let raw: string
	try {
		raw = readFileSync(path, "utf8")
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") return []
		throw err
	}
	const data = JSON.parse(raw) as Partial<WorkforceFile>
	if (data.version !== 1 || !Array.isArray(data.agents)) {
		throw new Error(`${path} is not a workforce file (expected version 1 with an agents list)`)
	}
	return data.agents
}

/** Writes the workforce atomically. */
export function saveWorkforce(agents: AgentProfile[], path = workforcePath()): void {
	mkdirSync(dirname(path), { recursive: true })
	const file: WorkforceFile = { version: 1, agents }
	const tmp = `${path}.tmp`
	writeFileSync(tmp, `${JSON.stringify(file, null, "\t")}\n`, { mode: 0o600 })
	renameSync(tmp, path)
}

/** Checks a profile before it is saved, so `work` never meets a bad one. */
export function validateProfile(profile: AgentProfile): void {
	if (!/^[A-Za-z0-9_-]+$/.test(profile.name)) {
		throw new Error(`Agent name "${profile.name}" may only use letters, digits, "-" and "_"`)
	}
	if (!profile.command) throw new Error("An agent needs a command to run")
	if (profile.roles.length === 0) throw new Error("An agent needs at least one role (--roles)")
	// Throws on a role or rank that would make an ambiguous job type.
	agentJobTypes(profile.roles, profile.rank)
	if (!Number.isInteger(profile.instances) || profile.instances < 1) {
		throw new Error("--instances must be a whole number of at least 1")
	}
	if (!(profile.timeoutMinutes > 0))
		throw new Error("--timeout must be a positive number of minutes")
}

// ─── Running one CLI ──────────────────────────────────────────────────────────

export interface HarnessResult {
	exitCode: number | null
	stdout: string
	stderr: string
	/** Why the run was stopped early, if it was. */
	stopped?: "timeout" | "abort"
}

/** Output kept from a run: the tail, where an agent's final answer is. */
const STDOUT_LIMIT = 64 * 1024
const STDERR_LIMIT = 4 * 1024

function keepTail(text: string, limit: number): string {
	return text.length > limit ? text.slice(-limit) : text
}

/** Runs the profile's CLI with `prompt`. Rejects only when the CLI cannot be started. */
export function runHarness(
	profile: Pick<AgentProfile, "command" | "args" | "cwd">,
	prompt: string,
	options: { timeoutMs: number; signal?: AbortSignal },
): Promise<HarnessResult> {
	const inArgs = profile.args.some((a) => a.includes("{prompt}"))
	const args = profile.args.map((a) => a.replaceAll("{prompt}", prompt))

	return new Promise((resolve, reject) => {
		const child = spawn(profile.command, args, {
			cwd: profile.cwd,
			stdio: ["pipe", "pipe", "pipe"],
		})
		let stdout = ""
		let stderr = ""
		let stopped: HarnessResult["stopped"]
		const stop = (why: NonNullable<HarnessResult["stopped"]>) => {
			stopped ??= why
			child.kill("SIGTERM")
		}
		const timer = setTimeout(() => stop("timeout"), options.timeoutMs)
		const onAbort = () => stop("abort")
		options.signal?.addEventListener("abort", onAbort, { once: true })
		if (options.signal?.aborted) onAbort()

		child.stdout.on("data", (chunk: Buffer) => {
			stdout = keepTail(stdout + chunk.toString(), STDOUT_LIMIT)
		})
		child.stderr.on("data", (chunk: Buffer) => {
			stderr = keepTail(stderr + chunk.toString(), STDERR_LIMIT)
		})
		// A CLI that exits without reading its stdin must not crash the workforce.
		child.stdin.on("error", () => {})
		child.stdin.end(inArgs ? undefined : prompt)

		const finish = () => {
			clearTimeout(timer)
			options.signal?.removeEventListener("abort", onAbort)
		}
		child.on("error", (err) => {
			finish()
			reject(new Error(`Could not start "${profile.command}": ${err.message}`))
		})
		child.on("close", (code) => {
			finish()
			resolve({ exitCode: code, stdout, stderr, stopped })
		})
	})
}

// ─── Serving jobs ─────────────────────────────────────────────────────────────

/** The job calls the workforce makes — a subset of the Camunda client, so tests can fake it. */
export type JobApi = Pick<CamundaClient["job"], "activateJobs" | "completeJob" | "failJob">

type ActivatedJob = Awaited<ReturnType<JobApi["activateJobs"]>>["jobs"][number]

export type WorkforceEvent =
	| { kind: "started"; worker: string; jobKey: string; jobType: string }
	| { kind: "completed"; worker: string; jobKey: string; ms: number }
	| { kind: "failed"; worker: string; jobKey: string; message: string; retries: number }
	| { kind: "error"; worker: string; message: string }

export interface WorkforceOptions {
	signal: AbortSignal
	onEvent: (event: WorkforceEvent) => void
	/** Pause after a round that found no work. Default 2 s. */
	idleMs?: number
	/** Pause after a failed activation request. Default 5 s. */
	errorMs?: number
}

/** Serves every instance of every agent until `signal` aborts. */
export async function runWorkforce(
	api: JobApi,
	agents: AgentProfile[],
	options: WorkforceOptions,
): Promise<void> {
	await Promise.all(
		agents.flatMap((agent) =>
			Array.from({ length: agent.instances }, (_, i) =>
				serveInstance(api, agent, `casen-agent:${agent.name}#${i + 1}`, options),
			),
		),
	)
}

/**
 * One instance takes one job at a time, asking for each of its job types in
 * turn — starting one further along after each job, so no type starves.
 */
async function serveInstance(
	api: JobApi,
	agent: AgentProfile,
	worker: string,
	options: WorkforceOptions,
): Promise<void> {
	const { signal, onEvent } = options
	const types = agentJobTypes(agent.roles, agent.rank)
	const timeoutMs = agent.timeoutMinutes * 60_000
	let turn = 0

	while (!signal.aborted) {
		let job: ActivatedJob | undefined
		try {
			for (let i = 0; i < types.length && !job && !signal.aborted; i++) {
				const type = types[(turn + i) % types.length] as string
				const result = await api.activateJobs({
					type,
					worker,
					// The lock outlives the run, so a slow run is failed by us, not re-handed out under us.
					timeout: timeoutMs + 60_000,
					maxJobsToActivate: 1,
					requestTimeout: 1_000,
				})
				job = result?.jobs?.[0]
			}
		} catch (err) {
			onEvent({ kind: "error", worker, message: errorText(err) })
			await sleep(options.errorMs ?? 5_000, signal)
			continue
		}
		if (!job) {
			await sleep(options.idleMs ?? 2_000, signal)
			continue
		}
		turn++
		await serveJob(api, agent, worker, job, timeoutMs, options)
	}
}

async function serveJob(
	api: JobApi,
	agent: AgentProfile,
	worker: string,
	job: ActivatedJob,
	timeoutMs: number,
	{ signal, onEvent }: WorkforceOptions,
): Promise<void> {
	// Some Zeebe-compatible engines return `key` instead of `jobKey`.
	const jobKey = job.jobKey ?? (job as { key?: string }).key ?? ""
	const headers = job.customHeaders ?? {}
	const fail = async (message: string, retries: number) => {
		onEvent({ kind: "failed", worker, jobKey, message, retries })
		await api.failJob(jobKey, { errorMessage: message, retries }).catch((err: unknown) => {
			onEvent({ kind: "error", worker, message: `fail ${jobKey}: ${errorText(err)}` })
		})
	}

	onEvent({ kind: "started", worker, jobKey, jobType: job.type })
	const startedAt = Date.now()

	const template = headers[AGENT_PROMPT_HEADER]
	if (typeof template !== "string" || !template.trim()) {
		// A retry cannot add a header the model lacks.
		return fail(`Job has no "${AGENT_PROMPT_HEADER}" task header`, 0)
	}
	let prompt: string
	try {
		prompt = renderPrompt(template, job.variables ?? {})
	} catch (err) {
		return fail(errorText(err), 0)
	}

	let result: HarnessResult
	try {
		result = await runHarness(agent, prompt, { timeoutMs, signal })
	} catch (err) {
		return fail(errorText(err), Math.max(job.retries - 1, 0))
	}

	if (result.stopped === "abort") {
		// Hand the job back untouched, so the next workforce can take it at once.
		return fail("Workforce stopped before the agent finished", job.retries)
	}
	if (result.stopped === "timeout" || result.exitCode !== 0) {
		const why =
			result.stopped === "timeout"
				? `timed out after ${agent.timeoutMinutes} min`
				: `exited with code ${result.exitCode}`
		const detail = result.stderr.trim() || result.stdout.trim()
		return fail(
			`${agent.command} ${why}${detail ? `: ${detail.slice(-1_000)}` : ""}`,
			Math.max(job.retries - 1, 0),
		)
	}

	const resultHeader = headers[AGENT_RESULT_HEADER]
	const variable =
		typeof resultHeader === "string" && resultHeader ? resultHeader : DEFAULT_AGENT_RESULT
	try {
		await api.completeJob(jobKey, { variables: { [variable]: result.stdout.trim() } })
		onEvent({ kind: "completed", worker, jobKey, ms: Date.now() - startedAt })
	} catch (err) {
		onEvent({ kind: "error", worker, message: `complete ${jobKey}: ${errorText(err)}` })
	}
}

function errorText(err: unknown): string {
	return err instanceof Error ? err.message : String(err)
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise((resolve) => {
		const timer = setTimeout(done, ms)
		signal.addEventListener("abort", done, { once: true })
		function done(): void {
			clearTimeout(timer)
			signal.removeEventListener("abort", done)
			resolve()
		}
	})
}
