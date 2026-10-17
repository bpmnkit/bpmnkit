import { describe, expect, it } from "vitest"
import { applyTemplates } from "../../src/connectors/index.js"
import { Bpmn } from "../../src/index.js"

/**
 * The template values the landing recipe (apps/landing/src/content/docs/guides/
 * executable-camunda-process.md) shows an agent. Keep these literals identical to the
 * recipe's snippets: an agent copies them verbatim, so they must apply with zero problems.
 */
describe("recipe template values", () => {
	const model = Bpmn.createProcess("recipe")
		.executable(true)
		.executionPlatformVersion("8.10.0")
		.startEvent("Start")
		.adHocSubProcess(
			"AI_Agent",
			(sub) => {
				sub.serviceTask("FetchSafeJoke", {
					name: "Get a safe joke",
					taskType: "io.camunda:http-json:1",
				})
			},
			{ name: "AI Agent" },
		)
		.endEvent("End")
		.build()

	it("HTTP JSON section applies with no problems", () => {
		const { problems } = applyTemplates(model, [
			{
				elementId: "FetchSafeJoke",
				template: "io.camunda.connectors.HttpJson.v2@18",
				values: {
					"authentication.type": "noAuth",
					method: "GET",
					url: "https://v2.jokeapi.dev/joke/Any?format=txt&safe-mode",
					resultExpression: "={toolCallResult: response.body}",
					retryCount: 3,
				},
			},
		])
		expect(problems).toEqual([])
	})

	it("AI Agent section applies with no problems", () => {
		const { problems } = applyTemplates(model, [
			{
				elementId: "AI_Agent",
				template: "io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1",
				values: {
					"provider.type": "openai",
					"provider.openai.backend.openai.apiKey": "=camunda.secrets.OPENAI_API_KEY",
					"provider.openai.model.model": "gpt-4o",
					"data.systemPrompt.prompt": "You are a helpful assistant.",
					"data.userPrompt.prompt": "=inputText",
					"data.limits.maxModelCalls": 10,
					resultVariable: "agent",
				},
			},
		])
		expect(problems).toEqual([])
	})
})
