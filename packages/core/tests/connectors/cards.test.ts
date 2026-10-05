import { describe, expect, it } from "vitest"
import {
	BPMNKIT_CONNECTOR_TEMPLATES,
	BUNDLED_CONNECTOR_TEMPLATES,
	CONNECTOR_ALIASES,
	type ConnectorCard,
	type ElementTemplate,
	applyElementTemplate,
	connectorAlias,
	connectorCards,
	findConnectorCards,
	formatConnectorCard,
	listConnectorCards,
	propertyKey,
	templateIdForAlias,
} from "../../src/connectors/index.js"

const byId = new Map(
	[...BUNDLED_CONNECTOR_TEMPLATES, ...BPMNKIT_CONNECTOR_TEMPLATES].map((t) => [t.id, t]),
)

/** A value a property accepts: its first choice for a dropdown, else a placeholder. */
function sample(template: ElementTemplate, key: string): string {
	const prop = template.properties.find((p) => propertyKey(p) === key && p.choices?.length)
	return prop?.choices?.[0]?.value ?? "x"
}

function missing(template: ElementTemplate, values: Record<string, string>): string[] {
	return applyElementTemplate(template, values)
		.problems.filter((p) => p.kind === "missing-required")
		.map((p) => p.key ?? p.message)
}

function filled(card: ConnectorCard, template: ElementTemplate): Record<string, string> {
	const values = { ...card.values }
	for (const input of card.required) values[input.key] = sample(template, input.key)
	for (const mode of card.modes) {
		if (mode.required) values[mode.key] = mode.choices[0]?.value ?? ""
	}
	return values
}

describe("CONNECTOR_ALIASES", () => {
	it("names every bundled template, and nothing else", () => {
		expect(Object.keys(CONNECTOR_ALIASES).sort()).toEqual([...byId.keys()].sort())
	})

	it("gives every template a different alias", () => {
		const aliases = Object.values(CONNECTOR_ALIASES).map((e) => e.alias)
		expect(new Set(aliases).size).toBe(aliases.length)
	})

	it("lists only operation dropdowns its template has", () => {
		for (const [id, entry] of Object.entries(CONNECTOR_ALIASES)) {
			const template = byId.get(id)
			for (const key of entry.operations ?? []) {
				const dropdown = template?.properties.find(
					(p) => p.type === "Dropdown" && propertyKey(p) === key,
				)
				expect(dropdown, `${id}: ${key}`).toBeDefined()
			}
		}
	})
})

describe("connector cards", () => {
	const cards = listConnectorCards()

	it("cover every template, with one card per operation", () => {
		expect(new Set(cards.map((c) => c.templateId))).toEqual(new Set(byId.keys()))
		for (const id of byId.keys()) {
			const names = connectorCards(id).map((c) => c.operation ?? "")
			expect(new Set(names).size, id).toBe(names.length)
		}
	})

	it.each(cards.map((c) => [`${c.alias} ${c.operation ?? ""}`, c] as const))(
		"%s: its required inputs, and each mode's, are all the template requires",
		(_, card) => {
			const template = byId.get(card.templateId)
			if (!template) throw new Error(`no template ${card.templateId}`)
			const values = filled(card, template)
			expect(missing(template, values)).toEqual([])
			for (const mode of card.modes) {
				for (const choice of mode.choices) {
					const withMode = { ...values, [mode.key]: choice.value }
					for (const key of choice.requires) withMode[key] = sample(template, key)
					expect(missing(template, withMode), `${mode.key}=${choice.value}`).toEqual([])
				}
			}
		},
	)

	it("lists only the inputs of the chosen operation", () => {
		const createIssue = connectorCards("io.camunda.connectors.GitHub.v1").find(
			(c) => c.operation === "createIssue",
		)
		expect(createIssue?.values).toEqual({
			operationGroup: "issues",
			issueOperationType: "createIssue",
		})
		expect(createIssue?.required.map((i) => i.key)).toEqual(["owner", "repo", "issueTitle"])
		const keys = [...(createIssue?.required ?? []), ...(createIssue?.optional ?? [])].map(
			(i) => i.key,
		)
		expect(keys).not.toContain("labelName")
		expect(keys).not.toContain("tagName")
	})

	it("marks credentials as secrets and keeps modes as choices with what they add", () => {
		const post = connectorCards("io.camunda.connectors.Slack.v1").find(
			(c) => c.operation === "chat.postMessage",
		)
		expect(post?.required.map((i) => i.key)).toEqual(["token", "data.text", "data.channel"])
		expect(post?.required[0]?.secret).toBe(true)

		const [http] = connectorCards("io.camunda.connectors.HttpJson.v2")
		expect(http?.required.map((i) => i.key)).toEqual(["url"])
		const auth = http?.modes.find((m) => m.key === "authentication.type")
		expect(auth?.default).toBe("noAuth")
		expect(auth?.choices.find((c) => c.value === "bearer")?.requires).toEqual([
			"authentication.token",
		])
	})
})

describe("aliases", () => {
	it("map both ways", () => {
		expect(connectorAlias("io.camunda.connectors.HttpJson.v2")).toBe("http")
		expect(templateIdForAlias("Slack")).toBe("io.camunda.connectors.Slack.v1")
		expect(templateIdForAlias("nope")).toBeUndefined()
	})
})

describe("findConnectorCards", () => {
	const first = (query: string) => {
		const [card] = findConnectorCards(query)
		return card && `${card.alias} ${card.operation ?? ""}`.trim()
	}

	it("finds the operation a request names", () => {
		expect(first("post a message to slack")).toBe("slack chat.postMessage")
		expect(first("create a github issue")).toBe("github createIssue")
		expect(first("http")).toBe("http")
		expect(first("call a REST api")).toBe("http")
	})

	it("returns nothing for an empty query, and honours the limit", () => {
		expect(findConnectorCards("  ")).toEqual([])
		expect(findConnectorCards("slack", { limit: 2 })).toHaveLength(2)
	})
})

describe("formatConnectorCard", () => {
	it("writes one line, leaving advanced inputs out unless asked", () => {
		const [http] = connectorCards("io.camunda.connectors.HttpJson.v2")
		if (!http) throw new Error("no http card")
		const line = formatConnectorCard(http)
		expect(line).not.toContain("\n")
		expect(line.startsWith("http — Send REST Request | url*")).toBe(true)
		expect(line).toContain("bearer(authentication.token)")
		expect(line).not.toContain("retryBackoff")
		expect(formatConnectorCard(http, { advanced: true })).toContain("retryBackoff")
	})
})
