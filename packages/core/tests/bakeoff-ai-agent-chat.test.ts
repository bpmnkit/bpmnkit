import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { BpmnDefinitions, BpmnFlowElement, XmlElement } from "../src/index.js"
import { Bpmn, lintDiagram } from "../src/index.js"
import type { Bounds } from "../src/layout/types.js"
import { buildAiAgentChat } from "./fixtures/bakeoff/build.js"

const EXPECTED_BPMN = new URL("./fixtures/bakeoff/expected.bpmn", import.meta.url)

const AGENT_TEMPLATE = "io.camunda.connectors.agenticai.ai-agent-subprocess.v2"
const HTTP_TEMPLATE = "io.camunda.connectors.HttpJson.v2"
const TOOLS = [
	"LookupSampleUsers",
	"SearchRecipes",
	"FetchSafeJoke",
	"ListSampleTechnologyProducts",
]

// Copied from spec.md, not from build.ts, so a typo in the builder cannot pass.
const SYSTEM_PROMPT_PARAGRAPHS = [
	"You are **TaskAgent**, a helpful, generic chat agent that can handle a wide variety of customer requests using your own domain knowledge **and** any tools explicitly provided to you at runtime.",
	"If tools are provided, you should prefer them instead of guessing an answer. You can call the same tool multiple times by providing different input values. Don't guess any tools which were not explicitly configured. If no tool matches the request, try to generate an answer. If you're not able to find a good answer, return with a message stating why you're not able to.",
]
const TOOL_DOCUMENTATION = [
	"Lists available users. Use this tool to look up names, usernames, or IDs. Do not use it for details not returned by the service. Input: none. Returns: an array of user objects containing id, name, and username.",
	'Searches the recipe catalog. Use this tool when a request asks for a recipe, dish, cuisine, or cooking instructions. Do not use it for unrelated food facts or guaranteed dietary safety. Input: searchQuery describing the desired dish or cuisine. Returns: matching recipe objects, or "No result found."',
	"Fetches one random safe-mode joke. Use this tool when the user asks for a joke or humorous response. Do not use it when the request requires a specific factual answer or a particular joke topic. Input: none. Returns: the joke as plain text.",
	"Lists technology products. Use this tool when a request asks which devices or technology products are available or needs their attributes. Do not use it for live inventory, pricing, or purchasing. Input: none. Returns: an array of product objects with identifiers, names, and available attribute data.",
]

// Facts are read from the exported XML parsed back, so they hold for the file a user gets.
const xml = Bpmn.export(buildAiAgentChat())
const defs: BpmnDefinitions = Bpmn.parse(xml)
const process = defs.processes[0]
if (!process) throw new Error("no process")

function element(id: string): BpmnFlowElement {
	const all = process?.flowElements.flatMap((e) => [
		e,
		...("flowElements" in e ? e.flowElements : []),
	])
	const found = all?.find((e) => e.id === id)
	if (!found) throw new Error(`no element ${id}`)
	return found
}

function extension(id: string, name: string): XmlElement | undefined {
	return element(id).extensionElements.find((x) => x.name === name)
}

function input(id: string, target: string): string | undefined {
	return extension(id, "zeebe:ioMapping")?.children.find(
		(c) => c.name === "zeebe:input" && c.attributes.target === target,
	)?.attributes.source
}

function header(id: string, key: string): string | undefined {
	return extension(id, "zeebe:taskHeaders")?.children.find((c) => c.attributes.key === key)
		?.attributes.value
}

