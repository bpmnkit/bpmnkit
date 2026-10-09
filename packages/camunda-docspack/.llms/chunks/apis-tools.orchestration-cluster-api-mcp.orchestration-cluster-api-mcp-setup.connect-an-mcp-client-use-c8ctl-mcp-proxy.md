# Enable and connect — Connect an MCP client — Use c8ctl `mcp-proxy`

Many MCP clients, such as VS Code (GitHub Copilot) and Claude Code, do not natively support the OAuth 2.0 client credentials flow required for authenticated environments. The [c8ctl](https://github.com/camunda/c8ctl) `mcp-proxy` command bridges this gap by providing a local STDIO-to-Remote HTTP proxy that handles authentication transparently.

The proxy authenticates to the MCP server using OAuth 2.0 client credentials, and exposes a local STDIO MCP interface that your client connects to.

#### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later.
- [Client credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) for your Camunda cluster with the **Orchestration Cluster API** scope enabled.

#### Configuration

Add the following to your MCP client configuration.
For example, use the following in `claude_desktop_config.json` for Claude Code:

```json
{
  "mcpServers": {
    "camunda-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@camunda8/cli", "mcp-proxy"],
      "env": {
        "CAMUNDA_BASE_URL": "https://<cluster-base-url>",
        "CAMUNDA_CLIENT_ID": "<client-id>",
        "CAMUNDA_CLIENT_SECRET": "<client-secret>",
        "CAMUNDA_OAUTH_URL": "https://<token-url>/oauth/token",
        "CAMUNDA_TOKEN_AUDIENCE": "<token-audience>"
      }
    }
  }
}
```

| Variable                 | Description                                                                                                                                                                                                    |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAMUNDA_BASE_URL`       | Base URL of your Orchestration Cluster, **without** the `/mcp/cluster` path (for example, the public `api.camunda.io` URL or the private `privateconnectivity.camunda.io` URL when using Secure connectivity). |
| `CAMUNDA_CLIENT_ID`      | OAuth client ID from your API client credentials.                                                                                                                                                              |
| `CAMUNDA_CLIENT_SECRET`  | OAuth client secret from your API client credentials.                                                                                                                                                          |
| `CAMUNDA_OAUTH_URL`      | OAuth token endpoint URL.                                                                                                                                                                                      |
| `CAMUNDA_TOKEN_AUDIENCE` | Token audience for the Orchestration Cluster API.                                                                                                                                                              |

**Tip: Where to find these values**
When you [create API client credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) in Camunda Hub, all required connection details are displayed on the credentials page. You can also copy a ready-to-use c8ctl configuration snippet directly from the **MCP** tab on the credentials screen.

For the full list of supported environment variables, see the [c8ctl documentation](https://github.com/camunda/c8ctl).

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-setup
