# AI agent tool definitions — Tool definitions

**Important**
The AI Agent connector only considers the **root node** of the sub-flow when resolving a tool definition.

A tool definition consists of the following properties which will be passed to the LLM. The tool definition is closely modeled after the [list tools response](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#listing-tools) as defined in the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

| Property    | Description                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name        | The name of the tool. This is the **ID of the activity** in the ad-hoc sub-process.                                                                                                                                                                                                                                                                                                                                                     |
| description | The description of the tool, used to inform the LLM of the tool purpose. If the **documentation** of the activity is set, this is used as the description, otherwise the **name** of the activity is used. Make sure you provide a meaningful description to help the LLM understand the purpose of the tool.                                                                                                                           |
| inputSchema | The input schema of the tool, describing the input parameters of the tool. The connector will analyze all input mappings of the activity and create a [JSON Schema](https://json-schema.org/) based on the [`fromAi`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-ai-agent#fromaivalue) function calls defined in these mappings. If no `fromAi` function calls are found, an empty JSON Schema object is returned. |

**Note**
Provide as much context and guidance in tool definitions and input parameter definitions as you can to ensure the LLM
selects the right tool and generates proper input values.

Refer to the [Anthropic documentation](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/implement-tool-use#example-of-a-good-tool-description) for tool definition best practices.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
