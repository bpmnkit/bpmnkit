# Copilot — Configuration — envVars

| Environment variable                                  | Description                                                                                   | Example value                        |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_OPENAI_DEFAULTMODELID` | Default model ID for OpenAI provider.                                                         | `gpt-4.1`                            |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_OPENAI_APIKEY`         | [conditionally required] API key for OpenAI public API.                                       | `sk-live-********`                   |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_OPENAI_ENDPOINT`       | [conditionally required] Custom endpoint for OpenAI-compatible APIs (proxies or self-hosted). | `https://my-proxy.example.com/v1`    |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_OPENAI_BEARER`         | [optional] Bearer token header to use instead of `api-key` with compatible gateways.          | `my-shared-bearer-token`             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_OPENAI_USERNAME`       | [optional] Username to authenticate with an OpenAI-compatible gateway.                        | `api_user`                           |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_OPENAI_PASSWORD`       | [optional] Password to authenticate with an OpenAI-compatible gateway.                        | `s3cr3t`                             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_OPENAI_HEADERS`        | [optional] Extra HTTP headers as a JSON map (string).                                         | `{"X-Org":"camunda","X-Trace":"on"}` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
