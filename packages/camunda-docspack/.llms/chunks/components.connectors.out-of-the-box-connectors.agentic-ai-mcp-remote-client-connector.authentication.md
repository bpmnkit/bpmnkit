# MCP Remote Client connector — Authentication

The MCP Remote Client connector supports multiple authentication methods for connecting to secured MCP servers. Authentication is configured per transport type.

### None

Select **None** in the **Authentication** dropdown. No authentication headers are added to requests. You can still configure custom headers for API keys or other header-based authentication mechanisms.

### Basic

Sends an `Authorization: Basic <base64(username:password)>` header with each request.

| Field    | Required | Description                                                                                                                                                                   |
| :------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Username | Yes      | The username for authentication.                                                                                                                                              |
| Password | Yes      | The password for authentication. Camunda recommends using [secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets). For example, `{{secrets.MCP_PASSWORD}}`. |

### Bearer token

Sends an `Authorization: Bearer <token>` header with each request.

| Field        | Required | Description                                                                                                                                                              |
| :----------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bearer token | Yes      | The bearer token value. Camunda recommends using [secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets). For example, `{{secrets.MCP_BEARER_TOKEN}}`. |

### OAuth 2.0 client credentials

Automatically retrieves and manages access tokens using the OAuth 2.0 client credentials flow (machine-to-machine authentication). Tokens are cached in memory and automatically refreshed when expired.

| Field                 | Required | Description                                                                                                                   |
| :-------------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------- |
| OAuth token endpoint  | Yes      | The URL to obtain access tokens.                                                                                              |
| Client ID             | Yes      | Your OAuth client identifier.                                                                                                 |
| Client secret         | Yes      | Your OAuth client secret. Camunda recommends using [secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets). |
| Audience              | No       | Target API identifier (required by some OAuth providers).                                                                     |
| Scopes                | No       | Space-separated list of scopes to request.                                                                                    |
| Client authentication | Yes      | **Send credentials in header** (Basic authentication) or **send credentials in body**.                                        |

For more details on OAuth 2.0 client credentials flow, see [REST connector OAuth](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#rest-connector-oauth-token).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector
