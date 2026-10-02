/**
 * Picks the connector cards a model sees when it connects a diagram.
 *
 * The connect pass runs after the diagram has its shape, so every task already
 * has a name: "Post summary to Slack", "List open issues". Cards are picked per
 * task from that name, with the user's request as context for the systems it
 * names, and capped so the prompt stays small. No model is involved: when no
 * task matches anything, there is nothing to ask a model.
 */

import type { BpmnElementType } from "../index.js"
import {
	type ConnectorCard,
	cardScore,
	connectorCards,
	formatConnectorCard,
	listConnectorCards,
	searchTerms,
} from "./cards.js"
import { getTemplate } from "./catalog.js"

/** A node that could carry a connector. */
export interface ConnectorTask {
	id: string
	name?: string
	type: BpmnElementType
}

/** The cards picked for one task, best first. */
export interface TaskCards {
	id: string
	name?: string
	cards: ConnectorCard[]
}

/** Element types a connector template can be applied to, by the BPMN name templates use. */
const BPMN_TYPE: Partial<Record<BpmnElementType, string>> = {
	task: "bpmn:Task",
	serviceTask: "bpmn:ServiceTask",
	sendTask: "bpmn:SendTask",
	scriptTask: "bpmn:ScriptTask",
	receiveTask: "bpmn:ReceiveTask",
	startEvent: "bpmn:StartEvent",
	endEvent: "bpmn:EndEvent",
	intermediateCatchEvent: "bpmn:IntermediateCatchEvent",
	intermediateThrowEvent: "bpmn:IntermediateThrowEvent",
	boundaryEvent: "bpmn:BoundaryEvent",
}

/** Tasks a template written for `bpmn:Task` turns into its own type. */
const TASKS = new Set<BpmnElementType>(["task", "serviceTask", "sendTask", "scriptTask"])

/** Template element types that turn a task into an outbound call. */
const OUTBOUND_TASKS = new Set(["bpmn:ServiceTask", "bpmn:SendTask", "bpmn:Task"])

/**
 * A request's words, each whole and split at case changes: "GitHub" is both
 * `github`, the system, and `git hub`, as operation names are split.
 */
function termsOf(text: string): string[] {
	const whole = text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((w) => w.length > 1)
	return [...new Set([...searchTerms(text), ...searchTerms(whole.join(" "))])]
}

/** Whether a card's template can be applied to an element of this type. */
function fits(card: ConnectorCard, type: BpmnElementType): boolean {
	const bpmn = BPMN_TYPE[type]
	const template = getTemplate(card.templateId)
	if (!bpmn || !template) return false
	const target = template.elementType?.value
	if (target !== undefined) {
		// An outbound task template converts any task; any other keeps to its own element type
		return target === bpmn || (TASKS.has(type) && OUTBOUND_TASKS.has(target))
	}
	return (
		template.appliesTo.includes(bpmn) ||
		(TASKS.has(type) && template.appliesTo.includes("bpmn:Task"))
	)
}

/** Alias parts that say how a connector attaches, not which system it talks to. */
const NOT_A_SYSTEM = new Set([
	"start",
	"catch",
	"boundary",
	"receive",
	"message",
	"throw",
	"end",
	"send",
	"legacy",
	"remote",
	"subprocess",
	"polling",
	"tools",
	"schema",
	"adhoc",
	"kb",
	"code",
	"memory",
	"flow",
	"incident",
	"chat",
	"api",
])

/** The systems a card's alias names: `github-webhook-start` → github, webhook. */
function systems(card: ConnectorCard): string[] {
	return card.alias.split("-").filter((part) => !NOT_A_SYSTEM.has(part) && !/^v\d+$/.test(part))
}

/** Verbs every connector has an operation for; a match on them alone says nothing. */
const VERBS = new Set([
	"create",
	"get",
	"list",
	"update",
	"delete",
	"send",
	"add",
	"remove",
	"read",
	"write",
	"find",
	"search",
	"check",
	"run",
	"post",
	"put",
	"set",
	"new",
	"all",
	"open",
])

/** Words requests use for what templates call something else: "Notify ops" is a message. */
const SYNONYMS: Record<string, readonly string[]> = {
	notify: ["message", "send"],
	inform: ["message", "send"],
	alert: ["message", "send"],
	tell: ["message", "send"],
	mail: ["email"],
	text: ["message"],
	sms: ["message"],
}

function withSynonyms(terms: readonly string[]): string[] {
	return [...new Set(terms.flatMap((t) => [t, ...(SYNONYMS[t] ?? [])]))]
}

/** Words of a task name that mean a plain REST call when no connector names the system. */
const HTTP_WORDS = new Set([
	"http",
	"https",
	"rest",
	"endpoint",
	"request",
	"fetch",
	"url",
	"webhook",
])

/**
 * Picks cards for each task that could carry a connector: tasks, and events a
 * connector template can attach to. A card is a candidate for a task when:
 *
 * - the task's name names the card's system ("Post to **Slack**"), or
 * - the task is a task (not an event), the request names the system, no
 *   other task's name does, and the card fits the task, or
 * - the task's name shares a word other than a common verb with the
 *   connector's name ("Publish **event**" and an event-bus connector).
 *
 * A few words requests use for what templates call something else rank the
 * candidates: "notify" prefers a connector's message-sending operation.
 *
 * The REST connector is offered for a task whose name asks for an HTTP call
 * ("Fetch order", "Call endpoint") when nothing else fits. Tasks with no
 * candidate are left out, so an empty answer means there is nothing to connect.
 *
 * @param options.perTask - Cards per task, at most (default 3).
 * @param options.total - Cards in all, at most (default 8). Every task keeps
 *   its best card before any task gets a second.
 */
export function selectConnectors(
	input: { text?: string; tasks: readonly ConnectorTask[] },
	options: { perTask?: number; total?: number } = {},
): TaskCards[] {
	const perTask = options.perTask ?? 3
	const total = options.total ?? 8
	const requested = new Set(termsOf(input.text ?? ""))
	const cards = listConnectorCards()
	const http = connectorCards("io.camunda.connectors.HttpJson.v2")[0]

	// A system some task's name names belongs to that task: "Notify ops in Slack"
	// takes Slack, and "Record failure" does not get it from the request
	const claimed = new Set<string>()
	for (const task of input.tasks) {
		const named = new Set(termsOf(task.name ?? ""))
		for (const card of cards) {
			for (const system of systems(card)) if (named.has(system)) claimed.add(system)
		}
	}

	const ranked = input.tasks.map((task) => {
		const terms = termsOf(task.name ?? "")
		const named = new Set(terms)
		const content = terms.filter((t) => !VERBS.has(t))
		// Synonyms only rank: "Notify ops" prefers a connector's send-message operation,
		// but does not make every messaging connector a candidate
		const synonyms = withSynonyms(terms).filter((t) => !named.has(t))
		const scored: { card: ConnectorCard; score: number }[] = []
		for (const card of cards) {
			if (!fits(card, task.type)) continue
			const own = systems(card)
			const inName = own.some((s) => named.has(s))
			// An event only carries a connector its own name asks for: a request that
			// mentions Slack does not make "Every hour" a Slack trigger
			const inRequest = TASKS.has(task.type) && own.some((s) => requested.has(s) && !claimed.has(s))
			// A word of the connector's name, not only of one of its operations
			const byWord = cardScore(card, content) >= 4
			if (!inName && !inRequest && !byWord) continue
			const score =
				cardScore(card, terms) * 2 +
				cardScore(card, synonyms) +
				(inName ? 10 : 0) +
				(inRequest ? 4 : 0)
			scored.push({ card, score })
		}
		if (
			scored.length === 0 &&
			http &&
			fits(http, task.type) &&
			terms.some((t) => HTTP_WORDS.has(t))
		) {
			scored.push({ card: http, score: 1 })
		}
		scored.sort((a, b) => b.score - a.score)
		return { task, cards: scored.slice(0, perTask).map((s) => s.card) }
	})

	// Every task's best card first, then second-best cards, and so on, up to the total
	const kept = new Map<string, ConnectorCard[]>()
	let budget = total
	for (let rank = 0; rank < perTask && budget > 0; rank++) {
		for (const { task, cards: candidates } of ranked) {
			const card = candidates[rank]
			if (card === undefined || budget === 0) continue
			kept.set(task.id, [...(kept.get(task.id) ?? []), card])
			budget--
		}
	}
	return ranked
		.filter(({ task }) => kept.has(task.id))
		.map(({ task }) => {
			const picked: TaskCards = { id: task.id, cards: kept.get(task.id) ?? [] }
			if (task.name !== undefined) picked.name = task.name
			return picked
		})
}

/**
 * The picked cards as a prompt block, one task per paragraph:
 *
 * ```
 * notify (Notify ops):
 * slack chat.postMessage — … | token*(secret) data.text* data.channel* | …
 * ```
 */
export function formatConnectorSelection(selection: readonly TaskCards[]): string {
	return selection
		.map(({ id, name, cards }) =>
			[`${id}${name ? ` (${name})` : ""}:`, ...cards.map((c) => formatConnectorCard(c))].join("\n"),
		)
		.join("\n\n")
}