function bounds(id: string): Bounds {
	const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

describe("bake-off: AI Agent Chat With Tools (fixtures/bakeoff/spec.md)", () => {
	it("is executable on Camunda 8.10.0", () => {
		expect(process.id).toBe("ai-agent-chat-with-tools")
		expect(process.name).toBe("AI Agent Chat With Tools")
		expect(process.isExecutable).toBe(true)
		expect(defs.unknownAttributes["modeler:executionPlatform"]).toBe("Camunda Cloud")
		expect(defs.unknownAttributes["modeler:executionPlatformVersion"]).toBe("8.10.0")
	})

	it("has every element the spec names, with its type and name", () => {
		const expected: Array<[string, string, string | undefined]> = [
			["StartEvent_TaskReceived", "startEvent", "Task to perform received"],
			["Gateway_RunAgent", "exclusiveGateway", undefined],
			["AI_Agent", "adHocSubProcess", "AI Agent"],
			["UserTask_ReviewAgentResponse", "userTask", "User Feedback"],
			["Gateway_UserSatisfied", "exclusiveGateway", "User satisfied?"],
			["EndEvent_UserSatisfied", "endEvent", "User satisfied"],
			["LookupSampleUsers", "serviceTask", "Find sample users"],
			["SearchRecipes", "serviceTask", "Search recipes"],
			["FetchSafeJoke", "serviceTask", "Get a safe joke"],
			["ListSampleTechnologyProducts", "serviceTask", "List sample technology products"],
		]
		for (const [id, type, name] of expected) {
			expect(element(id).type, id).toBe(type)
			expect(element(id).name, id).toBe(name)
		}
		const agent = element("AI_Agent")
		expect("flowElements" in agent && agent.flowElements.map((e) => e.id)).toEqual(TOOLS)
		expect("sequenceFlows" in agent && agent.sequenceFlows).toEqual([])
	})

	it("wires the start form, the feedback form and the responseText input", () => {
		expect(extension("StartEvent_TaskReceived", "zeebe:formDefinition")?.attributes.formId).toBe(
			"ai-agent-chat-initial-request",
		)
		expect(extension("UserTask_ReviewAgentResponse", "zeebe:userTask")).toBeDefined()
		expect(
			extension("UserTask_ReviewAgentResponse", "zeebe:formDefinition")?.attributes.formId,
		).toBe("ai-agent-chat-user-feedback")
		expect(input("UserTask_ReviewAgentResponse", "responseText")).toBe("=agent.responseText")
	})

	it("routes Yes to the end and No back to Gateway_RunAgent", () => {
		const out = process.sequenceFlows.filter((f) => f.sourceRef === "Gateway_UserSatisfied")
		expect(out.map((f) => [f.id, f.name, f.targetRef, f.conditionExpression?.text])).toEqual([
			["Flow_Yes", "Yes", "EndEvent_UserSatisfied", "=userSatisfied"],
			["Flow_No", "No", "Gateway_RunAgent", "=userSatisfied = null or userSatisfied = false"],
		])
		const path = (from: string) =>
			process.sequenceFlows.find((f) => f.sourceRef === from)?.targetRef
		expect(path("StartEvent_TaskReceived")).toBe("Gateway_RunAgent")
		expect(path("Gateway_RunAgent")).toBe("AI_Agent")
		expect(path("AI_Agent")).toBe("UserTask_ReviewAgentResponse")
		expect(path("UserTask_ReviewAgentResponse")).toBe("Gateway_UserSatisfied")
	})

	it("stamps the template ids and versions", () => {
		expect(element("AI_Agent").unknownAttributes["zeebe:modelerTemplate"]).toBe(AGENT_TEMPLATE)
		expect(element("AI_Agent").unknownAttributes["zeebe:modelerTemplateVersion"]).toBe("1")
		for (const id of TOOLS) {
			expect(element(id).unknownAttributes["zeebe:modelerTemplate"], id).toBe(HTTP_TEMPLATE)
			expect(element(id).unknownAttributes["zeebe:modelerTemplateVersion"], id).toBe("18")
		}
	})

	it("configures the agent as the spec lists", () => {
		const prompt = input("AI_Agent", "data.systemPrompt.prompt")
		expect(prompt).toBe(`="${SYSTEM_PROMPT_PARAGRAPHS.join("\n\n")}"`)
		const expected: Record<string, string> = {
			"provider.type": "openai",
			"provider.openai.api.type": "responses",
			"provider.openai.backend.type": "custom",
			"provider.openai.backend.custom.endpoint":
				"=camunda.secrets.CAMUNDA_PROVIDED_LLM_API_ENDPOINT",
			"provider.openai.backend.custom.authentication.type": "apiKey",
			"provider.openai.backend.custom.authentication.apiKey":
				"=camunda.secrets.CAMUNDA_PROVIDED_LLM_API_KEY",
			"provider.openai.model.model": "=camunda.secrets.CAMUNDA_PROVIDED_LLM_DEFAULT_MODEL",
			"data.userPrompt.prompt": "=if is defined(followUpInput) then followUpInput else inputText",
			"data.userPrompt.documents":
				"=if is defined(followUpInput) or is defined(followUpDocuments) then followUpDocuments else inputDocuments",
			agentContext: "=agent.context",
			"data.memory.storage.type": "in-process",
			"data.memory.contextWindowSize": "20",
			"data.limits.maxModelCalls": "10",
			"data.events.behavior": "WAIT_FOR_TOOL_CALL_RESULTS",
			"data.response.format.type": "text",
			"data.response.format.parseJson": "false",
			"data.response.includeAssistantMessage": "false",
			"data.response.includeAgentContext": "true",
		}
		for (const [target, source] of Object.entries(expected)) {
			expect(input("AI_Agent", target), target).toBe(source)
		}
		const output = extension("AI_Agent", "zeebe:ioMapping")?.children.find(
			(c) => c.name === "zeebe:output",
		)
		expect(output?.attributes).toEqual({ source: "=agent", target: "agent" })
	})

	it("configures each tool as a GET with no authentication and its own URL and result", () => {
		const urls = [
			"https://jsonplaceholder.typicode.com/users",
			"https://dummyjson.com/recipes/search",
			"https://v2.jokeapi.dev/joke/Any?format=txt&safe-mode",
			"https://api.restful-api.dev/objects",
		]
		TOOLS.forEach((id, i) => {
			expect(input(id, "authentication.type"), id).toBe("noAuth")
			expect(input(id, "method"), id).toBe("GET")
			expect(input(id, "url"), id).toBe(urls[i])
			expect(input(id, "connectionTimeoutInSeconds"), id).toBe("20")
			expect(input(id, "readTimeoutInSeconds"), id).toBe("20")
			expect(header(id, "resultExpression"), id).toMatch(/^=\{toolCallResult: /)
			expect(element(id).documentation, id).toBe(TOOL_DOCUMENTATION[i])
			// HttpJson v18 offers ignoreNullValues only for POST, PUT and PATCH.
			expect(input(id, "ignoreNullValues"), id).toBeUndefined()
		})
		expect(header("LookupSampleUsers", "resultExpression")).toBe(
			"={toolCallResult: for user in response.body return {id: user.id, name: user.name, username: user.username}}",
		)
		expect(input("SearchRecipes", "queryParameters")).toBe(
			'={q: fromAi(toolCall.searchQuery, "The query describing which recipe to search (e.g. a specific dish or the cuisine).")}',
		)
		expect(header("SearchRecipes", "resultExpression")).toBe(
			'={toolCallResult: if count(response.body.recipes) > 0 then response.body.recipes else "No result found."}',
		)
		expect(header("FetchSafeJoke", "resultExpression")).toBe("={toolCallResult: response.body}")
		expect(header("ListSampleTechnologyProducts", "resultExpression")).toBe(
			"={toolCallResult: response.body}",
		)
	})

	it("sets retries 3 and retry backoff PT0S on all five templated elements", () => {
		for (const id of ["AI_Agent", ...TOOLS]) {
			expect(extension(id, "zeebe:taskDefinition")?.attributes.retries, id).toBe("3")
			expect(header(id, "retryBackoff"), id).toBe("PT0S")
		}
	})

	it("attaches the three annotations to the right elements", () => {
		const attached = process.associations.map((a) => [
			a.sourceRef,
			process.textAnnotations.find((t) => t.id === a.targetRef)?.text,
		])
		expect(attached).toEqual([
			[
				"StartEvent_TaskReceived",
				"Triggered when a user submits a task for the AI agent to perform. The agent uses available tools to complete the task, and the process ends once the user confirms they are satisfied.",
			],
			["AI_Agent", "This is your agent running certain tasks to reach the goal it was given"],
			[
				"FetchSafeJoke",
				"Each task you add represents a capability your agent will have. You can add new tasks and the agent will know what it's good for based on its documentation.",
			],
		])
	})

	it("lays the tools out 2 x 2: users and recipes left, joke and products right", () => {
		const [users, recipes, joke, products] = TOOLS.map(bounds) as [Bounds, Bounds, Bounds, Bounds]
		expect(users.x).toBe(recipes.x)
		expect(joke.x).toBe(products.x)
		expect(users.x).toBeLessThan(joke.x)
		expect(users.y).toBe(joke.y)
		expect(recipes.y).toBe(products.y)
		expect(users.y).toBeLessThan(recipes.y)
	})

	it("places the start note above its event and the tool note right of the agent, below the user task", () => {
		const start = bounds("StartEvent_TaskReceived")
		const startNote = bounds("TextAnnotation_StartEvent_TaskReceived_1")
		expect(startNote.y + startNote.height).toBeLessThanOrEqual(start.y)
		const agent = bounds("AI_Agent")
		const userTask = bounds("UserTask_ReviewAgentResponse")
		const toolNote = bounds("TextAnnotation_FetchSafeJoke_1")
		expect(toolNote.x).toBeGreaterThanOrEqual(agent.x + agent.width)
		expect(toolNote.y).toBeGreaterThanOrEqual(userTask.y + userTask.height)
	})

	it("has no lint errors under the engine rules beyond two advisory patterns", () => {
		const errors = lintDiagram(defs, { forceEngineRules: true }).diagnostics.filter(
			(d) => d.severity === "error",
		)
		// The spec, like Camunda's own blueprint, has neither a default flow on the
		// Yes/No gateway nor an error boundary on the agent; the pattern rules call
		// both errors. Pinned here so any other error fails the test.
		expect(errors.map((d) => [d.id, d.elementIds])).toEqual([
			["pattern/gateway-no-default-flow", ["Gateway_UserSatisfied"]],
			["pattern/subprocess-no-error-boundary", ["AI_Agent"]],
		])
	})

	it("exports exactly fixtures/bakeoff/expected.bpmn", () => {
		expect(xml).toBe(readFileSync(EXPECTED_BPMN, "utf8"))
	})
})
