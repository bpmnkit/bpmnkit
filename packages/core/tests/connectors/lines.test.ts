import { describe, expect, it } from "vitest"
import {
	CONNECT_GUIDE,
	applyConnectorLines,
	connectorLineFor,
	resolveConnectorLine,
} from "../../src/connectors/index.js"
import {
	Bpmn,
	type BpmnDefinitions,
	type ConnectorLine,
	expand,
	parseConnectorLine,
	parseProcessDelta,
	parseProcessText,
} from "../../src/index.js"

function line(text: string): ConnectorLine {
	const parsed = parseConnectorLine(text, 1, [])
	if (!parsed) throw new Error(`not a with line: ${text}`)
	return parsed
}

function element(definitions: BpmnDefinitions, id: string) {
	const found = definitions.processes[0]?.flowElements.find((el) => el.id === id)
	if (!found) throw new Error(`no element ${id}`)
	return found
}

function inputs(definitions: BpmnDefinitions, id: string): Record<string, string> {
	const io = element(definitions, id).extensionElements.find((x) => x.name === "zeebe:ioMapping")
	return Object.fromEntries(
		(io?.children ?? []).map((c) => [c.attributes.target ?? "", c.attributes.source ?? ""]),
	)
}

describe("resolveConnectorLine", () => {
	it("resolves alias, operation and inputs, with the values that select the operation", () => {
		const r = resolveConnectorLine(
			line("with p: slack chat.postMessage | token={{secrets.SLACK}} | data.channel=#ops"),
		)
		expect(r.problems).toEqual([])
		expect(r.templateId).toBe("io.camunda.connectors.Slack.v1")
		expect(r.values).toEqual({
			method: "chat.postMessage",
			token: "{{secrets.SLACK}}",
			"data.channel": "#ops",
		})
	})

	it("repairs what a model gets nearly right", () => {
		const r = resolveConnectorLine(line("with p: slak postMessage | channel=#ops | text=hi"))
		expect(r.problems).toEqual([])
		expect(r.card?.operation).toBe("chat.postMessage")
		expect(r.values).toMatchObject({ "data.channel": "#ops", "data.text": "hi" })
		expect(r.fixes).toEqual([
			'read connector "slak" as "slack"',
			'read "channel" as "data.channel"',
			'read "text" as "data.text"',
		])
	})

	it("takes the operation from the input that selects it", () => {
		const r = resolveConnectorLine(line("with p: slack | method=chat.postMessage"))
		expect(r.card?.operation).toBe("chat.postMessage")
	})

	it("asks for an operation when a connector has several and the line names none", () => {
		const r = resolveConnectorLine(line("with p: slack | data.channel=#ops"))
		expect(r.card).toBeUndefined()
		expect(r.problems[0]).toMatch(/^slack has several operations; name one of chat\.postMessage/)
	})

	it("reads an HTTP method and URL written without keys, and result= both ways", () => {
		const whole = resolveConnectorLine(
			line("with f: http POST https://x.example/o | body=={id: 1} | result=order"),
		)
		// The method written without a key switches on `body`, which only POST, PUT and PATCH have
		expect(whole.problems).toEqual([])
		expect(whole.values.body).toBe("={id: 1}")
		expect(whole.values).toMatchObject({
			method: "POST",
			url: "https://x.example/o",
			resultVariable: "order",
		})
		const part = resolveConnectorLine(
			line("with f: http https://x.example | result=id: response.body.id"),
		)
		expect(part.values.resultExpression).toBe("={id: response.body.id}")
	})

	it("uses the result header the operation has, whatever its key", () => {
		const r = resolveConnectorLine(
			line(
				"with g: github createIssue | owner=a | repo=b | issueTitle=t | result=issue: response.body",
			),
		)
		expect(r.values.resultExpressionCreateIssue).toBe("={issue: response.body}")
	})

	it("never keeps a credential as a value, including one a mode switched on", () => {
		const r = resolveConnectorLine(
			line(
				"with f: http GET https://x.example | authentication.type=bearer | authentication.token=ghp_123",
			),
		)
		expect(r.values["authentication.token"]).toBe("{{secrets.HTTP_AUTHENTICATION_TOKEN}}")
		expect(r.fixes[0]).toMatch(/holds a credential/)
	})

	it("reports what it cannot use", () => {
		expect(resolveConnectorLine(line("with x: nothing-like-it")).problems).toEqual([
			'no connector is called "nothing-like-it"',
		])
		expect(
			resolveConnectorLine(line("with f: http https://x.example | colour=red")).problems,
		).toEqual(['http has no input "colour"; ignored'])
	})
})

