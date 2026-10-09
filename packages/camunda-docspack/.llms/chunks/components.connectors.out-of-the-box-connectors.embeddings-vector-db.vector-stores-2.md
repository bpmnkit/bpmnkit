# Vector Database connector — Vector stores (2)

**Info**
For more information about Azure Cosmos DB NoSQL vector search, refer to the [official documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/vector-search).  
Pay special attention to the vector dimensions limitations as stated in the documentation.

Two authentication methods are supported:

- **API key** – Authenticate using an Azure Cosmos DB key.
- **Client credentials** – Authenticate using a client ID and secret.  
  This requires registering an application in [Microsoft Entra ID](https://go.microsoft.com/fwlink/?linkid=2083908).

  Provide the following fields:
  - **Client ID** – The Microsoft Entra application ID.
  - **Client secret** – The application’s client secret.
  - **Tenant ID** – The Microsoft Entra tenant ID.
  - **Authority host** – _(Optional)_ The authority host URL. Defaults to `https://login.microsoftonline.com/`. Can also be an OAuth 2.0 token endpoint.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db
