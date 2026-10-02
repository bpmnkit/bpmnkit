import { API_SERVICES, loadApiServices } from "@bpmnkit/connector-gen/api-index"
import type { BpmnDefinitions, ConnectorLine } from "@bpmnkit/core"
import {
	type ApiService,
	apiServicesIn,
	applyConnectorLines,
	findApiOperations,
	findConnectorCards,
	formatApiCard,
	formatConnectorCard,
} from "@bpmnkit/core/connectors"

/**
 * The connector tools of the MCP server: `find_connectors` answers a request
 * with connector cards, and `add_connector` configures a node from one, through
 * the same resolver as the `with` lines of the line format
 * (`doc/ai-connector-generation-plan.md` WS6). Both know the services of the
 * offline API index the text names, so a REST call gets a real URL and auth.
 */

/** Services of the API index a text names, loaded; at most a few, as each is large. */
function apisIn(text: string): Promise<ApiService[]> {
	return loadApiServices(apiServicesIn(text, API_SERVICES).slice(0, 3))
}

/**
 * Connector cards for a request, best first, then the endpoints of any indexed
 * HTTP API it names. Each card is one operation with only the inputs it needs.
 */
export async function findConnectors(query: string, limit = 5): Promise<string> {
	const apis = await apisIn(query)
	const apiCards = apis
		.map((service) => ({ service, operations: findApiOperations(service, query) }))
		.filter((card) => card.operations.length > 0)
	// A query that names an indexed API keeps only the connectors of systems it names:
	// "add a page to notion" is not a search for any connector that adds something
	const words = new Set(query.toLowerCase().split(/[^a-z0-9]+/))
	const cards = findConnectorCards(query, { limit }).filter(
		(card) => apiCards.length === 0 || card.alias.split("-").some((part) => words.has(part)),
	)
	if (cards.length === 0 && apiCards.length === 0) {
		return `No connector matched "${query}". Describe the step in other words, or use add_connector with alias "http" and a URL.`
	}
	const parts = [
		"A * marks a required input; (secret) inputs take {{secrets.NAME}}. Pass alias, operation and inputs to add_connector.",
		...cards.map((card) => formatConnectorCard(card)),
	]
	if (apiCards.length > 0) {
		parts.push(
			"",
			'API endpoints for the http connector: alias "http", values { method, url: <path>, api: <service> } — base URL, auth and headers are added. A connector card above, when there is one, comes first.',
			...apiCards.map(formatApiCard),
		)
	}
	return parts.join("\n")
}

/** What `add_connector` is given. */
export interface AddConnectorArgs {
	/** The node to configure. */
	id: string
	/** A connector alias from a card: `slack`, `http`, … */
	alias: string
	/** The card's operation, when the connector has several. */
	operation?: string
	/** Inputs by key; a value starting with `=` is FEEL. `result` and `api` work as in `with` lines. */
	values?: Record<string, string>
}

/**
 * Configures node `id` as a connector, as a `with` line would: a plain task
 * becomes the connector's service task, a credential becomes a secret
 * placeholder, and what is still missing is reported as a question.
 */
export async function addConnector(
	definitions: BpmnDefinitions,
	args: AddConnectorArgs,
): Promise<{ definitions: BpmnDefinitions; text: string }> {
	const values = Object.fromEntries(
		Object.entries(args.values ?? {}).map(([k, v]) => [k, String(v)]),
	)
	const line: ConnectorLine & { elementId: string } = {
		id: args.id,
		elementId: args.id,
		alias: args.alias.trim().toLowerCase(),
		args: args.operation ? [args.operation] : [],
		values,
		line: 1,
	}
	const apis = await apisIn(`${values.api ?? ""} ${values.url ?? ""}`)
	const applied = applyConnectorLines(definitions, [line], { apis })
	const element = applied.definitions.processes
		.flatMap((p) => p.flowElements)
		.find((el) => el.id === args.id)
	const template = element?.unknownAttributes["zeebe:modelerTemplate"]
	const lines: string[] = []
	if (template === undefined) {
		lines.push(`${args.id} was not configured.`)
	} else {
		lines.push(`Configured ${args.id} with ${template}.`)
	}
	for (const p of applied.problems) lines.push(`Problem: ${p.message}`)
	for (const fix of applied.fixes) lines.push(`Fixed: ${fix}`)
	for (const q of applied.questions) {
		lines.push(`Still needed: ${q.text} Call add_connector again with that input.`)
	}
	return { definitions: applied.definitions, text: lines.join("\n") }
}
