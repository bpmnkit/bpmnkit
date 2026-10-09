# Copilot — Configuration — envVars

| Environment variable                        | Description                                                                        | Example value                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `RESTAPI_COPILOT_AZURE_AI_DEFAULT_MODEL_ID` | Default model for Azure AI (Inference).                                            | `gpt-4o-mini`                                                                     |
| `RESTAPI_COPILOT_AZURE_AI_ENDPOINT`         | Endpoint for Azure AI (Inference). Use the endpoint from `Azure AI Inference SDK`. | `https://********-resource.cognitiveservices.azure.com/openai/deployments/gpt-4o` |
| `RESTAPI_COPILOT_AZURE_AI_API_KEY`          | [conditionally required] API key for Azure AI (alternative to OAuth credentials).  | `az-ai-key-**\*\*\*\***`                                                          |
| `RESTAPI_COPILOT_AZURE_AI_CLIENT_ID`        | [conditionally required] Azure AI OAuth client ID.                                 | `00000000-0000-0000-0000-000000000000`                                            |
| `RESTAPI_COPILOT_AZURE_AI_CLIENT_SECRET`    | [conditionally required] Azure AI OAuth client secret.                             | `**\*\*\*\***`                                                                    |
| `RESTAPI_COPILOT_AZURE_AI_TENANT_ID`        | [conditionally required] Azure AD tenant ID for OAuth.                             | `11111111-2222-3333-4444-555555555555`                                            |
| `RESTAPI_COPILOT_AZURE_AI_AUTHORITY_HOST`   | [conditionally required] Authority host for Azure OAuth.                           | `https://login.microsoftonline.com`                                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
