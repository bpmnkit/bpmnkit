/**
 * `find_connectors` and `add_connector` on the real MCP server, over stdio.
 */
import { spawn } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Bpmn, expand, parseProcessText } from "@bpmnkit/core"
import { afterAll, describe, expect, it } from "vitest"

const SERVER = fileURLToPath(new URL("../src/mcp-server.ts", import.meta.url))
const dir = mkdtempSync(join(tmpdir(), "bpmnkit-mcp-connectors-"))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

/** Calls one tool on a fresh server reading `input`, if given; resolves with the result text. */
function callTool(
	name: string,
	args: Record<string, unknown>,
	files: { input?: string; output: string },
): Promise<{ text: string; isError: boolean }> {
	return new Promise((resolve, reject) => {
		const argv = [
			"--import",
			"tsx",
			SERVER,
			...(files.input ? ["--input", files.input] : []),
			"--output",
			files.output,
		]
		const proc = spawn(process.execPath, argv, { stdio: ["pipe", "pipe", "ignore"] })
		let out = ""
		proc.stdout.on("data", (c: Buffer) => {
			out += c.toString()
			const line = out.split("\n").find((l) => l.includes('"id":1'))
			if (!line) return
			const res = JSON.parse(line) as {
				result: { content: Array<{ text: string }>; isError: boolean }
			}
			proc.kill()
			resolve({ text: res.result.content[0]?.text ?? "", isError: res.result.isError })
		})
		proc.on("error", reject)
		proc.stdin.write(
			`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } })}\n`,
		)
	})
}

// Each call starts a fresh server under tsx: under a second here, past vitest's 5s default on a
// busy CI runner.
const SPAWN = { timeout: 30_000 }

function diagramFile(name: string): string {
	const path = join(dir, name)
	const defs = expand(
		parseProcessText(
			"start[start Order failed] > notify[service Notify ops in Slack] > done[end Done]",
		).diagram,
	)
	writeFileSync(path, Bpmn.export(defs))
	return path
}

describe("find_connectors", SPAWN, () => {
	it("answers with connector cards", async () => {
		const { text, isError } = await callTool(
			"find_connectors",
			{ query: "post a message to slack", limit: 2 },
			{ output: join(dir, "a.bpmn") },
		)
		expect(isError).toBe(false)
		expect(text).toMatch(/^slack chat\.postMessage — /m)
	})

	it("adds the endpoints of an indexed API the query names", async () => {
		const { text } = await callTool(
			"find_connectors",
			{ query: "create a stripe customer" },
			{ output: join(dir, "b.bpmn") },
		)
		expect(text).toContain("api stripe — Stripe API https://api.stripe.com auth=bearer")
		expect(text).toContain("POST /v1/customers — Create a customer")
	})

	it("leaves out connectors of other systems when the query names an indexed API", async () => {
		const { text } = await callTool(
			"find_connectors",
			{ query: "add a page to notion" },
			{ output: join(dir, "c.bpmn") },
		)
		expect(text).toContain("api notion — Notion API https://api.notion.com")
		expect(text).not.toContain("Automation Anywhere")
	})
})

describe("add_connector", SPAWN, () => {
	it("configures a task from a card, keeps credentials out, and says what is missing", async () => {
		const output = join(dir, "slack.bpmn")
		const { text } = await callTool(
			"add_connector",
			{
				processId: "Process_1",
				id: "notify",
				alias: "slack",
				operation: "chat.postMessage",
				values: { token: "xoxb-123", "data.channel": "#ops" },
			},
			{ input: diagramFile("in.bpmn"), output },
		)
		expect(text).toContain("Configured notify with io.camunda.connectors.Slack.v1.")
		expect(text).toMatch(/Fixed: .*secret SLACK_TOKEN/)
		expect(text).toMatch(/Still needed: .*Message/)
		const xml = readFileSync(output, "utf8")
		expect(xml).toContain('zeebe:modelerTemplate="io.camunda.connectors.Slack.v1"')
		expect(xml).toContain("{{secrets.SLACK_TOKEN}}")
		expect(xml).not.toContain("xoxb-123")
	})

	it("adds a missing node as a REST call to an indexed API", async () => {
		const output = join(dir, "stripe.bpmn")
		const { text } = await callTool(
			"add_connector",
			{
				processId: "Process_1",
				id: "customer",
				name: "Create customer",
				alias: "http",
				values: { method: "POST", url: "/v1/customers", api: "stripe" },
			},
			{ input: diagramFile("in2.bpmn"), output },
		)
		expect(text).toContain("Configured customer with io.camunda.connectors.HttpJson.v2.")
		const xml = readFileSync(output, "utf8")
		expect(xml).toContain('source="https://api.stripe.com/v1/customers"')
		expect(xml).toContain('name="Create customer"')
	})
})
