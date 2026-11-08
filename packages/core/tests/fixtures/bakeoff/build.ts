import { applyTemplates } from "../../../src/connectors/index.js"
import { Bpmn } from "../../../src/index.js"
import type { BpmnDefinitions } from "../../../src/index.js"

const SYSTEM_PROMPT = `="You are **TaskAgent**, a helpful, generic chat agent that can handle a wide variety of customer requests using your own domain knowledge **and** any tools explicitly provided to you at runtime.

If tools are provided, you should prefer them instead of guessing an answer. You can call the same tool multiple times by providing different input values. Don't guess any tools which were not explicitly configured. If no tool matches the request, try to generate an answer. If you're not able to find a good answer, return with a message stating why you're not able to."`

// Declaration order fills the 2 x 2 grid column by column: users, recipes | joke, products.
const TOOLS = [
	[
		"LookupSampleUsers",
		"Find sample users",
		"Lists available users. Use this tool to look up names, usernames, or IDs. Do not use it for details not returned by the service. Input: none. Returns: an array of user objects containing id, name, and username.",
		{
			url: "https://jsonplaceholder.typicode.com/users",
			resultExpression:
				"={toolCallResult: for user in response.body return {id: user.id, name: user.name, username: user.username}}",
		},
	],
	[
		"SearchRecipes",
		"Search recipes",
		'Searches the recipe catalog. Use this tool when a request asks for a recipe, dish, cuisine, or cooking instructions. Do not use it for unrelated food facts or guaranteed dietary safety. Input: searchQuery describing the desired dish or cuisine. Returns: matching recipe objects, or "No result found."',
		{
			url: "https://dummyjson.com/recipes/search",
			queryParameters:
				'={q: fromAi(toolCall.searchQuery, "The query describing which recipe to search (e.g. a specific dish or the cuisine).")}',
			resultExpression:
				'={toolCallResult: if count(response.body.recipes) > 0 then response.body.recipes else "No result found."}',
		},
	],
	[
		"FetchSafeJoke",
		"Get a safe joke",
		"Fetches one random safe-mode joke. Use this tool when the user asks for a joke or humorous response. Do not use it when the request requires a specific factual answer or a particular joke topic. Input: none. Returns: the joke as plain text.",
		{
			url: "https://v2.jokeapi.dev/joke/Any?format=txt&safe-mode",
			resultExpression: "={toolCallResult: response.body}",
		},
	],
	[
		"ListSampleTechnologyProducts",
		"List sample technology products",
		"Lists technology products. Use this tool when a request asks which devices or technology products are available or needs their attributes. Do not use it for live inventory, pricing, or purchasing. Input: none. Returns: an array of product objects with identifiers, names, and available attribute data.",
		{
			url: "https://api.restful-api.dev/objects",
			resultExpression: "={toolCallResult: response.body}",
		},
	],
] as const

/** The bake-off's "AI Agent Chat With Tools" process; see spec.md beside this file. */
export function buildAiAgentChat(): BpmnDefinitions {
	const model = Bpmn.createProcess("ai-agent-chat-with-tools")
		.name("AI Agent Chat With Tools")
		.executable(true)
		.executionPlatformVersion("8.10.0")
		.startEvent("StartEvent_TaskReceived", {
			name: "Task to perform received",
			formId: "ai-agent-chat-initial-request",
		})
		.exclusiveGateway("Gateway_RunAgent")
		.adHocSubProcess(
			"AI_Agent",
			(sub) => {
				for (const [id, name, documentation] of TOOLS)
					sub.serviceTask(id, { name, documentation, taskType: "io.camunda:http-json:1" })
			},
			{ name: "AI Agent", toolGrid: { columns: 2, fill: "column" } },
		)
		.userTask("UserTask_ReviewAgentResponse", {
			name: "User Feedback",
			zeebeUserTask: true,
			formId: "ai-agent-chat-user-feedback",
			ioMapping: { inputs: [{ source: "=agent.responseText", target: "responseText" }] },
		})
		.exclusiveGateway("Gateway_UserSatisfied", { name: "User satisfied?" })
		.branch("yes", (b) =>
			b
				.label("Yes")
				.flowId("Flow_Yes")
				.condition("=userSatisfied")
				.endEvent("EndEvent_UserSatisfied", { name: "User satisfied" }),
		)
		.branch("no", (b) =>
			b
				.label("No")
				.flowId("Flow_No")
				.condition("=userSatisfied = null or userSatisfied = false")
				.connectTo("Gateway_RunAgent"),
		)
		.annotate(
			"StartEvent_TaskReceived",
			"Triggered when a user submits a task for the AI agent to perform. The agent uses available tools to complete the task, and the process ends once the user confirms they are satisfied.",
			{ side: "above" },
		)
		.annotate("AI_Agent", "This is your agent running certain tasks to reach the goal it was given")
		.annotate(
			"FetchSafeJoke",
			"Each task you add represents a capability your agent will have. You can add new tasks and the agent will know what it's good for based on its documentation.",
			{ side: "below" },
		)
		.withAutoLayout()
		.build()

	const http = {
		"authentication.type": "noAuth",
		method: "GET",
		connectionTimeoutInSeconds: 20,
		readTimeoutInSeconds: 20,
		retryCount: 3,
		retryBackoff: "PT0S",
	}
	const { definitions, problems } = applyTemplates(model, [
		{
			elementId: "AI_Agent",
			template: "io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1",
			values: {
				"provider.type": "openai",
				"provider.openai.api.type": "responses",
				"provider.openai.backend.type": "custom",
				"provider.openai.backend.custom.endpoint":
					"=camunda.secrets.CAMUNDA_PROVIDED_LLM_API_ENDPOINT",
				"provider.openai.backend.custom.authentication.type": "apiKey",
				"provider.openai.backend.custom.authentication.apiKey":
					"=camunda.secrets.CAMUNDA_PROVIDED_LLM_API_KEY",
				"provider.openai.model.model": "=camunda.secrets.CAMUNDA_PROVIDED_LLM_DEFAULT_MODEL",
				"data.systemPrompt.prompt": SYSTEM_PROMPT,
				"data.userPrompt.prompt": "=if is defined(followUpInput) then followUpInput else inputText",
				"data.userPrompt.documents":
					"=if is defined(followUpInput) or is defined(followUpDocuments) then followUpDocuments else inputDocuments",
				agentContext: "=agent.context",
				"data.memory.storage.type": "in-process",
				"data.memory.contextWindowSize": 20,
				"data.limits.maxModelCalls": 10,
				"data.events.behavior": "WAIT_FOR_TOOL_CALL_RESULTS",
				"data.response.format.type": "text",
				"data.response.format.parseJson": false,
				"data.response.includeAssistantMessage": false,
				"data.response.includeAgentContext": true,
				resultVariable: "agent",
				retryCount: 3,
				retryBackoff: "PT0S",
			},
		},
		...TOOLS.map(([elementId, , , values]) => ({
			elementId,
			template: "io.camunda.connectors.HttpJson.v2@18",
			values: { ...http, ...values },
		})),
	])
	if (problems.length > 0)
		throw new Error(problems.map((p) => `${p.elementId}: ${p.message}`).join("\n"))
	return definitions
}
