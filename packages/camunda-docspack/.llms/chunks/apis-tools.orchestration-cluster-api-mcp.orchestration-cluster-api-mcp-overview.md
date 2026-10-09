# Orchestration Cluster MCP Server

Enable AI agents and LLM-powered applications to interact with Camunda via Model Context Protocol (MCP).


## About

The Orchestration Cluster MCP Server is an API surface of the Orchestration Cluster that exposes Camunda's operational capabilities through the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP).

- It enables [AI agents](https://docs.camunda.io/docs/next/reference/glossary#ai-agent) and LLM-powered applications to discover and invoke Camunda tools using a standardized interface, without custom API integration code.
- Similar to the [Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview), the MCP server is built into the Orchestration Cluster and shares the same [authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication) and [authorization](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) model. It can be enabled independently.

**Important: Camunda 8 public API**
The Orchestration Cluster MCP Server is not part of the [Camunda 8 public API](https://docs.camunda.io/docs/next/reference/public-api).

**Note**
This is the Orchestration Cluster MCP Server documentation. If you are looking to:

- Expose your own BPMN processes as callable MCP tools for AI agents, see the [Processes MCP Server](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview).
- Connect an AI agent running in a BPMN process to an external MCP server, see the [MCP Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client).

### Key features

Building AI-powered applications that interact with Camunda traditionally requires writing custom client code to call REST APIs, handle authentication, parse responses, and format data for AI consumption. The MCP server removes this by providing:

| Benefit             | Description                                                                                                               |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| Standardized access | AI agents discover and invoke Camunda capabilities through the MCP protocol, without bespoke integration code.            |
| Tool discovery      | MCP clients automatically discover available tools and their schemas at runtime.                                          |
| Broad compatibility | Works with any MCP-compliant client, including VS Code (GitHub Copilot), Claude Code, Cursor, and custom AI applications. |
| Consistent security | Inherits the same authentication and authorization model as the REST API.                                                 |

### Authentication

The MCP server uses the same authentication model as the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication). OAuth tokens obtained for the REST API work without changes.

For SaaS environments:

1. [Create API client credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) in Camunda Hub. Ensure the **Orchestration Cluster API** scope is enabled.
2. Use the generated **Client ID**, **Client secret**, **OAuth token endpoint**, and **audience** to obtain an access token via the [OAuth 2.0 client credentials flow](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication#using-a-token-oidcjwt).
3. Pass the token in the `Authorization: Bearer <token>` header, or use [`c8ctl mcp-proxy`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-setup#using-c8ctl-mcp-proxy) to handle this automatically.

For the full authentication reference, including Self-Managed OIDC and basic authentication setup, see [Authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).

### Transport

The MCP server uses the [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http) transport and is served at the `/mcp/cluster` endpoint. It is stateless and no session management is required.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-overview
