# Copilot — Configuration — applicationYaml

| Property                                                 | Description                                                                                   | Example value                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| `camunda.hub.copilot.providers.open-ai.default-model-id` | Default model ID for OpenAI provider.                                                         | `gpt-4.1`                            |
| `camunda.hub.copilot.providers.open-ai.api-key`          | [conditionally required] API key for OpenAI public API.                                       | `sk-live-********`                   |
| `camunda.hub.copilot.providers.open-ai.endpoint`         | [conditionally required] Custom endpoint for OpenAI-compatible APIs (proxies or self-hosted). | `https://my-proxy.example.com/v1`    |
| `camunda.hub.copilot.providers.open-ai.bearer`           | [optional] Bearer token header to use instead of `api-key` with compatible gateways.          | `my-shared-bearer-token`             |
| `camunda.hub.copilot.providers.open-ai.username`         | [optional] Username to authenticate with an OpenAI-compatible gateway.                        | `api_user`                           |
| `camunda.hub.copilot.providers.open-ai.password`         | [optional] Password to authenticate with an OpenAI-compatible gateway.                        | `s3cr3t`                             |
| `camunda.hub.copilot.providers.open-ai.headers`          | [optional] Extra HTTP headers as a JSON map (string).                                         | `{"X-Org":"camunda","X-Trace":"on"}` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
