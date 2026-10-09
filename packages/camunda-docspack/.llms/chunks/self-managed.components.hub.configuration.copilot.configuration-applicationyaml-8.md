# Copilot — Configuration — applicationYaml

| Property                                                  | Description                                                                        | Example value                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `camunda.hub.copilot.providers.azure-ai.default-model-id` | Default model for Azure AI (Inference).                                            | `gpt-4o-mini`                                                                     |
| `camunda.hub.copilot.providers.azure-ai.endpoint`         | Endpoint for Azure AI (Inference). Use the endpoint from `Azure AI Inference SDK`. | `https://********-resource.cognitiveservices.azure.com/openai/deployments/gpt-4o` |
| `camunda.hub.copilot.providers.azure-ai.api-key`          | [conditionally required] API key for Azure AI (alternative to OAuth credentials).  | `az-ai-key-***`                                                                   |
| `camunda.hub.copilot.providers.azure-ai.client-id`        | [conditionally required] Azure AI OAuth client ID.                                 | `00000000-0000-0000-0000-000000000000`                                            |
| `camunda.hub.copilot.providers.azure-ai.client-secret`    | [conditionally required] Azure AI OAuth client secret.                             | `***`                                                                             |
| `camunda.hub.copilot.providers.azure-ai.tenant-id`        | [conditionally required] Azure AD tenant ID for OAuth.                             | `11111111-2222-3333-4444-555555555555`                                            |
| `camunda.hub.copilot.providers.azure-ai.authority-host`   | [conditionally required] Authority host for Azure OAuth.                           | `https://login.microsoftonline.com`                                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
