# Copilot — Configuration — envVars

| Environment variable                                     | Description                                     | Example value                                                                                |
| -------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_VERTEXAI_DEFAULTMODELID`  | Default model ID for Google Vertex AI (Gemini). | `gemini-1.5-pro-002`                                                                         |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_VERTEXAI_PROJECTID`       | GCP project ID for Vertex AI.                   | `my-gcp-project`                                                                             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_VERTEXAI_LOCATION`        | Vertex AI location or region.                   | `us-central1`                                                                                |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_VERTEXAI_CREDENTIALSJSON` | Vertex AI service account JSON (string).        | `{"type":"service_account","project_id":"my-proj","client_email":"...","private_key":"..."}` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
