/**
 * Cases from the first real bench of the connect pass (glm-4.7-flash, 2026-10-02):
 * what the model was shown, and the near misses the resolver now repairs.
 */
import { describe, expect, it } from "vitest"
import {
	type ConnectorTask,
	resolveConnectorLine,
	selectConnectors,
} from "../../src/connectors/index.js"
import { type ConnectorLine, parseConnectorLine } from "../../src/index.js"
import { GITHUB, NOTION, STRIPE } from "./api-fixtures.js"

function aliases(text: string, tasks: ConnectorTask[], apis = [STRIPE]) {
	return Object.fromEntries(
		selectConnectors({ text, tasks }, { apis }).map((t) => [
			t.id,
			{
				cards: t.cards.map((c) => `${c.alias}${c.operation ? ` ${c.operation}` : ""}`),
				apis: (t.apis ?? []).map(
					(a) => `${a.service.id} ${a.operations[0]?.method} ${a.operations[0]?.path}`,
				),
			},
		]),
	)
}

function line(text: string): ConnectorLine {
	const parsed = parseConnectorLine(text, 1, [])
	if (!parsed) throw new Error(`not a with line: ${text}`)
	return parsed
}

describe("what the connect pass is shown", () => {
	it("offers the system the request names, not only one connector's operations", () => {
		const picked = aliases(
			"After an order is paid, send the customer an order confirmation email with SendGrid.",
			[{ id: "send", name: "Send order confirmation email", type: "serviceTask" }],
		)
		expect(picked.send?.cards).toContain("sendgrid mail")
	})

	it("prefers the connector of the system named to one that adds another", () => {
		const picked = aliases("Summarise each ticket with OpenAI and post it to Slack", [
			{ id: "sum", name: "Summarise ticket with OpenAI", type: "serviceTask" },
		])
		const cards = picked.sum?.cards ?? []
		expect(cards.indexOf("openai chat")).toBeGreaterThanOrEqual(0)
		expect(cards.indexOf("openai chat")).toBeLessThan(cards.indexOf("azure-openai completion"))
	})

	it("never offers a deprecated template", () => {
		const picked = aliases("Summarise the ticket with an AI agent", [
			{ id: "sum", name: "Summarise ticket with AI agent", type: "serviceTask" },
		])
		expect(picked.sum?.cards).not.toContain("ai-agent-v1")
	})

	it("ranks a service's endpoints by the request when the task only names the service", () => {
		const picked = aliases(
			"When a refund is approved, call the Stripe REST API to refund the payment.",
			[{ id: "call", name: "Call Stripe REST API", type: "serviceTask" }],
		)
		expect(picked.call?.cards[0]).toBe("http")
		expect(picked.call?.apis).toEqual(["stripe POST /v1/refunds"])
	})

	it("gives a service only the request names to the one task that fits it best", () => {
		const picked = aliases("Refund the payment with Stripe, then notify the customer", [
			{ id: "refund", name: "Refund payment", type: "serviceTask" },
			{ id: "notify", name: "Notify customer", type: "serviceTask" },
		])
		expect(picked.refund?.apis).toEqual(["stripe POST /v1/refunds"])
		expect(picked.notify?.apis ?? []).toEqual([])
	})

	it("offers the REST connector to a task the request says is a REST call", () => {
		const picked = aliases(
			"Check the stock with a REST call to the inventory service, then notify the warehouse in Microsoft Teams.",
			[
				{ id: "check", name: "Check stock", type: "serviceTask" },
				{ id: "notify", name: "Notify warehouse in Microsoft Teams", type: "serviceTask" },
			],
			[],
		)
		expect(picked.check?.cards[0]).toBe("http")
		expect(picked.notify?.cards[0]).toMatch(/^teams /)
	})

	it("gives a task with a connector of its own no API card from the request's words", () => {
		const picked = aliases(
			"List the failed GitHub Actions workflow runs and post the list to Slack.",
			[
				{ id: "list", name: "List failed runs", type: "serviceTask" },
				{ id: "post", name: "Post list to Slack", type: "serviceTask" },
			],
			[GITHUB],
		)
		expect(picked.list?.apis?.[0]).toMatch(
			/^github GET \/repos\/\{owner\}\/\{repo\}\/actions\/runs/,
		)
		expect(picked.post?.apis ?? []).toEqual([])
	})
})

describe("near misses the resolver repairs", () => {
	it("reads a line written like an API card's head as the call it means", () => {
		const r = resolveConnectorLine(line("with list: api github GET /repos/{owner}/{repo}/issues"), {
			apis: [GITHUB],
		})
		expect(r.templateId).toBe("io.camunda.connectors.HttpJson.v2")
		expect(r.values.url).toBe(
			'="https://api.github.com/repos/" + string(owner) + "/" + string(repo) + "/issues"',
		)
	})

	it("does not read a short unknown alias as another connector", () => {
		expect(
			resolveConnectorLine(line("with x: api foo GET /x"), { apis: [GITHUB] }).problems,
		).toEqual(['no connector is called "api"'])
	})

	it("reads {{variable}} and ${variable} as FEEL, and leaves secrets alone", () => {
		const r = resolveConnectorLine(
			line(
				"with p: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel={{variables.channel}} | data.text==${message}",
			),
		)
		expect(r.values).toMatchObject({
			token: "{{secrets.SLACK_TOKEN}}",
			"data.channel": "=channel",
			"data.text": "=message",
		})
	})

	it("reads a path alone as a path of the one service in play, its {{param}} as a parameter", () => {
		const r = resolveConnectorLine(line("with r: http POST /v1/pages/{{page_id}} | body=={}"), {
			apis: [NOTION],
		})
		expect(r.values.url).toBe('="https://api.notion.com/v1/pages/" + string(page_id)')
		expect(r.values["authentication.token"]).toBe("{{secrets.NOTION_TOKEN}}")
	})
})
