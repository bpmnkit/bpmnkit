# MCP Client connector — Modeling

1. Configure an AI agent ad-hoc sub-process as described in the [example integration](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess-example). Do not configure any tools within the ad-hoc sub-process yet.
2. In a Self-Managed environment, install the **MCP Client** element template. Refer to the [element template index](https://github.com/camunda/connectors/blob/main/connectors/agentic-ai/connector-agentic-ai/element-templates/README.md#mcp-client-connectors) to find the correct version for your Camunda release.
3. Create a service task within the ad-hoc sub-process and apply the **MCP Client** element template.
4. In the **MCP Client** section of the properties panel, configure the **Client ID** to match the value of the MCP client you used in the runtime configuration (example: `filesystem`).
5. Execute your process. You should see tool discovery calls being routed to the MCP Client service task, and tool definitions provided by the MCP server listed in the agent context variable. As a result, the agent should be able to call the tools provided by the MCP server.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector
