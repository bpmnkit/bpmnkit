# Copilot — Configuration — applicationYaml

| Property                                                | Description                                                    | Example value | Default value |
| ------------------------------------------------------- | -------------------------------------------------------------- | ------------- | ------------- |
| `camunda.hub.feature.ai-enabled`                        | Enables Copilot.                                               | `true`        | `false`       |
| `camunda.hub.copilot.default-bpmn-copilot-llm-provider` | Default provider for BPMN Copilot.                             | `BEDROCK`     | –             |
| `camunda.hub.copilot.default-feel-copilot-llm-provider` | Default provider for FEEL Copilot.                             | `OPENAI`      | –             |
| `camunda.hub.copilot.default-form-copilot-llm-provider` | Default provider for form Copilot.                             | `VERTEX_AI`   | –             |
| `camunda.hub.client.copilot-request-timeout`            | [optional] Overall request timeout for Copilot requests in UI. | `200s`        | `300s`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
