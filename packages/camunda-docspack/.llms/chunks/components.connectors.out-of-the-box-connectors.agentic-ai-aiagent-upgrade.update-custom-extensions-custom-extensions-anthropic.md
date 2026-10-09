# Upgrade AI Agent element templates — Update custom extensions {#custom-extensions} — Anthropic

**Legacy template Provider**: Anthropic → **New template Provider**: [Anthropic](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#anthropic), **Backend**: Anthropic API.

**Anthropic API key**, **Timeout**, **Model**, **Maximum tokens**, **Temperature**, **top P**, and **top K** carry over unchanged.

If you had a custom **Endpoint** configured in the legacy template:

| Legacy field | New template guidance                                                                                                                                |
| :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint     | Select **Backend**: [Anthropic](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#anthropic) > Custom / compatible endpoint, and enter it as **API endpoint**. |

The custom or compatible backend also supports **OAuth 2.0 client credentials** for gateways in front of Anthropic that require a bearer token.

The new template additionally exposes **Effort**, **Thinking mode**, and **Enable prompt caching**. None of these have a legacy equivalent.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
