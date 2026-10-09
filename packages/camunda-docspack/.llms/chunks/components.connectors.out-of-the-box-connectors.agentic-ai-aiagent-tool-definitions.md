# AI agent tool definitions

Understand what an AI agent tool is, how tools are defined, and how their names, descriptions, and parameters are resolved for the LLM.

Understand what an AI agent tool is, how tools are defined, and how their names, descriptions, and parameters are resolved for the LLM.


## What is a tool

A tool is a single BPMN element, or a flow of BPMN elements, inside an [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) that an [LLM](https://docs.camunda.io/docs/next/reference/glossary#large-language-model-llm) can choose to invoke to complete a goal. Each tool has:

- A **name**: the element ID, used by the LLM to identify the tool.
- A **description**: the element's **Documentation** field, used by the LLM to decide when to call the tool.
- **Input parameters**: values the LLM must supply at call time, declared using the [`fromAi()`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-ai-agent#fromaivalue) FEEL function in input mappings.
- A **result**: the tool's output, returned to the LLM as `toolCallResult`.

The Camunda Hub modeler can help you fill in both the input parameters and the result. See [assisted tool configuration in Camunda Hub](#assisted-tool-configuration-in-web-modeler) for more details.

### Which elements are resolved as tools

When resolving the available tools within an ad-hoc sub-process, the AI agent will take all elements into account which **have no incoming flows** (root nodes within the ad-hoc sub-process) and **are not boundary events**.

For example, in the following image the elements marked in green are the ones that will be considered as tools:

![AI Agent tool resolution](../img/ai-agent-tool-resolution.png)

You can use any BPMN element or connector as a tool:

| Tool type            | When to use                                                                                           |
| :------------------- | :---------------------------------------------------------------------------------------------------- |
| Connectors           | Call an external system, for example the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) to call an HTTP API.   |
| Script task          | Execute inline logic or data transformation.                                                          |
| User task            | Route to a human for input or approval as part of the agent's decision path.                          |
| Call activity        | Invoke another BPMN process as a tool when the target process is on the same cluster.                 |
| MCP client connector | Expose tools from an external [MCP server](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client) as gateway tools to the agent. |
| Sub-process          | Model a multi-step sub-flow that the LLM triggers as a single tool.                                   |

**Note**
For instructions on adding tools to an AI agent, see [add tools to an AI agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
