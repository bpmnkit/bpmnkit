# Customize the AI Agent connector

Customize the AI Agent connector in Self-Managed or hybrid deployments to suit your specific needs.

Customize the [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent) in Self-Managed or [hybrid](https://docs.camunda.io/docs/next/reference/glossary#hybrid-mode) deployments by implementing custom conversation storage, supporting additional AI models, or adding logic to the agent execution flow.


## HTTP proxy configuration

In Self-Managed environments, the AI Agent connector supports routing HTTP requests to LLM providers through an HTTP proxy. This applies to the AI Agent, [MCP Client](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client), and [A2A Client](https://docs.camunda.io/docs/next/components/early-access/alpha/a2a-client/a2a-client) connectors.

These connectors support [plain proxy variables](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration#plain-proxy-variables) in addition to the standard connector proxy variables. Refer to the [HTTP proxy configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration) page for the full list of environment variables and configuration options.

The following LLM providers do not support connector proxy variables, but respect standard [JVM proxy properties](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration#jvm-properties):

- Google Vertex AI.

To disable proxy support entirely (for example, if only an HTTPS-based proxy is available):

- **Spring Boot property:** `camunda.connector.agenticai.http.proxy-support.enabled=false`.
- **Environment variable:** `CAMUNDA_CONNECTOR_AGENTICAI_HTTP_PROXYSUPPORT_ENABLED=false`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization
