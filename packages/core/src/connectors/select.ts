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
import { type ApiCard, type ApiService, apiBrand, formatApiCard, rankApiOperations } from "./api.js"
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
	/** Endpoints of services the task names that no dedicated connector covers, for `http`. */
	apis?: ApiCard[]
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
	append: ["add"],
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

/** Whether a request's terms name a system: one word, singular or plural ("Google Sheet"). */
function askedFor(system: string, requested: ReadonlySet<string>): boolean {
	return [system, system.replace(/s$/, ""), `${system}s`].some((form) => requested.has(form))
}

/** What each further card of a template costs in the ranking. */
const REPEAT_COST = 8

/**
 * Ranks each further card of a template lower: the Email connector's IMAP operations must
 * not crowd out SendGrid, which the request names, while a strong second operation of
 * one template still beats a weak other one.
 */
function varied<T extends { card: ConnectorCard; score: number }>(sorted: readonly T[]): T[] {
	const count = new Map<string, number>()
	return sorted
		.map((entry) => {
			const n = count.get(entry.card.templateId) ?? 0
			count.set(entry.card.templateId, n + 1)
			return { entry, score: entry.score - n * REPEAT_COST }
		})
		.sort((a, b) => b.score - a.score)
		.map(({ entry }) => entry)
}

/** Words of a request that ask for a plain REST call somewhere in the process. */
const REST_WORDS = new Set(["rest", "http", "https", "endpoint", "url"])

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
 * Ranking:
 * - A few words requests use for what templates call something else rank the
 *   candidates: "notify" prefers a connector's message-sending operation.
 * - A connector naming a system nobody asked for ranks lower: "Azure OpenAI"
 *   for a request that says OpenAI.
 * - Each further card of one template ranks lower, so one connector's
 *   operations do not crowd out another the request names.
 * - Deprecated templates are never offered.
 *
 * The REST connector is offered for a task whose name asks for an HTTP call
 * ("Fetch order", "Call endpoint") when nothing else fits, and for a task with
 * no connector of its own when the request asks for a REST call. Tasks with no
 * candidate are left out, so an empty answer means there is nothing to connect.
 *
 * With `options.apis`, services of the API index: a task (not an event) that
 * names a service, or whose request does as above, gets the REST connector
 * first and an API card with the service's best-fitting operations — unless a
 * dedicated connector for that system has an operation the task's name
 * mentions. A dedicated connector comes first; the index is for the rest.
 * - A task that names only the service ("Call Stripe REST API") is matched to
 *   operations by the request's words.
 * - A service only the request names goes to the one task it fits best.
 *
 * @param options.perTask - Cards per task, at most (default 3).
 * @param options.total - Cards in all, at most (default 8). Every task keeps
 *   its best card before any task gets a second.
 * @param options.apis - Services of `@bpmnkit/connector-gen/api-index` the
 *   request or the task names named, loaded.
 */
