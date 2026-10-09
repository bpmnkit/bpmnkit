# Vector Database connector — Embedding models

The **Vector Database connector** supports [Amazon Titan V1 and V2 models](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html).  
You can also specify any custom model that supports text embedding and is available in your Amazon Bedrock account.

To use Amazon Bedrock as an embedding model, provide:

- **Access key** – Access key for a user with permissions for the Amazon Bedrock `InvokeModel` action.
- **Secret key** – Secret key for the user associated with the provided access key.
- **Region** – AWS region where the model is hosted (for example, `us-east-1`). See [AWS model region support](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html) for details.
- **Model name** – One of:
  - **Amazon Titan V1** – `amazon.titan-embed-text-v1`
  - **Amazon Titan V2** – `amazon.titan-embed-text-v2:0`
  - **Custom model** – Name of your custom Amazon Bedrock embedding model.

When using Amazon Titan V2, you can also specify:

- **Embedding dimensions** – Number of dimensions for the embedding vector.
- **Normalize** – Whether to normalize the embedding vector. See [AWS blog](https://aws.amazon.com/blogs/aws/amazon-titan-text-v2-now-available-in-amazon-bedrock-optimized-for-improving-rag/) for more details.

For all models, the following parameter is optional:

- **Max retries** – Maximum number of retries for the embedding request in case of failure.

To use OpenAI as an embedding model, provide:

- **API key** – Your OpenAI account API key for authorization.
- **Model name** – The OpenAI model to use for embeddings. See the [OpenAI documentation](https://platform.openai.com/docs/guides/embeddings) for available models.

Optional parameters include:

- **Organization ID** – For projects accessed through a legacy user API key, specify the organization ID for API requests with this connector.
- **Project ID** – For projects accessed through a legacy user API key, specify the project ID for API requests with this connector.
- **Embedding dimensions** – Number of dimensions for the embedding vector. If not specified, the default value for the selected model is used.
- **Custom headers** – Additional headers to include in the request.
- **Custom base URL** – Base URL for API requests when using a custom OpenAI endpoint.
- **Max retries** – Maximum number of retries for the embedding request in case of failure.

To use Azure OpenAI as an embedding model, provide:

- **Endpoint** – The Azure OpenAI endpoint URL, for example `https://<your-resource-name>.openai.azure.com/`.
- **Authentication** – Select the authentication type to use with Azure OpenAI.

Optional parameters include:

- **Embedding dimensions** – Number of dimensions for the embedding vector. If not specified, the default value for the selected model is used.
- **Custom headers** – Additional headers to include in the request.
- **Max retries** – Maximum number of retries for the embedding request in case of failure.

Two authentication methods are supported:

- **API key** – Authenticate using an Azure OpenAI API key from the [Azure AI Foundry portal](https://ai.azure.com/).
- **Client credentials** – Authenticate using a client ID and secret. This requires registering an application in [Microsoft Entra ID](https://go.microsoft.com/fwlink/?linkid=2083908). Provide:
  - **Client ID** – The Microsoft Entra application ID.
  - **Client secret** – The application’s client secret.
  - **Tenant ID** – The Microsoft Entra tenant ID.
  - **Authority host** – _(Optional)_ The authority host URL. Defaults to `https://login.microsoftonline.com/`. Can also be an OAuth 2.0 token endpoint.

To use Google Vertex AI as an embedding model, provide:

- **Project ID** – The Google Cloud project ID.
- **Region** – The [region](https://cloud.google.com/vertex-ai/docs/general/locations#feature-availability) where AI inference should take place.
- **Authentication** – Select the authentication type for connecting to Google Cloud.
- **Model name** – The Vertex AI model to use for embeddings. Refer to the [Vertex AI documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/embeddings) for available models.
- **Embedding dimensions** – Number of dimensions for the embedding vector. Consult the documentation for the selected model for valid ranges.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db
