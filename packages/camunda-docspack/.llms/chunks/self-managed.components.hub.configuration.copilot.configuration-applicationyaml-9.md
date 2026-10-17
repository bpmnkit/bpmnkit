# Copilot — Configuration — applicationYaml

| Property                                                   | Description                                     | Example value                                                                                |
| ---------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `camunda.hub.copilot.providers.vertex-ai.default-model-id` | Default model ID for Google Vertex AI (Gemini). | `gemini-1.5-pro-002`                                                                         |
| `camunda.hub.copilot.providers.vertex-ai.project-id`       | GCP project ID for Vertex AI.                   | `my-gcp-project`                                                                             |
| `camunda.hub.copilot.providers.vertex-ai.location`         | Vertex AI location or region.                   | `us-central1`                                                                                |
| `camunda.hub.copilot.providers.vertex-ai.credentials-json` | Vertex AI service account JSON (string).        | `{"type":"service_account","project_id":"my-proj","client_email":"...","private_key":"..."}` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
