import { describe, expect, it } from "vitest"
import {
	apiServicesIn,
	apiUrl,
	applyConnectorLines,
	findApiOperations,
	formatApiCard,
	formatConnectorSelection,
	resolveConnectorLine,
	selectConnectors,
} from "../../src/connectors/index.js"
import {
	Bpmn,
	type BpmnDefinitions,
	type ConnectorLine,
	expand,
	parseConnectorLine,
	parseProcessText,
} from "../../src/index.js"
import { GITHUB, JIRA, NOTION, STRIPE } from "./api-fixtures.js"

const APIS = [GITHUB, STRIPE, NOTION, JIRA]

function line(text: string): ConnectorLine {
	const parsed = parseConnectorLine(text, 1, [])
	if (!parsed) throw new Error(`not a with line: ${text}`)
	return parsed
}

function inputs(definitions: BpmnDefinitions, id: string): Record<string, string> {
	const found = definitions.processes[0]?.flowElements.find((el) => el.id === id)
	const io = found?.extensionElements.find((x) => x.name === "zeebe:ioMapping")
	return Object.fromEntries(
		(io?.children ?? []).map((c) => [c.attributes.target ?? "", c.attributes.source ?? ""]),
	)
}

describe("apiServicesIn", () => {
	const summaries = [
		{ id: "stripe", name: "Stripe API" },
		{ id: "twilio", name: "Twilio Messaging API" },
		{ id: "twilio-voice", name: "Twilio Voice API" },
		{ id: "box", name: "Box API" },
	]

	it("finds the services a text names by their brand", () => {
		expect(apiServicesIn("Charge the card with Stripe", summaries)).toEqual(["stripe"])
		expect(apiServicesIn("Send an SMS via Twilio", summaries)).toEqual(["twilio", "twilio-voice"])
	})

	it("takes an everyday word for a service only as '<brand> API'", () => {
		expect(apiServicesIn("Put the parcel in a box", summaries)).toEqual([])
		expect(apiServicesIn("Upload the contract with the Box API", summaries)).toEqual(["box"])
	})
})

describe("findApiOperations", () => {
	it("ranks by the task's words, with the verb choosing the method", () => {
		expect(findApiOperations(GITHUB, "Create GitHub issue")[0]).toMatchObject({
			method: "POST",
			path: "/repos/{owner}/{repo}/issues",
		})
		expect(findApiOperations(GITHUB, "List open issues")[0]).toMatchObject({
			method: "GET",
			path: "/repos/{owner}/{repo}/issues",
		})
		expect(findApiOperations(STRIPE, "Create Stripe customer")[0]).toMatchObject({
			method: "POST",
			path: "/v1/customers",
		})
		expect(findApiOperations(GITHUB, "List workflow runs")[0]?.path).toBe(
			"/repos/{owner}/{repo}/actions/runs",
		)
	})

	it("prefers the resource the task names to a deeper path that mentions its words", () => {
		const service: ApiService = {
			...STRIPE,
			operations: [
				{
					method: "POST",
					path: "/v1/terminal/readers/{reader}/refund_payment",
					summary: "Refund a Charge or a PaymentIntent in-person",
				},
				{ method: "GET", path: "/v1/refunds", summary: "List all refunds" },
				{ method: "POST", path: "/v1/refunds", summary: "Create a refund" },
			],
		}
		expect(findApiOperations(service, "Refund payment in Stripe")[0]).toMatchObject({
			method: "POST",
			path: "/v1/refunds",
		})
	})

	it("finds nothing from verbs and the brand alone", () => {
		expect(findApiOperations(STRIPE, "Call Stripe")).toEqual([])
	})
})

describe("formatApiCard", () => {
	it("prints the service, its auth and secret, then one line per operation", () => {
		const operations = findApiOperations(STRIPE, "Create customer", { limit: 1 })
		expect(formatApiCard({ service: STRIPE, operations })).toBe(
			[
				"api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN",
				"POST /v1/customers — Create a customer | form body: name email description address balance business_name",
			].join("\n"),
		)
	})

	it("says when the base URL is the account's own", () => {
		expect(formatApiCard({ service: JIRA, operations: [] })).toBe(
			"api jira — Atlassian Jira API (base URL: the account's own) auth=basic secret=JIRA_USERNAME,JIRA_PASSWORD",
		)
	})
})

describe("apiUrl", () => {
	it("reads path parameters from variables of the same name", () => {
		expect(apiUrl("https://api.github.com", "/repos/{owner}/{repo}/issues")).toBe(
			'="https://api.github.com/repos/" + string(owner) + "/" + string(repo) + "/issues"',
		)
		expect(apiUrl("https://api.notion.com", "/v1/pages/{page_id}")).toBe(
			'="https://api.notion.com/v1/pages/" + string(page_id)',
		)
		expect(apiUrl("https://api.stripe.com", "/v1/customers")).toBe(
			"https://api.stripe.com/v1/customers",
		)
	})
})

describe("resolveConnectorLine with api=", () => {
	it("completes the URL, the authentication and a form body's content type", () => {
		const r = resolveConnectorLine(
			line("with c: http POST /v1/customers | api=stripe | body=={email: email}"),
			{ apis: APIS },
		)
		expect(r.problems).toEqual([])
		expect(r.questions).toEqual([])
		expect(r.values).toMatchObject({
			method: "POST",
			url: "https://api.stripe.com/v1/customers",
			"authentication.type": "bearer",
			"authentication.token": "{{secrets.STRIPE_TOKEN}}",
			headers: '={"Content-Type": "application/x-www-form-urlencoded"}',
			body: "={email: email}",
		})
	})

	it("adds the headers an operation needs, and turns path parameters into FEEL", () => {
		const r = resolveConnectorLine(line("with u: http PATCH /v1/pages/{page_id} | api=notion"), {
			apis: APIS,
		})
		expect(r.problems).toEqual([])
		expect(r.values.url).toBe('="https://api.notion.com/v1/pages/" + string(page_id)')
		expect(r.values.headers).toBe('={"Notion-Version": "2026-03-11"}')
	})

	it("knows a service by its base URL without api=", () => {
		const r = resolveConnectorLine(
			line("with i: http POST https://api.github.com/repos/acme/web/issues"),
			{ apis: APIS },
		)
		expect(r.questions).toEqual([])
		expect(r.values.url).toBe("https://api.github.com/repos/acme/web/issues")
		expect(r.values["authentication.token"]).toBe("{{secrets.GITHUB_TOKEN}}")
	})

	it("keeps the line's own authentication", () => {
		const r = resolveConnectorLine(
			line(
				"with c: http GET /v1/customers | api=stripe | authentication.type=basic | authentication.username={{secrets.SK}}",
			),
			{ apis: APIS },
		)
		expect(r.values["authentication.type"]).toBe("basic")
		expect(r.values["authentication.token"]).toBeUndefined()
	})

	it("asks to check a call the index does not have", () => {
		const r = resolveConnectorLine(line("with c: http POST /v1/charges/now | api=stripe"), {
			apis: APIS,
		})
		expect(r.values.url).toBe("https://api.stripe.com/v1/charges/now")
		expect(r.questions).toEqual([
			{
				text: "POST /v1/charges/now is not an operation of Stripe API in the API index — check the method and the URL.",
				input: "url",
			},
		])
	})

	it("asks for the address of a service without a fixed host", () => {
		const r = resolveConnectorLine(line("with j: http POST /rest/api/3/issue | api=jira"), {
			apis: APIS,
		})
		expect(r.questions.map((q) => q.input)).toEqual(["url"])
		expect(r.questions[0]?.text).toMatch(/no fixed address/)
	})

	it("reports an unknown service, and api= on another connector", () => {
		expect(
			resolveConnectorLine(line("with c: http GET /x | api=acme"), { apis: APIS }).problems,
		).toEqual(['no API "acme" is in the API index; api= ignored'])
		expect(
			resolveConnectorLine(
				line("with p: slack chat.postMessage | token={{secrets.T}} | api=stripe"),
				{ apis: APIS },
			).problems,
		).toEqual(["api= is for the http connector; ignored"])
	})
})

describe("applyConnectorLines with api=", () => {
	it("writes the completed call, and its questions with a line to finish", () => {
		const parsed = parseProcessText(`# Signup
start[start Signed up] > customer[task Create Stripe customer] > page[task Add Notion page] > done[end Done]
with customer: http POST /v1/customers | api=stripe | body=={email: email} | result=customer: response.body
with page: http POST /v1/pages/new | api=notion`)
		const applied = applyConnectorLines(expand(parsed.diagram), parsed.connectors, {
			apis: APIS,
		})
		expect(applied.problems).toEqual([])
		const saved = Bpmn.parse(Bpmn.export(applied.definitions))
		expect(inputs(saved, "customer")).toMatchObject({
			url: "https://api.stripe.com/v1/customers",
			"authentication.token": "{{secrets.STRIPE_TOKEN}}",
		})
		expect(applied.questions).toEqual([
			{
				elementId: "page",
				text: '"Add Notion page": POST /v1/pages/new is not an operation of Notion API in the API index — check the method and the URL.',
				options: [],
				draft: "with page: http | url=",
			},
		])
	})
})

describe("selectConnectors with apis", () => {
	it("offers the REST connector with an API card for a system without a connector", () => {
		const selection = selectConnectors(
			{
				text: "When someone signs up, create a Stripe customer",
				tasks: [{ id: "customer", name: "Create customer", type: "serviceTask" }],
			},
			{ apis: [STRIPE] },
		)
		expect(selection[0]?.cards[0]?.alias).toBe("http")
		expect(selection[0]?.apis?.[0]?.service.id).toBe("stripe")
		expect(selection[0]?.apis?.[0]?.operations[0]?.path).toBe("/v1/customers")
		expect(formatConnectorSelection(selection)).toContain(
			"api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN\nPOST /v1/customers — Create a customer",
		)
	})

	it("prefers a dedicated connector with an operation the task mentions", () => {
		const selection = selectConnectors(
			{ tasks: [{ id: "issue", name: "Create GitHub issue", type: "serviceTask" }] },
			{ apis: [GITHUB] },
		)
		expect(selection[0]?.cards[0]?.alias).toBe("github")
		expect(selection[0]?.apis).toBeUndefined()
	})

	it("falls back to the index for what the dedicated connector cannot do", () => {
		const selection = selectConnectors(
			{ tasks: [{ id: "runs", name: "List GitHub workflow runs", type: "serviceTask" }] },
			{ apis: [GITHUB] },
		)
		expect(selection[0]?.cards[0]?.alias).toBe("http")
		expect(selection[0]?.apis?.[0]?.operations[0]?.path).toBe("/repos/{owner}/{repo}/actions/runs")
	})

	it("gives an event no API card", () => {
		const selection = selectConnectors(
			{
				text: "When a Stripe customer is created",
				tasks: [{ id: "start", name: "Customer created", type: "startEvent" }],
			},
			{ apis: [STRIPE] },
		)
		expect(selection.flatMap((t) => t.apis ?? [])).toEqual([])
	})
})
