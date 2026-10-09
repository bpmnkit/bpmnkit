# Copilot — Configuration — envVars

| Environment variable                        | Description                                                                    | Example value | Default value |
| ------------------------------------------- | ------------------------------------------------------------------------------ | ------------- | ------------- |
| `FEATURE_AI_ENABLED`                        | Enables Copilot.                                                               | `true`        | `false`       |
| `RESTAPI_BPMN_COPILOT_DEFAULT_LLM_PROVIDER` | Default provider for BPMN Copilot.                                             | `BEDROCK`     | –             |
| `RESTAPI_FEEL_COPILOT_DEFAULT_LLM_PROVIDER` | Default provider for FEEL Copilot.                                             | `OPENAI`      | –             |
| `RESTAPI_FORM_COPILOT_DEFAULT_LLM_PROVIDER` | Default provider for form Copilot.                                             | `VERTEX_AI`   | –             |
| `RESTAPI_COPILOT_REQUEST_TIMEOUT`           | [optional] Overall request timeout in milliseconds for Copilot requests in UI. | `200000`      | `300000`      |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
