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
import { GITHUB, NOTION, SENDGRID, STRIPE } from "./api-fixtures.js"

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

	it("takes a system's name in the singular or the plural", () => {
		const picked = aliases(
			"Append every new lead to our Google Sheet, then notify the sales team in Microsoft Teams.",
			[
				{ id: "append", name: "Append lead", type: "serviceTask" },
				{ id: "notify", name: "Notify sales team", type: "serviceTask" },
			],
			[],
		)
		expect(picked.append?.cards[0]).toBe("google-sheets addValues")
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

	it("prefers a dedicated connector that covers the request to the index's endpoint", () => {
		// glm-4.7-flash drafting, 2026-10-04: http came first, and the model's REST line took the task
		const picked = aliases(
			"After an order is paid, send the customer an order confirmation email with SendGrid.",
			[{ id: "confirm", name: "Create order confirmation in SendGrid", type: "sendTask" }],
			[SENDGRID],
		)
		expect(picked.confirm?.cards[0]).toBe("sendgrid mail")
		expect(picked.confirm?.apis).toEqual([])
		// The index still wins where the connector cannot do what the request asks
		const runs = aliases(
			"Every morning, list the failed GitHub Actions workflow runs of our web repository.",
			[{ id: "list", name: "List failed workflow runs", type: "serviceTask" }],
			[GITHUB],
		)
		expect(runs.list?.apis).toEqual(["github GET /repos/{owner}/{repo}/actions/runs"])
	})

	it("offers only the system a task names, not connectors that share a word with it", () => {
		// glm-4.7-flash, 2026-10-04: Camunda's Send message connector for "Send message to SQS"
		const picked = aliases(
			"Run an AWS Lambda function to resize each uploaded image, then send a message about it to an SQS queue.",
			[
				{ id: "resize", name: "Resize in AWS Lambda", type: "serviceTask" },
				{ id: "send", name: "Send message to SQS", type: "serviceTask" },
			],
			[],
		)
		expect(picked.resize?.cards).toEqual(["lambda"])
		expect(picked.send?.cards).toEqual(["sqs"])
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

	it("reads a line that starts with the method as a REST call", () => {
		const r = resolveConnectorLine(
			line("with list: GET /repos/web/web/actions/runs | api=github"),
			{
				apis: [GITHUB],
			},
		)
		expect(r.templateId).toBe("io.camunda.connectors.HttpJson.v2")
		expect(r.values).toMatchObject({
			method: "GET",
			url: "https://api.github.com/repos/web/web/actions/runs",
		})
	})

	it("reads headers written as text as a FEEL context, and keeps a positional URL", () => {
		const r = resolveConnectorLine(
			line(
				"with create: http POST /v1/pages | api=notion | url=api.notion.base | headers=Notion-Version: 2026-03-11",
			),
			{ apis: [NOTION] },
		)
		expect(r.values.url).toBe("https://api.notion.com/v1/pages")
		expect(r.values.headers).toBe('={"Notion-Version": "2026-03-11"}')
	})

	it("reads a #channel written as FEEL as the text it is", () => {
		const r = resolveConnectorLine(
			line(
				"with p: slack chat.postMessage | token={{secrets.T}} | data.channel==#ops | data.text=hi",
			),
		)
		expect(r.values["data.channel"]).toBe("#ops")
	})

	it("reads a path alone as a path of the one service in play, its {{param}} as a parameter", () => {
		const r = resolveConnectorLine(line("with r: http POST /v1/pages/{{page_id}} | body=={}"), {
			apis: [NOTION],
		})
		expect(r.values.url).toBe('="https://api.notion.com/v1/pages/" + string(page_id)')
		expect(r.values["authentication.token"]).toBe("{{secrets.NOTION_TOKEN}}")
	})
})
