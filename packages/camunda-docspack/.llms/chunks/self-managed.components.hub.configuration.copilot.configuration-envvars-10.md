# Copilot — Configuration — envVars

| Environment variable                                          | Description                                                              | Example value                | Default value |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------- | ------------- |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_ANTHROPIC_DEFAULTMODELID`      | Default model ID for Anthropic.                                          | `claude-3-5-sonnet-20240620` | -             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_ANTHROPIC_APIKEY`              | Anthropic API key.                                                       | `sk-ant-***`                 | -             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_ANTHROPIC_CACHESYSTEMMESSAGES` | [optional] Enable client-side caching of system messages (if supported). | `false`                      | `true`        |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_ANTHROPIC_CACHETOOLS`          | [optional] Enable client-side caching of tool schemas (if supported).    | `false`                      | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
