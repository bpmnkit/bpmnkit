import { describe, expect, it } from "vitest"
import type { CompactDiagram, CompactElement } from "../src/bpmn/compact.js"
import { compactify, expand, isConnectorJobType } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/bpmn/index.js"
import type { XmlElement } from "../src/types/xml-element.js"

/**
 * A connector reads its configuration from input mappings and its result
 * variable from a task header. The compact form used to put the HTTP
 * connector's `url` and `method` in task headers and the result in an output
 * mapping, so a generated REST task deployed and then failed at runtime.
 */

function diagram(task: CompactElement): CompactDiagram {
	return {
		id: "Definitions_1",
		processes: [
			{
				id: "Process_1",
				elements: [{ id: "start", type: "startEvent" }, task, { id: "end", type: "endEvent" }],
				flows: [
					{ id: "f1", from: "start", to: task.id },
					{ id: "f2", from: task.id, to: "end" },
				],
			},
		],
	}
}

function taskOf(task: CompactElement) {
	const el = expand(diagram(task)).processes[0]?.flowElements.find((e) => e.id === task.id)
	if (!el) throw new Error(`no ${task.id}`)
	return el
}

function ext(extensions: XmlElement[], name: string): XmlElement | undefined {
	return extensions.find((e) => e.name === name)
}

function inputsOf(extensions: XmlElement[]): Record<string, string> {
	const out: Record<string, string> = {}
	for (const c of ext(extensions, "zeebe:ioMapping")?.children ?? []) {
		if (c.name === "zeebe:input") out[c.attributes.target ?? ""] = c.attributes.source ?? ""
	}
	return out
}

function headersOf(extensions: XmlElement[]): Record<string, string> {
	const out: Record<string, string> = {}
	for (const c of ext(extensions, "zeebe:taskHeaders")?.children ?? []) {
		out[c.attributes.key ?? ""] = c.attributes.value ?? ""
	}
	return out
}

describe("compact connectors", () => {
	it("moves HTTP connector settings written as task headers into input mappings", () => {
		const task = taskOf({
			id: "call",
			type: "serviceTask",
			jobType: "io.camunda:http-json:1",
			taskHeaders: { url: "https://api.example.com/orders", method: "GET", retryBackoff: "PT5S" },
		})

		expect(inputsOf(task.extensionElements)).toEqual({
			url: "https://api.example.com/orders",
			method: "GET",
			"authentication.type": "noAuth",
		})
		expect(headersOf(task.extensionElements)).toEqual({ retryBackoff: "PT5S" })
	})

	it("writes inputs as input mappings, keeping a given authentication", () => {
		const task = taskOf({
			id: "call",
			type: "serviceTask",
			jobType: "io.camunda:http-json:1",
			inputs: {
				url: "https://api.github.com/repos/o/r/issues",
				method: "POST",
				"authentication.type": "bearer",
				"authentication.token": "{{secrets.GITHUB_TOKEN}}",
				body: "={title: title}",
			},
		})

		expect(inputsOf(task.extensionElements)).toEqual({
			url: "https://api.github.com/repos/o/r/issues",
			method: "POST",
			"authentication.type": "bearer",
			"authentication.token": "{{secrets.GITHUB_TOKEN}}",
			body: "={title: title}",
		})
	})

	it("puts a connector's result variable in a task header, not an output mapping", () => {
		const task = taskOf({
			id: "call",
			type: "serviceTask",
			jobType: "io.camunda:http-json:1",
			inputs: { url: "https://api.example.com", method: "GET" },
			resultVariable: "order",
		})

		expect(headersOf(task.extensionElements)).toEqual({ resultVariable: "order" })
		const outputs = ext(task.extensionElements, "zeebe:ioMapping")?.children.filter(
			(c) => c.name === "zeebe:output",
		)
		expect(outputs).toEqual([])
	})

	it("keeps the output mapping for a plain job worker", () => {
		const task = taskOf({
			id: "work",
			type: "serviceTask",
			jobType: "charge-card",
			resultVariable: "payment",
		})

		expect(ext(task.extensionElements, "zeebe:ioMapping")?.children).toEqual([
			{
				name: "zeebe:output",
				attributes: { source: "= response", target: "payment" },
				children: [],
			},
		])
		expect(ext(task.extensionElements, "zeebe:taskHeaders")).toBeUndefined()
	})

	it("stamps an applied element template", () => {
		const task = taskOf({
			id: "post",
			type: "serviceTask",
			jobType: "io.camunda:slack:1",
			modelerTemplate: { id: "io.camunda.connectors.Slack.v1", version: 5 },
		})

		expect(task.unknownAttributes).toEqual({
			"zeebe:modelerTemplate": "io.camunda.connectors.Slack.v1",
			"zeebe:modelerTemplateVersion": "5",
		})
	})

	it("round-trips inputs, result variable and template through compactify", () => {
		const original: CompactElement = {
			id: "call",
			type: "serviceTask",
			jobType: "io.camunda:http-json:1",
			inputs: { "authentication.type": "noAuth", method: "GET", url: "https://x.example" },
			taskHeaders: { retryBackoff: "PT1S" },
			resultVariable: "out",
			modelerTemplate: { id: "io.camunda.connectors.HttpJson.v2", version: 1 },
		}
		const back = compactify(expand(diagram(original))).processes[0]?.elements.find(
			(e) => e.id === "call",
		)

		expect(back).toEqual(original)
	})

	it("keeps a builder REST connector's configuration through compactify and expand", () => {
		const built = Bpmn.createProcess("p")
			.startEvent("s")
			.restConnector("call", {
				method: "POST",
				url: "https://api.example.com",
				body: "={a: 1}",
				resultVariable: "res",
			})
			.endEvent("e")
			.build()
		const before = built.processes[0]?.flowElements.find((e) => e.id === "call")
		const after = expand(compactify(built)).processes[0]?.flowElements.find((e) => e.id === "call")

		expect(inputsOf(after?.extensionElements ?? [])).toEqual(
			inputsOf(before?.extensionElements ?? []),
		)
		expect(headersOf(after?.extensionElements ?? [])).toEqual({ resultVariable: "res" })
		expect(after?.unknownAttributes["zeebe:modelerTemplate"]).toBe(
			"io.camunda.connectors.HttpJson.v2",
		)
	})

	it("does not turn a connector's output mapping into a result variable", () => {
		const built = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("call", {
				taskType: "io.camunda:http-json:1",
				ioMapping: { outputs: [{ source: "=response.body.id", target: "orderId" }] },
			})
			.endEvent("e")
			.build()
		const call = compactify(built).processes[0]?.elements.find((e) => e.id === "call")

		expect(call?.resultVariable).toBeUndefined()
	})

	it("recognises connector job types", () => {
		expect(isConnectorJobType("io.camunda:http-json:1")).toBe(true)
		expect(isConnectorJobType("io.camunda.agenticai:aiagent:1")).toBe(true)
		expect(isConnectorJobType("io.camundafoo:x")).toBe(false)
		expect(isConnectorJobType("charge-card")).toBe(false)
	})
})
