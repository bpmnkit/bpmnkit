# MCP Client connector

**Note**
This connector is not directly available on Camunda 8 SaaS. Instead, you can connect a custom connector runtime configured to run the MCP Client connector to your Camunda 8 SaaS instance.

The MCP Client connector integration allows configuring MCP clients to be started as part of the connector runtime. As the runtime manages MCP client connections (unlike the job worker in the [MCP Remote Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector#limitations)), this approach enables using both STDIO and remote MCP servers without the overhead of repeatedly opening and closing connections for each interaction.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector
