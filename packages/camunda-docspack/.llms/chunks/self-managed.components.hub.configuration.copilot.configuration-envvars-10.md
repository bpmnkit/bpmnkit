# Copilot — Configuration — envVars

| Environment variable                              | Description                                                              | Example value                | Default value |
| ------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------- | ------------- |
| `RESTAPI_COPILOT_ANTHROPIC_DEFAULT_MODEL_ID`      | Default model ID for Anthropic.                                          | `claude-3-5-sonnet-20240620` | -             |
| `RESTAPI_COPILOT_ANTHROPIC_API_KEY`               | Anthropic API key.                                                       | `sk-ant-**\*\*\*\***`        | -             |
| `RESTAPI_COPILOT_ANTHROPIC_CACHE_SYSTEM_MESSAGES` | [optional] Enable client-side caching of system messages (if supported). | `false`                      | `true`        |
| `RESTAPI_COPILOT_ANTHROPIC_CACHE_TOOLS`           | [optional] Enable client-side caching of tool schemas (if supported).    | `false`                      | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
