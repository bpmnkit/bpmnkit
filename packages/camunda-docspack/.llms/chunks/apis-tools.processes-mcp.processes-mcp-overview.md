# Processes MCP Server

Enable AI agents to discover and call your deployed BPMN processes as MCP tools.


## About

The Processes MCP Server is a capability of the Orchestration Cluster that exposes your deployed BPMN processes as callable tools through the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP).

- Any process equipped with an [MCP start event](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-start-event) element template is automatically registered as an MCP tool when deployed.
- MCP clients discover these tools at runtime and invoke them by name. Each invocation starts a new process instance and returns the started process instance key immediately.
- The server shares the same [authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication) and [authorization](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) model as the Orchestration Cluster REST API.

**Important: Camunda 8 public API**
The Processes MCP Server is not part of the [Camunda 8 public API](https://docs.camunda.io/docs/next/reference/public-api).

**Note**
This is the Processes MCP Server documentation. If you are looking to:

- Give [AI agents](https://docs.camunda.io/docs/next/reference/glossary#ai-agent) access to Camunda's operational capabilities, such as incidents, user tasks, and process instances, see the [Orchestration Cluster MCP Server](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-overview).
- Connect an AI agent running inside a BPMN process to an external MCP server, see the [MCP Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client).

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview
