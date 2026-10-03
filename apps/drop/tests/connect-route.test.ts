/**
 * `POST /drop/api/connect`: the gates, the cards it picks, the stream it
 * answers with, and the connected diagram it applies on the server.
 */
import { Bpmn, expand, parseProcessText } from "@bpmnkit/core"
import { connectorCards } from "@bpmnkit/core/connectors"
import { beforeEach, describe, expect, it } from "vitest"
import type { Env } from "../src/env.js"
import { getBudgetSpent } from "../src/lib/ai.js"
import {
	CONNECT_SYSTEM_PROMPT,
	type ConnectEvent,
	type ConnectResult,
	createConnectLineFilter,
	finishConnect,
} from "../src/lib/connect.js"
import { sharePage } from "../src/lib/pages.js"
import { handleConnect } from "../src/routes/connect.js"
import worker from "../src/worker.js"
import { migratedDb } from "./d1.js"

const NOW = 1_800_000_000_000
const DAY = new Date(NOW).toISOString().slice(0, 10)
const MODEL = "@cf/zai-org/glm-4.7-flash"
const CODE = "sesame"
const USAGE = { prompt_tokens: 1200, completion_tokens: 60 }

const DRAFT = Bpmn.export(
	expand(
		parseProcessText(`# Order failures
start[start Order failed] > log[service Record failure] > notify[service Notify ops in Slack] > done[end Ops notified]`)
			.diagram,
	),
)
const NO_INTEGRATION = Bpmn.export(
	expand(
		parseProcessText(
			"start[start Expense submitted] > review[user Review expense] > done[end Done]",
		).diagram,
	),
)

/** A Workers AI binding that streams `chunks` in the chat-completion shape. */
function fakeAi(chunks: string[], options: { fail?: boolean } = {}) {
	const calls: { model: string; inputs: Record<string, unknown>; options: unknown }[] = []
	return {
		calls,
		async run(model: string, inputs: Record<string, unknown>, opts: unknown) {
			calls.push({ model, inputs, options: opts })
			const encoder = new TextEncoder()
			return new ReadableStream<Uint8Array>({
				async start(controller) {
					const send = (o: unknown) =>
						controller.enqueue(encoder.encode(`data: ${JSON.stringify(o)}\n\n`))
					for (const content of chunks) send({ choices: [{ delta: { content } }] })
					if (options.fail) {
						await new Promise((resolve) => setTimeout(resolve, 5))
						controller.error(new Error("upstream reset"))
						return
					}
					send({ choices: [{ delta: {} }], usage: USAGE })
					controller.enqueue(encoder.encode("data: [DONE]\n\n"))
					controller.close()
				},
			})
		},
	}
}

let db: D1Database
beforeEach(() => {
	db = migratedDb()
})

function makeEnv(ai: ReturnType<typeof fakeAi>, over: Partial<Env> = {}): Env {
	return {
		AI: ai,
		AI_PASSCODE: CODE,
		AI_CONNECT_MODEL: MODEL,
		AI_DAILY_BUDGET: "8000",
		DB: db,
		...over,
	} as unknown as Env
}

const post = (body: unknown, code = CODE) =>
	new Request("http://drop/drop/api/connect", {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Drop-AI-Code": code },
		body: JSON.stringify(body),
	})

async function events(res: Response): Promise<ConnectEvent[]> {
	return (await res.text())
		.split("\n\n")
		.filter((block) => block.startsWith("data: "))
		.map((block) => JSON.parse(block.slice(6)) as ConnectEvent)
}

function resultOf(evs: ConnectEvent[]): ConnectResult | undefined {
	for (const e of evs) if ("result" in e) return e.result
	return undefined
}

const ANSWER = [
	"Here you go:\n",
	"with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops",
	' | data.text== "Order failed"\n',
	"with log: something else\n",
]

