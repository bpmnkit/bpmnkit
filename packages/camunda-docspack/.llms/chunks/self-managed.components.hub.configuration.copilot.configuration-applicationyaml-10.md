# Copilot — Configuration — applicationYaml

| Property                                                        | Description                                                              | Example value                | Default value |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------- | ------------- |
| `camunda.hub.copilot.providers.anthropic.default-model-id`      | Default model ID for Anthropic.                                          | `claude-3-5-sonnet-20240620` | -             |
| `camunda.hub.copilot.providers.anthropic.api-key`               | Anthropic API key.                                                       | `sk-ant-***`                 | -             |
| `camunda.hub.copilot.providers.anthropic.cache-system-messages` | [optional] Enable client-side caching of system messages (if supported). | `false`                      | `true`        |
| `camunda.hub.copilot.providers.anthropic.cache-tools`           | [optional] Enable client-side caching of tool schemas (if supported).    | `false`                      | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
