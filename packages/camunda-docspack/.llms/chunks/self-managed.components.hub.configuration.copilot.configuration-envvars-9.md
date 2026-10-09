# Copilot — Configuration — envVars

| Environment variable                         | Description                                     | Example value                                                                                |
| -------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `RESTAPI_COPILOT_VERTEX_AI_DEFAULT_MODEL_ID` | Default model ID for Google Vertex AI (Gemini). | `gemini-1.5-pro-002`                                                                         |
| `RESTAPI_COPILOT_VERTEX_AI_PROJECT_ID`       | GCP project ID for Vertex AI.                   | `my-gcp-project`                                                                             |
| `RESTAPI_COPILOT_VERTEX_AI_LOCATION`         | Vertex AI location or region.                   | `us-central1`                                                                                |
| `RESTAPI_COPILOT_VERTEX_AI_CREDENTIALS_JSON` | Vertex AI service account JSON (string).        | `{"type":"service_account","project_id":"my-proj","client_email":"...","private_key":"..."}` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