describe("POST /drop/api/connect", () => {
	it("is off without a connect model or a passcode, and checks the code", async () => {
		const ai = fakeAi(ANSWER)
		expect(
			(await handleConnect(post({ xml: DRAFT }), makeEnv(ai, { AI_CONNECT_MODEL: undefined }), NOW))
				.status,
		).toBe(404)
		expect(
			(await handleConnect(post({ xml: DRAFT }), makeEnv(ai, { AI_PASSCODE: undefined }), NOW))
				.status,
		).toBe(404)
		expect((await handleConnect(post({ xml: DRAFT }, "wrong"), makeEnv(ai), NOW)).status).toBe(401)
		expect(ai.calls).toHaveLength(0)
	})

	it("rejects a body without a diagram, or one it cannot read", async () => {
		const env = makeEnv(fakeAi(ANSWER))
		expect((await handleConnect(post({}), env, NOW)).status).toBe(400)
		expect((await handleConnect(post({ xml: "<nope" }), env, NOW)).status).toBe(400)
		expect(
			(await handleConnect(post({ xml: DRAFT, request: "x".repeat(2001) }), env, NOW)).status,
		).toBe(400)
	})

	it("asks the model with the cards it picked, and streams only with lines", async () => {
		const ai = fakeAi(ANSWER)
		const evs = await events(
			await handleConnect(post({ xml: DRAFT, request: "Tell ops in Slack" }), makeEnv(ai), NOW),
		)
		const [call] = ai.calls
		const messages = call?.inputs.messages as { role: string; content: string }[]
		expect(messages[0]?.content).toBe(CONNECT_SYSTEM_PROMPT)
		expect(messages[1]?.content).toContain("Diagram:\n# Order failures")
		expect(messages[1]?.content).toMatch(
			/Connectors per task:\nnotify \(Notify ops in Slack\):\nslack chat\.postMessage/,
		)
		expect(messages[1]?.content).toContain("Request:\nTell ops in Slack")

		expect(evs[0]).toEqual({ aliases: expect.objectContaining({ notify: "notify" }) })
		const text = evs.map((e) => ("text" in e ? e.text : "")).join("")
		expect(
			text
				.split("\n")
				.filter(Boolean)
				.every((l) => l.startsWith("with ")),
		).toBe(true)
		expect(evs.at(-1)).toEqual({ done: true, cached: false })
	})

	it("applies the lines on the server and reports what it could not use", async () => {
		const evs = await events(
			await handleConnect(post({ xml: DRAFT }), makeEnv(fakeAi(ANSWER)), NOW),
		)
		const result = resultOf(evs)
		expect(result?.connected).toEqual(["notify"])
		expect(result?.problems).toEqual(['no connector is called "something"'])
		const notify = Bpmn.parse(result?.xml ?? "").processes[0]?.flowElements.find(
			(el) => el.id === "notify",
		)
		expect(notify?.unknownAttributes["zeebe:modelerTemplate"]).toBe(
			"io.camunda.connectors.Slack.v1",
		)
	})

	it("skips the model when no task matches a connector", async () => {
		const ai = fakeAi(ANSWER)
		const evs = await events(await handleConnect(post({ xml: NO_INTEGRATION }), makeEnv(ai), NOW))
		expect(ai.calls).toHaveLength(0)
		expect(evs.at(-1)).toEqual({ done: true, cached: false, skipped: true })
		expect(await getBudgetSpent(db, DAY)).toBe(0)
	})

	it("charges the budget, and replays a cached answer without asking again", async () => {
		const ai = fakeAi(ANSWER)
		const env = makeEnv(ai)
		await events(await handleConnect(post({ xml: DRAFT }), env, NOW))
		expect(await getBudgetSpent(db, DAY)).toBeGreaterThan(0)
		const again = await events(await handleConnect(post({ xml: DRAFT }), env, NOW))
		expect(ai.calls).toHaveLength(1)
		expect(resultOf(again)?.connected).toEqual(["notify"])
		expect(again.at(-1)).toEqual({ done: true, cached: true })
	})

	it("reports a model that fails part way", async () => {
		const evs = await events(
			await handleConnect(post({ xml: DRAFT }), makeEnv(fakeAi(ANSWER, { fail: true })), NOW),
		)
		expect(resultOf(evs)).toBeUndefined()
		expect(evs.at(-1)).toEqual({ error: "The AI stopped part way. Please try again." })
	})

	it("applies lines the reader finished, without asking a model", async () => {
		const ai = fakeAi(ANSWER)
		const evs = await events(
			await handleConnect(
				post({
					xml: DRAFT,
					lines: "with notify: slack chat.postMessage | data.channel=#ops\nstart > nowhere",
				}),
				makeEnv(ai),
				NOW,
			),
		)
		expect(ai.calls).toHaveLength(0)
		expect(resultOf(evs)?.connected).toEqual(["notify"])
		expect(resultOf(evs)?.questions.map((q) => q.draft)).toEqual([
			"with notify: slack chat.postMessage | token=",
			"with notify: slack chat.postMessage | data.text=",
		])
		expect(await getBudgetSpent(db, DAY)).toBe(0)
	})

	it("shows the API index's endpoints for a system without a connector, and completes the call", async () => {
		const signup = Bpmn.export(
			expand(
				parseProcessText(
					"start[start Signed up] > customer[service Create Stripe customer] > done[end Done]",
				).diagram,
			),
		)
		const ai = fakeAi([
			"with customer: http POST /v1/customers | api=stripe | body=={email: email}\n",
		])
		const evs = await events(
			await handleConnect(post({ xml: signup, request: "Bill new users" }), makeEnv(ai), NOW),
		)
		const messages = ai.calls[0]?.inputs.messages as { role: string; content: string }[]
		expect(messages[1]?.content).toContain(
			"api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN\nPOST /v1/customers — Create a customer",
		)
		const result = resultOf(evs)
		expect(result?.connected).toEqual(["customer"])
		expect(result?.questions).toEqual([])
		expect(result?.xml).toContain('source="https://api.stripe.com/v1/customers"')
		expect(result?.xml).toContain('source="{{secrets.STRIPE_TOKEN}}"')
	})

	it("is routed by the worker, POST only", async () => {
		const env = makeEnv(fakeAi(ANSWER))
		const get = await worker.fetch(new Request("http://drop/drop/api/connect"), env)
		expect(get.status).toBe(405)
	})
})