export function selectConnectors(
	input: { text?: string; tasks: readonly ConnectorTask[] },
	options: { perTask?: number; total?: number; apis?: readonly ApiService[] } = {},
): TaskCards[] {
	const perTask = options.perTask ?? 3
	const total = options.total ?? 8
	const apis = options.apis ?? []
	const requested = new Set(termsOf(input.text ?? ""))
	const requestTerms = withSynonyms([...requested])
	// A deprecated template has a successor in the catalog: offer that one
	const cards = listConnectorCards().filter(
		(card) => !getTemplate(card.templateId)?.name.includes("(Deprecated)"),
	)
	const http = connectorCards("io.camunda.connectors.HttpJson.v2")[0]

	// A system some task's name names belongs to that task: "Notify ops in Slack"
	// takes Slack, and "Record failure" does not get it from the request
	const claimed = new Set<string>()
	for (const task of input.tasks) {
		const named = new Set(termsOf(task.name ?? ""))
		for (const card of cards) {
			for (const system of systems(card)) if (named.has(system)) claimed.add(system)
		}
		for (const service of apis) {
			if (named.has(apiBrand(service.id))) claimed.add(apiBrand(service.id))
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
		// "Post summary to Slack" in a request that says Teams: the draft named the wrong
		// system, and the request's own ranks first
		const misnamed =
			requested.size > 0 &&
			cards.some(
				(card) =>
					fits(card, task.type) &&
					systems(card).some((s) => named.has(s) && !askedFor(s, requested)),
			)
		/** Whether a card fits by the task's own name, not only by the request. */
		let ownCard = false
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
			if (inName || byWord) ownCard = true
			// "Azure OpenAI" for a request that only says OpenAI names a system nobody asked for
			const asked = (s: string) =>
				[s, s.replace(/s$/, ""), `${s}s`].some((form) => named.has(form) || requested.has(form))
			// "Google Sheet" asks for the sheets connector: one word, singular or plural
			const unasked = own.filter((s) => !asked(s)).length
			const score =
				cardScore(card, terms) * 2 +
				cardScore(card, synonyms) +
				(inName ? 10 : 0) +
				(inRequest ? 4 : 0) +
				// The request's system ranks first, by what the request asks of it
				(inRequest && misnamed ? 30 + cardScore(card, requestTerms) : 0) -
				unasked * 8
			scored.push({ card, score })
		}
		const apiCards: (ApiCard & { fromRequest: boolean; score: number })[] = []
		if (http && TASKS.has(task.type) && fits(http, task.type)) {
			for (const service of apis) {
				const brand = apiBrand(service.id)
				const inName = named.has(brand)
				if (!inName && !(requested.has(brand) && !claimed.has(brand))) continue
				const dedicated = scored.some((s) => systems(s.card).includes(brand))
				// "Call Stripe REST API" says which service, and only the request says what for
				let ranked = rankApiOperations(service, task.name ?? "")
				if (ranked.length === 0 && inName && !dedicated) {
					ranked = rankApiOperations(service, input.text ?? "")
				}
				const best = ranked[0]
				if (!best) continue
				// A dedicated connector wins unless the index has an operation that fits more
				// of the name: GitHub's connector creates issues, the index lists workflow runs
				const words = (task.name ?? "")
					.toLowerCase()
					.split(/[^a-z0-9]+/)
					.filter((w) => w.length > 1 && w !== brand && !VERBS.has(w))
				const covered = Math.max(
					0,
					...scored
						.filter((s) => systems(s.card).includes(brand))
						.map((s) => words.filter((w) => cardScore(s.card, [w]) >= 3).length),
				)
				if (best.hits <= covered) continue
				apiCards.push({
					service,
					operations: ranked.slice(0, 3).map((r) => r.op),
					fromRequest: !inName,
					score: best.score,
				})
			}
		}
		if (http && fits(http, task.type) && !scored.some((s) => s.card === http)) {
			if (scored.length === 0 && terms.some((t) => HTTP_WORDS.has(t))) {
				scored.push({ card: http, score: 1 })
			} else if (
				TASKS.has(task.type) &&
				!ownCard &&
				[...requested].some((t) => REST_WORDS.has(t))
			) {
				// "check the stock with a REST call": Check stock names no system, the request says how
				scored.push({ card: http, score: 5 })
			}
		}
		scored.sort((a, b) => b.score - a.score)
		return { task, scored: varied(scored), apiCards }
	})

	// A service only the request names goes to the one task that fits it best: in "refund the
	// payment with Stripe, then notify the customer", Notify customer is not a Stripe call
	for (const service of apis) {
		const offers = ranked.flatMap(({ apiCards }) =>
			apiCards.filter((c) => c.service === service && c.fromRequest),
		)
		const best = offers.reduce<(typeof offers)[number] | undefined>(
			(a, b) => (a === undefined || b.score > a.score ? b : a),
			undefined,
		)
		for (const entry of ranked) {
			entry.apiCards = entry.apiCards.filter(
				(c) => c.service !== service || !c.fromRequest || c === best,
			)
		}
	}

	const picks = ranked.map(({ task, scored, apiCards }) => {
		// With an API card, the REST connector it is for comes first
		const ordered =
			apiCards.length > 0 && http
				? [http, ...scored.map((s) => s.card).filter((card) => card !== http)]
				: scored.map((s) => s.card)
		const apiPicked: ApiCard[] = apiCards
			.slice(0, 2)
			.map(({ service, operations }) => ({ service, operations }))
		return { task, cards: ordered.slice(0, perTask), apis: apiPicked }
	})

	// Every task's best card first, then second-best cards, and so on, up to the total
	const kept = new Map<string, ConnectorCard[]>()
	let budget = total
	for (let rank = 0; rank < perTask && budget > 0; rank++) {
		for (const { task, cards: candidates } of picks) {
			const card = candidates[rank]
			if (card === undefined || budget === 0) continue
			kept.set(task.id, [...(kept.get(task.id) ?? []), card])
			budget--
		}
	}
	return picks
		.filter(({ task }) => kept.has(task.id))
		.map(({ task, apis: apiCards }) => {
			const picked: TaskCards = { id: task.id, cards: kept.get(task.id) ?? [] }
			if (task.name !== undefined) picked.name = task.name
			if (apiCards.length > 0 && http && picked.cards.includes(http)) picked.apis = apiCards
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
 *
 * API cards follow a task's connector cards.
 */
export function formatConnectorSelection(selection: readonly TaskCards[]): string {
	return selection
		.map(({ id, name, cards, apis }) =>
			[
				`${id}${name ? ` (${name})` : ""}:`,
				...cards.map((c) => formatConnectorCard(c)),
				...(apis ?? []).map(formatApiCard),
			].join("\n"),
		)
		.join("\n\n")
}
