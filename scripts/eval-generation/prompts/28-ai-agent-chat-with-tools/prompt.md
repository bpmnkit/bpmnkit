# Spec: AI Agent Chat With Tools (Camunda 8.10)

Build one executable BPMN file named `ai-agent-chat-with-tools.bpmn` for Camunda 8.10.

## What the process does

A user submits a task in a start form. An AI agent works on the task and may call four
HTTP tools. The user reads the agent's answer in a feedback form. If the user is not
satisfied, the agent runs again with the user's follow-up. If the user is satisfied, the
process ends.

## Process

- Process ID `ai-agent-chat-with-tools`, name "AI Agent Chat With Tools", executable.
- Target platform: Camunda Cloud 8.10.0.

## Main flow, left to right

1. **Start event** `StartEvent_TaskReceived`, named "Task to perform received". It uses the
   form with form ID `ai-agent-chat-initial-request`.
2. **Exclusive gateway** `Gateway_RunAgent`, with no name. It merges the start path and the
   retry path, then leads to the agent.
3. **AI agent** `AI_Agent`, named "AI Agent". It is an ad-hoc sub-process configured with the
   Camunda **AI Agent Sub-process** connector template
   (`io.camunda.connectors.agenticai.ai-agent-subprocess.v2`, template version 1). Settings:
   - Model provider: OpenAI, using the Responses API, with a custom backend.
     - Endpoint: secret `CAMUNDA_PROVIDED_LLM_API_ENDPOINT`.
     - Authentication: API key, from secret `CAMUNDA_PROVIDED_LLM_API_KEY`.
     - Model: secret `CAMUNDA_PROVIDED_LLM_DEFAULT_MODEL`.
     - Reference each secret as a FEEL expression, for example `=camunda.secrets.CAMUNDA_PROVIDED_LLM_API_KEY`.
   - System prompt, as a FEEL string with this exact text (two paragraphs separated by one blank line):
     > You are **TaskAgent**, a helpful, generic chat agent that can handle a wide variety of customer requests using your own domain knowledge **and** any tools explicitly provided to you at runtime.
     >
     > If tools are provided, you should prefer them instead of guessing an answer. You can call the same tool multiple times by providing different input values. Don't guess any tools which were not explicitly configured. If no tool matches the request, try to generate an answer. If you're not able to find a good answer, return with a message stating why you're not able to.
   - User prompt: use `followUpInput` when it is defined, otherwise `inputText`.
   - User prompt documents: if `followUpInput` or `followUpDocuments` is defined, use
     `followUpDocuments`, otherwise use `inputDocuments`.
   - Agent context: `=agent.context`.
   - Memory: in-process storage, context window of 20 messages.
   - Limits: at most 10 model calls.
   - Event handling: wait for tool call results.
   - Response: text format, do not parse JSON, do not include the assistant message,
     do include the agent context.
   - Result variable: `agent`.
   - Retries 3, retry backoff `PT0S`.
4. **User task** `UserTask_ReviewAgentResponse`, named "User Feedback". It is a Camunda user
   task with form ID `ai-agent-chat-user-feedback`. It maps the input `responseText` from
   `=agent.responseText`.
5. **Exclusive gateway** `Gateway_UserSatisfied`, named "User satisfied?". It has two outgoing flows:
   - "Yes", to the end event, when `=userSatisfied`.
   - "No", back to `Gateway_RunAgent`, when `=userSatisfied = null or userSatisfied = false`.
6. **End event** `EndEvent_UserSatisfied`, named "User satisfied".

## Tools inside the AI agent

There are four service tasks inside `AI_Agent`, with no flows between them. Each one uses
the Camunda **REST Outbound** connector template (`io.camunda.connectors.HttpJson.v2`,
template version 18). Each has no authentication, method GET, connection timeout 20 s,
read timeout 20 s, "ignore null values" false, retries 3 and retry backoff `PT0S`. Each
tool's documentation text tells the agent what the tool is for.

1. `LookupSampleUsers`, "Find sample users".
   - URL: `https://jsonplaceholder.typicode.com/users`
   - Result expression: build `toolCallResult` as a list. Each user in `response.body`
     becomes an object with that user's `id`, `name` and `username`.
   - Documentation: "Lists available users. Use this tool to look up names, usernames, or IDs. Do not use it for details not returned by the service. Input: none. Returns: an array of user objects containing id, name, and username."
2. `SearchRecipes`, "Search recipes".
   - URL: `https://dummyjson.com/recipes/search`
   - Query parameters: `q` comes from the AI as `toolCall.searchQuery`, described as "The query describing which recipe to search (e.g. a specific dish or the cuisine)."
   - Result expression: `toolCallResult` is `response.body.recipes` when it holds more than
     0 recipes, otherwise the text "No result found."
   - Documentation: "Searches the recipe catalog. Use this tool when a request asks for a recipe, dish, cuisine, or cooking instructions. Do not use it for unrelated food facts or guaranteed dietary safety. Input: searchQuery describing the desired dish or cuisine. Returns: matching recipe objects, or "No result found.""
3. `FetchSafeJoke`, "Get a safe joke".
   - URL: `https://v2.jokeapi.dev/joke/Any?format=txt&safe-mode`
   - Result expression: `toolCallResult` is `response.body`.
   - Documentation: "Fetches one random safe-mode joke. Use this tool when the user asks for a joke or humorous response. Do not use it when the request requires a specific factual answer or a particular joke topic. Input: none. Returns: the joke as plain text."
4. `ListSampleTechnologyProducts`, "List sample technology products".
   - URL: `https://api.restful-api.dev/objects`
   - Result expression: `toolCallResult` is `response.body`.
   - Documentation: "Lists technology products. Use this tool when a request asks which devices or technology products are available or needs their attributes. Do not use it for live inventory, pricing, or purchasing. Input: none. Returns: an array of product objects with identifiers, names, and available attribute data."

Lay the four tools out in a 2 x 2 grid inside the sub-process: users and recipes in the
left column, joke and products in the right column.

## Annotations

1. Above the start event, attached to it: "Triggered when a user submits a task for the AI agent to perform. The agent uses available tools to complete the task, and the process ends once the user confirms they are satisfied."
2. To the left of the AI agent, attached to it: "This is your agent running certain tasks to reach the goal it was given"
3. To the right of the AI agent, below the user task, attached to "Get a safe joke": "Each task you add represents a capability your agent will have. You can add new tasks and the agent will know what it's good for based on its documentation."

## Out of scope

The two form files and the test suite already exist. Do not author them.