describe("CONNECT_GUIDE", () => {
	it("teaches lines that parse and resolve without a problem", () => {
		const example = CONNECT_GUIDE.slice(CONNECT_GUIDE.indexOf("Example:") + "Example:".length)
		const delta = parseProcessDelta(example)
		expect(delta.problems).toEqual([])
		expect(delta.connectors).toHaveLength(2)
		for (const connector of delta.connectors) {
			expect(resolveConnectorLine(connector).problems).toEqual([])
		}
	})
})

describe("applyConnectorLines", () => {
	const TEXT = `# Orders
start[start Order placed] > fetch[task Fetch order] > notify[service Notify ops] > done[end Done]
with fetch: http GET https://api.example.com/orders | result=order: response.body
with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.text== "Order " + order.id`

	it("applies each line, turning a plain task into the connector's service task", () => {
		const parsed = parseProcessText(TEXT)
		const applied = applyConnectorLines(expand(parsed.diagram), parsed.connectors)
		expect(applied.problems).toEqual([])

		const saved = Bpmn.parse(Bpmn.export(applied.definitions))
		const fetch = element(saved, "fetch")
		expect(fetch.type).toBe("serviceTask")
		expect(fetch.unknownAttributes["zeebe:modelerTemplate"]).toBe(
			"io.camunda.connectors.HttpJson.v2",
		)
		expect(inputs(saved, "fetch")).toMatchObject({
			url: "https://api.example.com/orders",
			method: "GET",
		})
		expect(inputs(saved, "notify")["data.text"]).toBe('= "Order " + order.id')
	})

	it("asks for a required input the line left out, and applies the rest", () => {
		const parsed = parseProcessText(TEXT)
		const applied = applyConnectorLines(expand(parsed.diagram), parsed.connectors)
		expect(applied.questions).toEqual([
			{
				elementId: "notify",
				text: '"Notify ops" needs Channel/user name/email for Slack Outbound Connector: Post message.',
				options: [],
				draft: "with notify: slack chat.postMessage | data.channel=",
			},
		])
		expect(inputs(applied.definitions, "notify").token).toBe("{{secrets.SLACK_TOKEN}}")
	})

	it("applies an inbound connector to a start event", () => {
		const parsed = parseProcessText(
			"start[start:message Order webhook] > work[task Do work] > done[end Done]\nwith start: webhook-message-start | inbound.context=orders",
		)
		const applied = applyConnectorLines(expand(parsed.diagram), parsed.connectors)
		expect(applied.problems).toEqual([])
		expect(applied.questions).toEqual([])
		const start = element(applied.definitions, "start")
		expect(start.unknownAttributes["zeebe:modelerTemplate"]).toBe(
			"io.camunda.connectors.webhook.WebhookConnectorStartMessage.v1",
		)
	})
})

describe("connectorLineFor", () => {
	it.each([
		"with a: slack chat.postMessage | token={{secrets.SLACK}} | data.channel=#ops | data.text=hi",
		"with a: http POST https://x.example/o | body=={id: 1} | result=out",
		"with a: github createIssue | owner=acme | repo=shop | issueTitle=Broken",
	])("writes back a line that re-creates the same element: %s", (text) => {
		const parsed = parseProcessText(`start[start Go] > a[task Act] > done[end Done]\n${text}`)
		const first = applyConnectorLines(expand(parsed.diagram), parsed.connectors).definitions
		const written = connectorLineFor(element(first, "a"), first)
		expect(written).toBeDefined()

		const again = parseProcessText(
			`start[start Go] > a[task Act] > done[end Done]\nwith a: ${written}`,
		)
		const second = applyConnectorLines(expand(again.diagram), again.connectors).definitions
		expect(Bpmn.export(second)).toBe(Bpmn.export(first))
	})

	it("is undefined for an element without a known template", () => {
		const definitions = expand(
			parseProcessText("start[start Go] > a[service Act] > done[end Done]").diagram,
		)
		expect(connectorLineFor(element(definitions, "a"), definitions)).toBeUndefined()
	})
})