describe("the share page", () => {
	it("offers Add connectors only when the connect pass is on", () => {
		const page = (aiConnect: boolean) =>
			sharePage(
				"share1",
				{ created_at: NOW, expires_at: NOW + 1, view_count: 0 } as never,
				[],
				true,
				undefined,
				false,
				aiConnect,
			)
		expect(page(true)).toContain('id="aiConnectBtn"')
		expect(page(true)).toContain('"aiConnect":true')
		expect(page(false)).not.toContain('id="aiConnectBtn"')
	})
})

describe("createConnectLineFilter", () => {
	it("passes on only with lines, across chunk boundaries", () => {
		const filter = createConnectLineFilter()
		const out =
			filter.push("Sure!\nwith a: slack | x=1\n```\nwi") +
			filter.push("th b: http https://x.example\nstart > a\n") +
			filter.end()
		expect(out).toBe("with a: slack | x=1\nwith b: http https://x.example\n")
	})

	it("reads a line naming its node by label, or without the colon after its id", () => {
		const filter = createConnectLineFilter()
		const out =
			filter.push(
				"with start Ticket closed: http POST /v1/pages | api=notion\nwith create http POST /v1/pages | api=notion\nwith create http POST https://x.example/a | x=1\n",
			) + filter.end()
		expect(out).toBe(
			"with start_Ticket_closed: http POST /v1/pages | api=notion\nwith create: http POST /v1/pages | api=notion\nwith create: http POST https://x.example/a | x=1\n",
		)
	})

	it("reads a line naming a flow, a > b:, as one for its last node", () => {
		const filter = createConnectLineFilter()
		const out =
			filter.push(
				"start > summarize: openai chat | x=1\nwith start>task: http POST /v1/pages | api=notion\ncheck >(Yes: ok) b\n",
			) + filter.end()
		expect(out).toBe(
			"with summarize: openai chat | x=1\nwith task: http POST /v1/pages | api=notion\n",
		)
	})

	it("gives a with line written without its first word that word back", () => {
		const filter = createConnectLineFilter()
		const out =
			filter.push("notify: slack chat.postMessage | data.channel=#ops\nNote: this is it\n") +
			filter.end()
		expect(out).toBe("with notify: slack chat.postMessage | data.channel=#ops\n")
	})
})

