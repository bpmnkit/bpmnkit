# Copilot — Configuration — envVars

| Environment variable                       | Description                                                                                   | Example value                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| `RESTAPI_COPILOT_OPEN_AI_DEFAULT_MODEL_ID` | Default model ID for OpenAI provider.                                                         | `gpt-4.1`                            |
| `RESTAPI_FEELCOPILOT_API_KEY`              | [conditionally required] API key for OpenAI public API.                                       | `sk-live-********`                   |
| `RESTAPI_COPILOT_OPENAI_ENDPOINT`          | [conditionally required] Custom endpoint for OpenAI-compatible APIs (proxies or self-hosted). | `https://my-proxy.example.com/v1`    |
| `RESTAPI_COPILOT_OPENAI_BEARER`            | [optional] Bearer token header to use instead of `api-key` with compatible gateways.          | `my-shared-bearer-token`             |
| `RESTAPI_COPILOT_OPENAI_USERNAME`          | [optional] Username to authenticate with an OpenAI-compatible gateway.                        | `api_user`                           |
| `RESTAPI_COPILOT_OPENAI_PASSWORD`          | [optional] Password to authenticate with an OpenAI-compatible gateway.                        | `s3cr3t`                             |
| `RESTAPI_COPILOT_OPENAI_HEADERS`           | [optional] Extra HTTP headers as a JSON map (string).                                         | `{"X-Org":"camunda","X-Trace":"on"}` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
