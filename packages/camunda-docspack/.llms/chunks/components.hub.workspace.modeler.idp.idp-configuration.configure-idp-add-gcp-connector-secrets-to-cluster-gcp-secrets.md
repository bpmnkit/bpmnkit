# Configure IDP — Configure IDP — Add GCP connector secrets to cluster {#gcp-secrets}

If you are using GCP as your cloud provider, add the following GCP connector secrets required for IDP. The secrets you need depend on which type of extraction you plan to use.

| Connector secret Key               | Required for Unstructured Extraction | Required for Structured Extraction | Description                                                                                                                                                |
| :--------------------------------- | :----------------------------------: | :--------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IDP_GCP_SERVICE_ACCOUNT`          |                 Yes                  |                Yes                 | The GCP service account JSON key file content for authentication with GCP services.                                                                        |
| `IDP_GCP_VERTEX_REGION`            |                 Yes                  |                 No                 | The GCP region where Vertex AI resources are located.Example: `us-central1`                                                                  |
| `IDP_GCP_VERTEX_PROJECT_ID`        |                 Yes                  |                 No                 | The Vertex project ID where Vertex AI resources are configured.Example: `my-gcp-project-id`                                                  |
| `IDP_GCP_VERTEX_BUCKET_NAME`       |                 Yes                  |                 No                 | The name of the Google Cloud Storage bucket for temporary document storage during Vertex AI analysis.Example: `idp-vertex-extraction-bucket` |
| `IDP_GCP_DOCUMENT_AI_REGION`       |                  No                  |                Yes                 | The GCP region where Document AI resources are located. Must be either `eu` or `us`.Example: `us`                                            |
| `IDP_GCP_DOCUMENT_AI_PROJECT_ID`   |                  No                  |                Yes                 | The DocumentAI project ID where Document AI resources are configured.Example: `my-gcp-project-id`                                            |
| `IDP_GCP_DOCUMENT_AI_PROCESSOR_ID` |                  No                  |                Yes                 | The Document AI processor ID for the specific processor you want to use for structured extraction.Example: `1234567890abcdef`                |

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration
