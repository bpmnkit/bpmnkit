# Copilot — Configuration — envVars

| Environment variable                                | Description                                                                    | Example value | Default value |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | ------------- | ------------- |
| `CAMUNDA_HUB_FEATURE_AIENABLED`                     | Enables Copilot.                                                               | `true`        | `false`       |
| `CAMUNDA_HUB_COPILOT_DEFAULTBPMNCOPILOTLLMPROVIDER` | Default provider for BPMN Copilot.                                             | `BEDROCK`     | –             |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMPROVIDER` | Default provider for FEEL Copilot.                                             | `OPENAI`      | –             |
| `CAMUNDA_HUB_COPILOT_DEFAULTFORMCOPILOTLLMPROVIDER` | Default provider for form Copilot.                                             | `VERTEX_AI`   | –             |
| `CAMUNDA_HUB_CLIENT_COPILOTREQUESTTIMEOUT`          | [optional] Overall request timeout in milliseconds for Copilot requests in UI. | `200000`      | `300000`      |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
