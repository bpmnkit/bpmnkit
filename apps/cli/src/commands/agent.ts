import { resolve } from "node:path"
import { agentJobTypes } from "@bpmnkit/flow"
import { flagStr } from "../args.js"
import type { Command, CommandGroup } from "../types.js"
import {
	type AgentProfile,
	type WorkforceEvent,
	loadWorkforce,
	runWorkforce,
	saveWorkforce,
	validateProfile,
	workforcePath,
} from "../workforce.js"

const hireCmd: Command = {
	name: "hire",
	description: "Hire a coding-agent CLI as a durable job worker (or update a hired one)",
	args: [
		{ name: "name", description: "Name to refer to the agent by", required: true },
		{
			name: "command",
			description:
				"The CLI and its arguments, after `--`. `{prompt}` in an argument receives the prompt; otherwise it is sent on stdin",
			required: true,
		},
	],
	flags: [
		{
			name: "roles",
			description: "Comma-separated roles the agent takes on, e.g. plan,feature,pr-review",
			type: "string",
			placeholder: "LIST",
			required: true,
		},
		{
			name: "rank",
			description: "Rank, so a flow step can ask for this tier only (e.g. senior)",
			type: "string",
		},
		{
			name: "instances",
			description: "How many jobs the agent works on at once",
			type: "number",
			default: 1,
		},
		{
			name: "timeout",
			description: "Minutes one run may take before it is stopped and the job failed",
			type: "number",
			default: 30,
		},
		{
			name: "cwd",
			description: "Directory the CLI runs in (default: the current directory)",
			type: "string",
		},
	],
	examples: [
		{
			description: "Claude Code, prompt on stdin",
			command: "casen agent hire claude --roles plan,pr-review --rank senior -- claude -p",
		},
		{
			description: "A CLI that takes the prompt as an argument, two at a time",
			command: 'casen agent hire copilot --roles feature --instances 2 -- copilot -p "{prompt}"',
		},
	],
	async run(ctx) {
		const [name, command, ...args] = ctx.positional
		if (!name) throw new Error("Missing required argument: <name>")
		if (!command) {
			throw new Error("Missing the command to run — put it after `--`, e.g. `-- claude -p`")
		}
		const rank = flagStr(ctx.flags, "rank")
		const cwd = flagStr(ctx.flags, "cwd")
		const profile: AgentProfile = {
			name,
			command,
			args,
			roles: (flagStr(ctx.flags, "roles") ?? "")
				.split(",")
				.map((r) => r.trim())
				.filter(Boolean),
			...(rank !== undefined ? { rank } : {}),
			instances: Number(ctx.flags.instances ?? 1),
			timeoutMinutes: Number(ctx.flags.timeout ?? 30),
			cwd: resolve(cwd ?? process.cwd()),
		}
		validateProfile(profile)

		const agents = loadWorkforce()
		const existing = agents.findIndex((a) => a.name === name)
		if (existing >= 0) agents[existing] = profile
		else agents.push(profile)
		saveWorkforce(agents)

		ctx.output.ok(`${existing >= 0 ? "Updated" : "Hired"} ${name}`)
		ctx.output.info(`  serves: ${agentJobTypes(profile.roles, profile.rank).join(", ")}`)
		ctx.output.info("  Start the workforce with `casen agent work`.")
	},
}

const listCmd: Command = {
	name: "list",
	description: "List hired agents and the job types they serve",
	examples: [{ description: "List the workforce", command: "casen agent list" }],
	async run(ctx) {
		const rows = loadWorkforce().map((a) => ({
			name: a.name,
			command: [a.command, ...a.args].join(" "),
			rank: a.rank ?? "",
			roles: a.roles.join(","),
			instances: a.instances,
			jobTypes: agentJobTypes(a.roles, a.rank).join(", "),
			cwd: a.cwd,
		}))
		if (rows.length === 0 && ctx.output.format === "table") {
			ctx.output.info("No agents hired yet. Run `casen agent hire --help` to hire one.")
			return
		}
		ctx.output.printList({ items: rows }, [
			{ key: "name", header: "Name" },
			{ key: "command", header: "Command", maxWidth: 40 },
			{ key: "rank", header: "Rank" },
			{ key: "roles", header: "Roles" },
			{ key: "instances", header: "Instances" },
			{ key: "jobTypes", header: "Job types", maxWidth: 60 },
		])
	},
}

const fireCmd: Command = {
	name: "fire",
	description: "Remove a hired agent",
	args: [{ name: "name", description: "Agent to remove", required: true }],
	examples: [{ description: "Remove an agent", command: "casen agent fire copilot" }],
	async run(ctx) {
		const name = ctx.positional[0]
		if (!name) throw new Error("Missing required argument: <name>")
		const agents = loadWorkforce()
		const rest = agents.filter((a) => a.name !== name)
		if (rest.length === agents.length) throw new Error(`No agent named "${name}" is hired`)
		saveWorkforce(rest)
		ctx.output.ok(`Fired ${name}`)
	},
}

const workCmd: Command = {
	name: "work",
	description: "Run the workforce against the active profile's engine until Ctrl+C",
	args: [
		{
			name: "names",
			description: "Agents to run (default: every hired agent)",
			required: false,
		},
	],
	examples: [
		{ description: "Run every hired agent", command: "casen agent work" },
		{ description: "Run only one agent", command: "casen agent work claude" },
	],
	async run(ctx) {
		const hired = loadWorkforce()
		const names = ctx.positional
		const unknown = names.filter((n) => !hired.some((a) => a.name === n))
		if (unknown.length > 0) throw new Error(`No agent named ${unknown.join(", ")} is hired`)
		const agents = names.length > 0 ? hired.filter((a) => names.includes(a.name)) : hired
		if (agents.length === 0) {
			throw new Error(`No agents hired (${workforcePath()}). Run \`casen agent hire --help\`.`)
		}

		const client = await ctx.getClient()
		const controller = new AbortController()
		const stop = () => {
			if (controller.signal.aborted) process.exit(130)
			ctx.output.info(
				"\nStopping — handing unfinished jobs back to the engine (Ctrl+C again to force)",
			)
			controller.abort()
		}
		process.on("SIGINT", stop)
		process.on("SIGTERM", stop)

		for (const a of agents) {
			ctx.output.info(
				`${a.name} ×${a.instances}: ${[a.command, ...a.args].join(" ")}  →  ${agentJobTypes(a.roles, a.rank).join(", ")}`,
			)
		}
		ctx.output.info("Workforce running — press Ctrl+C to stop\n")

		try {
			await runWorkforce(client.job, agents, {
				signal: controller.signal,
				onEvent: (event) => ctx.output.info(describe(event)),
			})
		} finally {
			process.off("SIGINT", stop)
			process.off("SIGTERM", stop)
		}
	},
}

function describe(event: WorkforceEvent): string {
	switch (event.kind) {
		case "started":
			return `[${event.worker}] started job ${event.jobKey} (${event.jobType})`
		case "completed":
			return `[${event.worker}] completed job ${event.jobKey} in ${Math.round(event.ms / 1000)} s`
		case "failed":
			return `[${event.worker}] failed job ${event.jobKey} (${event.retries} retries left): ${event.message}`
		case "error":
			return `[${event.worker}] ${event.message}`
	}
}

export const agentGroup: CommandGroup = {
	name: "agent",
	description:
		"Hire coding-agent CLIs as durable job workers and run them as a workforce (serves agent:<role> jobs)",
	commands: [hireCmd, listCmd, fireCmd, workCmd],
}
