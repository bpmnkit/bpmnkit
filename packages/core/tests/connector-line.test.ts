import { describe, expect, it } from "vitest"
import { parseConnectorLine } from "../src/bpmn/connector-line.js"
import { parseProcessDelta } from "../src/bpmn/process-delta.js"
import { writeProcessText } from "../src/bpmn/process-text-writer.js"
import { parseProcessText } from "../src/bpmn/process-text.js"
import { Bpmn, expand } from "../src/index.js"
import type { ProcessTextProblem } from "../src/index.js"

function parse(text: string) {
	const problems: ProcessTextProblem[] = []
	return { line: parseConnectorLine(text, 1, problems), problems }
}

describe("parseConnectorLine", () => {
	it("reads the node, alias, operation and inputs", () => {
		const { line, problems } = parse(
			'with post: Slack chat.postMessage | data.channel=#ops | data.text== "Order " + orderId',
		)
		expect(problems).toEqual([])
		expect(line).toEqual({
			id: "post",
			alias: "slack",
			args: ["chat.postMessage"],
			values: { "data.channel": "#ops", "data.text": '= "Order " + orderId' },
			line: 1,
		})
	})

	it("keeps a | inside quotes, brackets or braces as part of the value", () => {
		const { line } = parse('with a: http | body=={x: "a|b", y: [1|2]} | headers=="p|q"')
		expect(line?.values).toEqual({ body: '={x: "a|b", y: [1|2]}', headers: '="p|q"' })
	})

	it("keeps a head word starting with = or a quote to the end of the head", () => {
		const { line } = parse('with f: http GET ="https://x.example/" + id | result=r')
		expect(line?.args).toEqual(["GET", '="https://x.example/" + id'])
	})

	it("reports parts it cannot read and keeps the rest", () => {
		const { line, problems } = parse("with a: http | url=https://x.example | nonsense")
		expect(line?.values).toEqual({ url: "https://x.example" })
		expect(problems.map((p) => p.message)).toEqual(['expected "key=value" at "nonsense"; ignored'])
	})

	it("splits inputs written in one part, as the cards list them, and drops a copied *", () => {
		const { line, problems } = parse(
			'with r: lambda | accessKey*={{secrets.AWS_KEY}} region=us-east-1 payload=={id: id, note: "a b=c"}',
		)
		expect(problems).toEqual([])
		expect(line?.values).toEqual({
			accessKey: "{{secrets.AWS_KEY}}",
			region: "us-east-1",
			payload: '={id: id, note: "a b=c"}',
		})
	})

	it("never splits a FEEL value", () => {
		const { line } = parse("with a: http | body== x = 1 and y=2")
		expect(line?.values).toEqual({ body: "= x = 1 and y=2" })
	})

	it("is not a with line without the id and colon", () => {
		expect(parse("with the team > notify").line).toBeUndefined()
	})
})

describe("with lines in the line format", () => {
	const text = `# Notify
start[start Order failed] > notify[service Notify ops] > done[end Ops notified]
with notify: slack chat.postMessage | data.channel=#ops
with ghost: slack chat.postMessage`

	it("are collected with the element they configure, and change nothing else", () => {
		const parsed = parseProcessText(text)
		expect(parsed.connectors.map((c) => [c.id, c.elementId, c.alias])).toEqual([
			["notify", "notify", "slack"],
		])
		expect(parsed.problems.map((p) => p.message)).toEqual([
			'"with ghost:" names no node of the diagram; ignored',
		])
		const plain = parseProcessText(text.split("\n").slice(0, 2).join("\n"))
		expect(parsed.diagram).toEqual(plain.diagram)
	})

	it("are read by the change script too", () => {
		const delta = parseProcessDelta(
			"notify[service Notify ops]\nwith notify: slack chat.postMessage",
		)
		expect(delta.problems).toEqual([])
		expect(delta.connectors.map((c) => c.id)).toEqual(["notify"])
	})
})

describe("writeProcessText connectorLine", () => {
	it("writes a with line for each element the callback describes, under its written id", () => {
		const definitions = expand(
			parseProcessText("start[start Go] > Activity_0x9k2lm[service Notify ops] > done[end Done]")
				.diagram,
		)
		const { text } = writeProcessText(definitions, {
			connectorLine: (el) => (el.type === "serviceTask" ? "slack chat.postMessage" : undefined),
		})
		expect(text.split("\n").at(-1)).toBe("with notify_ops: slack chat.postMessage")
		expect(writeProcessText(definitions).text).not.toContain("with ")
		expect(Bpmn.export(definitions)).toContain("Activity_0x9k2lm")
	})
})
