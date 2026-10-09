# Configure MCP Client connectors

Learn how to configure MCP Client connectors, including connector mode, tool access, and availability.

Learn how to configure MCP Client connectors, including connector mode, tool access, and availability.


## Connector mode

Choose how the connector operates based on your use case.

### AI Agent tool mode

Use when the connector is invoked as a tool from within an AI Agent ad-hoc sub-process. This is the default mode.

The **Method** and **Parameters** fields accept FEEL expressions and default to `toolCall.method` and `toolCall.params`, which are automatically populated by the AI Agent connector during tool discovery and tool calling.

#### Operation

Configure the operation to execute on the MCP server. You typically only need to change the default value if the ad-hoc sub-process multi-instance uses an input element other than `toolCall`.

| Field      | Required | Description                                                                                                                                       |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| Method     | Yes      | The [MCP method](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#protocol-messages) to call. Defaults to `toolCall.method`. |
| Parameters | Yes      | The parameters to pass with the MCP client execution. Defaults to `toolCall.params`.                                                              |

### Standalone mode

Use when invoking MCP operations directly from a BPMN process without an AI Agent. This mode allows you to call MCP servers independently of the agentic orchestration flow.

Select the operation to perform:

| Operation               | Description                                                                                                                                                                   | Configuration                                                                                                                                           |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| List tools              | Retrieves a list of tools available on the MCP server.                                                                                                                        | No additional configuration required.                                                                                                                   |
| Call tool               | Invokes a specific tool on the MCP server.                                                                                                                                    | **Tool name**: The name of the tool to invoke.**Tool arguments**: Tool arguments as a FEEL context expression. |
| List resources          | Retrieves a list of available resources on the MCP server.                                                                                                                    | No additional configuration required.                                                                                                                   |
| List resource templates | Retrieves a list of available resource templates on the MCP server.These are similar to resources, but include a set of parameters for dynamic resource access. | No additional configuration required.                                                                                                                   |
| Read resource           | Retrieves the content of a specific resource defined by its URI.                                                                                                              | **Resource URI**: The URI of the resource to read.                                                                                                      |
| List prompts            | Retrieves a list of available prompts on the MCP server.                                                                                                                      | No additional configuration required.                                                                                                                   |
| Get prompt              | Retrieves a specific prompt and its messages, potentially customized based on the provided input arguments.                                                                   | No additional configuration required.                                                                                                                   |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-config
