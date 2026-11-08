import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { PROCESS_TEXT_GUIDE } from "@bpmnkit/core"
import type { Command, CommandGroup } from "../types.js"

export const AGENT_CARD_KINDS = ["bpmn", "dmn", "form"] as const
export type AgentCardKind = (typeof AGENT_CARD_KINDS)[number]

const TITLES: Record<AgentCardKind, string> = {
	bpmn: "Print the BPMN process cheat sheet: build script, options, traps, lint",
	dmn: "Print the DMN decision table cheat sheet: build script, options, traps, validation",
	form: "Print the Camunda form cheat sheet: build script, options, traps, validation",
}

/**
 * The card Markdown. It ships as `agent-cards/<kind>.md` beside `dist/`, the
 * same layout from `src/commands` and `dist/commands`, so tests read the file
 * the published CLI prints.
 */
export function readAgentCard(kind: AgentCardKind): string {
	return readFileSync(
		fileURLToPath(new URL(`../../agent-cards/${kind}.md`, import.meta.url)),
		"utf8",
	)
}

function cardCommand(kind: AgentCardKind): Command {
	return {
		name: kind,
		description: TITLES[kind],
		args: [],
		flags:
			kind === "bpmn"
				? [
						{
							name: "text",
							description: "Also print the guide to the line format parseProcessText reads",
							type: "boolean",
						},
					]
				: [],
		examples: [{ description: TITLES[kind], command: `casen agent-card ${kind}` }],
		async run(ctx) {
			// Plain Markdown on stdout: an agent pipes or reads it, so no colour or table output.
			// The docspack ranking directive is noise outside the docs pack.
			let card = readAgentCard(kind).replace(/^<!-- docspack:.*-->\n\n/m, "")
			if (ctx.flags.text === true) card += `\n## Line format guide\n\n${PROCESS_TEXT_GUIDE}\n`
			process.stdout.write(card)
		},
	}
}

export const agentCardGroup: CommandGroup = {
	name: "agent-card",
	aliases: ["card"],
	description: "Print a ~2k-token cheat sheet for an AI agent writing BPMN, DMN or forms",
	commands: AGENT_CARD_KINDS.map(cardCommand),
}
