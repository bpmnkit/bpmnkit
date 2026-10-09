# MCP Client

Integrate MCP (Model Context Protocol) clients with agentic orchestration.

Integrate [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) clients with [agentic orchestration](https://docs.camunda.io/docs/next/components/agentic-orchestration/agentic-orchestration-overview).

**Tip: Camunda as an MCP server**
The Orchestration Cluster includes two built-in MCP servers that can be used as remote MCP server targets with the MCP Client connectors:

- The [Orchestration Cluster MCP Server](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-overview) exposes Camunda's operational capabilities (incidents, user tasks, process instances…). See [Enable and connect](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-setup#use-with-the-mcp-client-connectors) for configuration details.
- The [Processes MCP Server](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview) exposes your deployed BPMN processes as callable tools (served at `/mcp/processes`). See [Enable and connect](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-setup#use-with-the-mcp-client-connectors) for configuration details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client
