# Enable and connect — Connect an MCP client — client

The [MCP Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector) manages persistent MCP connections through the connector runtime. Configure the Camunda MCP server as a remote HTTP client in your connector runtime configuration (for example, `application.yml`):

```yaml
camunda:
  connector:
    agenticai:
      mcp:
        client:
          enabled: true
          clients:
            camunda-mcp:
              type: http
              http:
                url: https://${REGION_ID}.api.camunda.io/${CLUSTER_ID}/mcp/cluster
                authentication:
                  type: oauth
                  oauth:
                    oauth-token-endpoint: https://login.cloud.camunda.io/oauth/token
                    client-id: <your-client-id>
                    client-secret: <your-client-secret>
                    audience: zeebe.camunda.io
                    client-authentication: credentials-body
```

The example above shows a SaaS configuration using the public endpoint. For clusters with Secure connectivity (AWS PrivateLink), set `url` to the private MCP endpoint URL shown in Camunda Hub instead of the public `zeebe.camunda.io` host (the path still ends with `/mcp/cluster`).

For local unauthenticated setups, you can omit the `authentication` block and use `http://localhost:8080/mcp/cluster` as the URL.

Reference the client ID `camunda-mcp` in the MCP Client connector element template in your BPMN process. For more details, see [MCP Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector).

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-setup