describe("finishConnect", () => {
	const defs = expand(
		parseProcessText(
			"start[start Ticket closed] > create[service Create page] > notify[service Notify ops in Slack] > done[end Done]",
		).diagram,
	)
	const aliases = { start: "start", create: "create", notify: "notify", done: "done" }
	const SLACK =
		"slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text=hi"

	it("matches an id in any case", () => {
		const result = finishConnect(defs, aliases, `with Notify: ${SLACK}`)
		expect(result.connected).toEqual(["notify"])
		expect(result.problems).toEqual([])
	})

	it("gives a line with an invented id to the one task its connector fits", () => {
		const http = connectorCards("io.camunda.connectors.HttpJson.v2")
		const slack = connectorCards("io.camunda.connectors.Slack.v1")
		const selection = [
			{ id: "create", name: "Create page", cards: http },
			{ id: "notify", name: "Notify ops in Slack", cards: slack },
		]
		const result = finishConnect(
			defs,
			aliases,
			"with createPage: http POST https://api.example.com/pages",
			[],
			selection,
		)
		expect(result.connected).toEqual(["create"])
		expect(result.fixes[0]).toBe(
			'read "with createPage:" as "with create:", the task its connector fits',
		)
	})

	it("moves a line off a node no card was offered for, to the task its connector fits", () => {
		const slack = connectorCards("io.camunda.connectors.Slack.v1")
		const result = finishConnect(
			defs,
			aliases,
			`with start: ${SLACK}`,
			[],
			[{ id: "notify", name: "Notify ops in Slack", cards: slack }],
		)
		expect(result.connected).toEqual(["notify"])
		expect(result.xml).not.toMatch(/<bpmn:startEvent[^>]*modelerTemplate/)
	})

	it("of several tasks a connector fits, takes the one whose name shares the line's words", () => {
		const twoCalls = expand(
			parseProcessText(
				"a[start Order received] > b[service Lookup shipping address] > c[service Ship order] > d[end Done]",
			).diagram,
		)
		const http = connectorCards("io.camunda.connectors.HttpJson.v2")
		const result = finishConnect(
			twoCalls,
			{ a: "a", b: "b", c: "c", d: "d" },
			"with lookup: http GET https://api.example.com/address\nwith ship: http POST https://api.example.com/ship",
			[],
			[
				{ id: "b", name: "Lookup shipping address", cards: http },
				{ id: "c", name: "Ship order", cards: http },
			],
		)
		expect(result.connected).toEqual(["b", "c"])
		expect(result.problems).toEqual([])
	})

	it("of two lines for a node, keeps the one with a connector offered for it", () => {
		const http = connectorCards("io.camunda.connectors.HttpJson.v2")
		const result = finishConnect(
			defs,
			aliases,
			`with create: ${SLACK}\nwith create: http POST https://api.example.com/pages`,
			[],
			[{ id: "create", name: "Create page", cards: http }],
		)
		expect(result.xml).toMatch(
			/id="create"[^>]*modelerTemplate="io.camunda.connectors.HttpJson.v2"|modelerTemplate="io.camunda.connectors.HttpJson.v2"[^>]*id="create"/,
		)
	})

	it("reads a line that copied the node's kind and name as the node's first card", () => {
		const slack = connectorCards("io.camunda.connectors.Slack.v1")
		const result = finishConnect(
			defs,
			aliases,
			"with notify: service Notify ops in Slack | token={{secrets.SLACK_TOKEN}} data.channel=#ops data.text=hi",
			[],
			[{ id: "notify", name: "Notify ops in Slack", cards: slack }],
		)
		expect(result.connected).toEqual(["notify"])
		expect(result.fixes[0]).toBe(`read "service …" on notify as "${slack[0]?.alias}"`)
	})

	it("keeps the first line for a node and reports the next", () => {
		const result = finishConnect(
			defs,
			aliases,
			`with notify: ${SLACK}\nwith notify: http GET https://api.example.com/x`,
		)
		expect(result.problems).toEqual([
			'"with notify:" configures a node an earlier line did; the first stands',
		])
		expect(result.xml).toContain('zeebe:modelerTemplate="io.camunda.connectors.Slack.v1"')
	})
})
