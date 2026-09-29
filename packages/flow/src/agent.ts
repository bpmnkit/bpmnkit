/**
 * The contract between an `.agent()` step and the worker that serves it.
 *
 * A flow names the work (a role, optionally a rank) and carries a prompt; a
 * workforce worker (`casen agent work`) polls the job types a hired profile
 * covers, renders the prompt with the job's variables and runs a coding-agent
 * CLI. Neither side names the other — this module is all they share.
 */

/** Task header carrying the prompt template of an agent step. */
export const AGENT_PROMPT_HEADER = "prompt"

/** Task header naming the variable an agent step's output is written to. */
export const AGENT_RESULT_HEADER = "resultVariable"

/** Variable an agent step writes its output to when the step names none. */
export const DEFAULT_AGENT_RESULT = "result"

const NAME = /^[A-Za-z0-9_-]+$/

/**
 * The job type an agent step with `role` (and optionally `rank`) is served on:
 * `agent:<role>` for any rank, `agent:<rank>:<role>` for one rank only.
 */
export function agentJobType(role: string, rank?: string): string {
	if (!NAME.test(role)) throw new Error(`Agent role "${role}" must match ${NAME}`)
	if (rank === undefined) return `agent:${role}`
	if (!NAME.test(rank)) throw new Error(`Agent rank "${rank}" must match ${NAME}`)
	return `agent:${rank}:${role}`
}

/**
 * Every job type a worker with these `roles` and `rank` serves: each role on its
 * own, and each role at the worker's rank.
 */
export function agentJobTypes(roles: readonly string[], rank?: string): string[] {
	const types = roles.map((role) => agentJobType(role))
	if (rank !== undefined) types.push(...roles.map((role) => agentJobType(role, rank)))
	return types
}

const PLACEHOLDER = /\{\{([A-Za-z_$][\w$]*)\}\}/g

/** The variable names a prompt template refers to with `{{name}}`, in order, without repeats. */
export function promptVariables(template: string): string[] {
	return [...new Set(Array.from(template.matchAll(PLACEHOLDER), (m) => m[1] ?? ""))]
}

/**
 * Fills each `{{name}}` in `template` with the variable of that name — a string
 * as is, anything else as JSON. Throws when a referenced variable is missing,
 * because an agent given a prompt with a hole in it guesses instead of failing.
 */
export function renderPrompt(template: string, variables: Record<string, unknown>): string {
	const missing = promptVariables(template).filter((name) => !(name in variables))
	if (missing.length > 0) {
		throw new Error(`Prompt refers to missing variable(s): ${missing.join(", ")}`)
	}
	return template.replace(PLACEHOLDER, (_, name: string) => {
		const value = variables[name]
		return typeof value === "string" ? value : JSON.stringify(value)
	})
}
