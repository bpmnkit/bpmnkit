import { expand } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import "../src/testing/vitest.js"
import { createProcessTest } from "../src/testing/index.js"

/**
 * A REST call written the way earlier prompts taught — `url` and `method` as
 * task headers, the result as `resultVariable` — must reach the connector as
 * input variables and land in the result variable, as the Camunda connector
 * runtime does it.
 */
describe("compact HTTP connector task", () => {
	it("runs with its inputs and maps the response into the result variable", async () => {
		const definitions = expand({
			id: "Definitions_1",
			processes: [
				{
					id: "fetch-order",
					elements: [
						{ id: "start", type: "startEvent" },
						{
							id: "call",
							type: "serviceTask",
							jobType: "io.camunda:http-json:1",
							taskHeaders: { url: "https://api.example.com/orders/1", method: "GET" },
							resultVariable: "order",
						},
						{ id: "end", type: "endEvent" },
					],
					flows: [
						{ id: "f1", from: "start", to: "call" },
						{ id: "f2", from: "call", to: "end" },
					],
				},
			],
		})
		const t = await createProcessTest({ bpmn: definitions })
		const response = { status: 200, body: { id: 1 } }
		const http = t.mockConnector("io.camunda:http-json:1", { response })

		const run = await t.start("fetch-order")

		expect(run).toHaveCompleted()
		expect(run).toHaveVariables({ order: response })
		expect(http.calls[0]?.variables).toMatchObject({
			url: "https://api.example.com/orders/1",
			method: "GET",
			"authentication.type": "noAuth",
		})
		t.dispose()
	})
})
