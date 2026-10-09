# AI agent tool definitions — Gateway tool definitions

Gateway tools are activities that expose multiple tools from an external source, such as an MCP server or an A2A agent. Unlike static tool definitions, gateway tools discover their available tools dynamically during agent initialization by calling the external source.

To configure an activity as a gateway tool, set the [extension property](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates#zeebeproperty) `io.camunda.agenticai.gateway.type` on the activity. The property value specifies which gateway implementation to use (for example, `mcpClient`). The agent must also have access to a handler for the specified gateway type. Custom implementations can be made available to the agent in self-managed or hybrid setups.

Because the tools behind a gateway activity are discovered dynamically rather than resolved from the BPMN model, their input schemas are not derived from [`fromAi`](#ai-generated-parameters-via-fromai) function calls in the gateway activity's input mappings.
Instead, each discovered tool's input schema is provided by the external source itself, for example, the input schema included in the `tools/list` response returned by an MCP server. Any `fromAi` calls configured on a gateway tool activity's input mappings are ignored.

For more details, see the available gateway tool implementations:

- [MCP Client connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client)
- [A2A Client connector](https://docs.camunda.io/docs/next/components/early-access/alpha/a2a-client/a2a-client)

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
