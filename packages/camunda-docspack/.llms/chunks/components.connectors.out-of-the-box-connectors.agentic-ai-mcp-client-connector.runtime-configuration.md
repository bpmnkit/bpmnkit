# MCP Client connector — Runtime configuration

**Note**
Configuration properties can be defined as environment variables using [Spring Boot conventions](https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables).

To define an environment variable, convert the configuration property to uppercase, remove any dashes `-`, and replace any delimiters `.` with underscores `_`.

For example, the property `camunda.connector.agenticai.mcp.remote-client.client.cache.expire-after` is represented by the environment variable `CAMUNDA_CONNECTOR_AGENTICAI_MCP_REMOTECLIENT_CLIENT_CACHE_EXPIREAFTER`.

To use the MCP Client connector, it must be enabled in the connector runtime. Any clients that should be available to the connector must also be defined in the runtime configuration.

STDIO servers can use any programming language or execution runtime available on the machine running the connector runtime. The example below starts MCP servers using both Node.js and Docker, and therefore requires a Node.js and Docker environment to be available.

**Warning**
Configuring STDIO servers results in the connector runtime starting and managing the lifecycle of the configured processes. When configuring third-party MCP servers, ensure that the configured commands are trusted and secure.

```yaml
camunda:
  connector:
    agenticai:
      mcp:
        client:
          enabled: true # <-- disabled by default
          clients:
            # STDIO server started as Node.js process (requires Node.js runtime)
            filesystem: # <-- client ID, needed to reference the client in the MCP Client connector configuration
              type: stdio
              stdio:
                command: npx
                args:
                  - "-y"
                  - "@modelcontextprotocol/server-filesystem"
                  - "<path-to-files>"
                env:
                  MY_ENV_VAR: "my-value" # <-- optional environment variables

            # STDIO server started as docker container (requires Docker being available)
            time:
              type: stdio
              stdio:
                command: docker
                args:
                  - "run"
                  - "-i"
                  - "--rm"
                  - "mcp/time"

            # Remote Streamable HTTP MCP server (recommended for remote servers)
            # fetch:
            #   enabled: true
            #   type: http
            #   http:
            #     url: https://remote.mcpservers.org/fetch/mcp
            #     headers:
            #       X-Dummy: dummy-value
            #     # authentication examples
            #     authentication:
            #       type: basic # or bearer or oauth
            #       basic:
            #         username: my-username
            #         password: my-password
            #       bearer:
            #         token: my-token
            #       oauth:
            #         oauth-token-endpoint: http://example.com/oauth/token
            #         client-id: my-client-id
            #         client-secret: my-client-secret
            #         scopes: my-scope
            #         audience: my-audience
            #         client-authentication: basic-auth-header # or credentials-body

            # Connection to a remote HTTP/SSE MCP server
            # some-remote-sse-server:
            #   enabled: false
            #   type: sse
            #   sse:
            #     url: https://example.com/mcp/sse
            #     headers:
            #       X-Dummy: dummy-value
            #     authentication:
            #       ...
```

The YAML structure above describes the overall configuration structure of the MCP Client connector. How to configure
this for your specific use case varies on the connector runtime you are using.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector
