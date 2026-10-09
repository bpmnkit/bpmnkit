# Vector Database connector — Embedding models (2)

Optional parameters include:

- **Publisher** – The publisher of the Vertex AI model. Defaults to `google` if not specified.
- **Max retries** – Maximum number of retries for the embedding request in case of failure.

Two authentication methods are supported:

- **Service Account Credentials** – Authenticate using a [service account](https://cloud.google.com/iam/docs/service-account-overview) key in JSON format.
- **Application Default Credentials (ADC)** – Authenticate using the default credentials available in your environment.  
  This method is only supported in Self-Managed or hybrid environments.  
  To set up ADC in a local development environment, follow the instructions [here](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db
