# MCP Remote Client connector — Client caching

To reduce the connection overhead described in [Limitations](#limitations), the MCP Remote Client connector can cache MCP clients and reuse connections for calls to the same MCP server.

### Per-client caching options

Enable the **Client cache** checkbox in the connector properties to reuse the MCP client connection for as long as configured on the runtime.

**Warning**
Enable client caching **only** when authentication credentials do not depend on process-specific data. Cached clients reuse the authentication context from the first connection, which may conflict with process-specific credentials in subsequent calls.

### Runtime cache configuration

In a Camunda 8 Self-Managed setup or a [custom connector runtime](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk#runtime-environments), configure overall client-caching behavior using the following properties:

**Note**
Configuration properties can be defined as environment variables using [Spring Boot conventions](https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables). To define an environment variable, convert the configuration property to uppercase, remove any dashes `-`, and replace any delimiters `.` with underscores `_`.

For example, the property `camunda.connector.agenticai.mcp.remote-client.client.cache.expire-after` is represented by the environment variable `CAMUNDA_CONNECTOR_AGENTICAI_MCP_REMOTECLIENT_CLIENT_CACHE_EXPIREAFTER`.

```properties
camunda.connector.agenticai.mcp.remote-client.client.cache.enabled=true
camunda.connector.agenticai.mcp.remote-client.client.cache.expire-after=PT10M
camunda.connector.agenticai.mcp.remote-client.client.cache.maximum-size=15
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector
