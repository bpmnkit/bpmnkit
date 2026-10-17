# Development workflows — Session management

Session state persists between commands. Settings you change remain active until you change them again.

### Set the active profile

```bash
c8 use profile prod
```

### Set the active tenant

```bash
c8 use tenant my-tenant-id
```

### Set the output mode

```bash
c8 output json    # JSON output for scripting
c8 output text    # human-readable tables (default)
c8 output         # show current output mode
```


## MCP proxy

The `mcp-proxy` command starts a local STDIO-to-HTTP proxy that bridges MCP clients (such as VS Code with GitHub Copilot, or Claude Code) to the [Orchestration Cluster MCP Server](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-overview). It handles OAuth 2.0 authentication transparently, so MCP clients that do not support the client credentials flow can connect to authenticated clusters.

### Configure with VS Code

Add the following to your `.vscode/mcp.json`:

```json
{
  "servers": {
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

| Variable                 | Description                                                                  |
| :----------------------- | :--------------------------------------------------------------------------- |
| `CAMUNDA_BASE_URL`       | Base URL of your Orchestration Cluster, **without** the `/mcp/cluster` path. |
| `CAMUNDA_CLIENT_ID`      | OAuth client ID from your API client credentials.                            |
| `CAMUNDA_CLIENT_SECRET`  | OAuth client secret from your API client credentials.                        |
| `CAMUNDA_OAUTH_URL`      | OAuth token endpoint URL.                                                    |
| `CAMUNDA_TOKEN_AUDIENCE` | Token audience for the Orchestration Cluster API.                            |

**Tip**
When you [create API client credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) in the Camunda Console, all required connection details are shown on the credentials page. You can also copy a ready-to-use `c8ctl` configuration snippet from the MCP tab.

### Use a profile with MCP proxy

Instead of passing environment variables, use a `c8ctl` profile to supply credentials:

```json
{
  "servers": {
    "camunda-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@camunda8/cli", "mcp-proxy", "--profile=prod"]
    }
  }
}
```

This reads credentials from the named profile, including Modeler profiles (for example, `--profile=modeler:Cloud Cluster`).

### Local development without authentication

If your local cluster does not require authentication (for example, [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run)), you can connect MCP clients directly without the proxy:

```json
{
  "servers": {
    "camunda": {
      "type": "http",
      "url": "http://localhost:8080/mcp/cluster"
    }
  }
}
```

For full MCP server documentation, see [Orchestration Cluster MCP Server](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-overview).

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
