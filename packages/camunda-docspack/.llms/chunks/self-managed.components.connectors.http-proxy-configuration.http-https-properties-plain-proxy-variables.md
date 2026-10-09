# HTTP proxy configuration — HTTP/HTTPS properties — Plain proxy variables

The standard proxy variables support configuring a TLS-based proxy (running under `https://`) via the `SCHEME` variable. However, some connector integrations use HTTP clients (such as the JDK HttpClient) that do not support TLS-based proxy connections. For these connectors, an alternative set of **plain proxy variables** is available.

When both plain and standard variables are configured, the **plain variables take priority**. If the plain variables are not set, the connector falls back to the standard variables.

| Variable (HTTP target URL)            | Variable (HTTPS target URL)            | Description                                                         |
| :------------------------------------ | :------------------------------------- | :------------------------------------------------------------------ |
| `CONNECTOR_HTTP_PLAIN_PROXY_HOST`     | `CONNECTOR_HTTPS_PLAIN_PROXY_HOST`     | The host name of the proxy server.                                  |
| `CONNECTOR_HTTP_PLAIN_PROXY_PORT`     | `CONNECTOR_HTTPS_PLAIN_PROXY_PORT`     | The port number.                                                    |
| `CONNECTOR_HTTP_PLAIN_PROXY_USER`     | `CONNECTOR_HTTPS_PLAIN_PROXY_USER`     | _(optional)_ The username to log in to the proxy.                   |
| `CONNECTOR_HTTP_PLAIN_PROXY_PASSWORD` | `CONNECTOR_HTTPS_PLAIN_PROXY_PASSWORD` | _(optional)_ The password to log in to the proxy.                   |
| `CONNECTOR_HTTP_PLAIN_PROXY_SCHEME`   | `CONNECTOR_HTTPS_PLAIN_PROXY_SCHEME`   | _(optional)_ The scheme of the proxy server. The default is `http`. |

**Note**
There is no plain variant of `NON_PROXY_HOSTS`. The standard `CONNECTOR_HTTP_NON_PROXY_HOSTS` variable applies to both standard and plain proxy configurations.

The following connectors support plain proxy variables:

- [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent)
- [MCP Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client)
- [A2A Client connector](https://docs.camunda.io/docs/next/components/early-access/alpha/a2a-client/a2a-client)
- [Vector database connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db)

Not all providers within each connector support proxy configuration. Refer to the individual connector documentation for details on unsupported providers.

The [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) and the core SDK HTTP client use only the standard proxy variables.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration
