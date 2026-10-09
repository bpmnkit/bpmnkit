# Copilot — Configuration — envVars

| Environment variable                                   | Description                                                                        | Example value                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_AZUREAI_DEFAULTMODELID` | Default model for Azure AI (Inference).                                            | `gpt-4o-mini`                                                                     |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_AZUREAI_ENDPOINT`       | Endpoint for Azure AI (Inference). Use the endpoint from `Azure AI Inference SDK`. | `https://********-resource.cognitiveservices.azure.com/openai/deployments/gpt-4o` |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_AZUREAI_APIKEY`         | [conditionally required] API key for Azure AI (alternative to OAuth credentials).  | `az-ai-key-***`                                                                   |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_AZUREAI_CLIENTID`       | [conditionally required] Azure AI OAuth client ID.                                 | `00000000-0000-0000-0000-000000000000`                                            |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_AZUREAI_CLIENTSECRET`   | [conditionally required] Azure AI OAuth client secret.                             | `***`                                                                             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_AZUREAI_TENANTID`       | [conditionally required] Azure AD tenant ID for OAuth.                             | `11111111-2222-3333-4444-555555555555`                                            |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_AZUREAI_AUTHORITYHOST`  | [conditionally required] Authority host for Azure OAuth.                           | `https://login.microsoftonline.com`                                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
