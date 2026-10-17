# Enable and connect — Connect an MCP client — remote

The [MCP Remote Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector) connects to remote MCP servers over HTTP. Configure it in the properties panel with the following settings:

- **Transport type**: Streamable HTTP.
- **URL**: Your MCP endpoint URL (see [above](#mcp-endpoint-url)).
- **Authentication**: OAuth 2.0.

| Field                    | Value                                                                                                                                |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| OAuth 2.0 token endpoint | Your OAuth token endpoint (`https://login.cloud.camunda.io/oauth/token` for SaaS).                                                   |
| Client ID                | Your OAuth client ID.                                                                                                                |
| Client secret            | Your OAuth client secret. Use [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) (for example, `{{secrets.MCP_CLIENT_SECRET}}`). |
| Audience                 | The audience for your cluster API (`zeebe.camunda.io` for SaaS).                                                                     |
| Client authentication    | Send client credentials in body.                                                                                                     |

For more details, see [MCP Remote Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector).

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-setup
