# Vector Database connector — Vector stores

Enter the following parameters:

- **Base URL** – The Elasticsearch base URL, including protocol, for example `https://host:port`.
- **Username** – For the Elasticsearch user that has read/write access.
- **Password** – For the Elasticsearch user that has read/write access.
- **Index name** – Name of the index where you wish to store embeddings.
  - When embedding: If the index is not present, the connector will create a new one.
  - When retrieving: If the index is absent, the connector will raise an error.

**Important**
The Elasticsearch version must be 8+.

Enter the following parameters:

- **Base URL** – The OpenSearch base URL, including protocol, for example `https://host:port`.
- **Username** – For the OpenSearch user that has read/write access.
- **Password** – For the OpenSearch user that has read/write access.
- **Index name** – Name of the index where you wish to store embeddings.
  - When embedding: If the index is not present, the connector will create a new one.
  - When retrieving: If the index is absent, the connector will raise an error.

Enter the following parameters:

- **Access key** and **Secret key** – Enter AWS IAM credentials for the user that has read/write access.
- **Server URL** – An Amazon OpenSearch URL _without_ protocol, for example `my-opensearch.aws.com:port`.
- **Region** – Region of the Amazon OpenSearch instance.
- **Index name** – Name of the index where you wish to store embeddings.
  - When embedding: If the index is not present, the connector will create a new one.
  - When retrieving: If the index is absent, the connector will raise an error.

Enter the following parameters:

- **Endpoint** – The Azure AI Search endpoint URL, for example `https://<your-resource-name>.search.windows.net/`.
- **Authentication** – Select the authentication type for connecting to Azure AI Search.
- **Index name** – Name of the index where embeddings will be stored.
  - When embedding: If the index is not present, the connector will create it.
  - When retrieving: If the index is absent, the connector will raise an error.

Two authentication methods are supported:

- **API key** – Authenticate using an Azure AI Search key.
- **Client credentials** – Authenticate using a client ID and secret.  
  This requires registering an application in [Microsoft Entra ID](https://go.microsoft.com/fwlink/?linkid=2083908) and assigning the [required roles](https://learn.microsoft.com/en-us/azure/search/search-security-rbac).  
  Role-based access control must be explicitly enabled for the Azure AI Search resource.

  Provide the following fields:
  - **Client ID** – The Microsoft Entra application ID.
  - **Client secret** – The application’s client secret.
  - **Tenant ID** – The Microsoft Entra tenant ID.
  - **Authority host** – _(Optional)_ The authority host URL. Defaults to `https://login.microsoftonline.com/`. This can also be an OAuth 2.0 token endpoint.

Enter the following parameters:

- **Endpoint** – The Azure Cosmos DB NoSQL endpoint URL, for example `https://<your-resource-name>.documents.azure.com/`.
- **Authentication** – Select the authentication type for connecting to Azure Cosmos DB NoSQL.
- **Database name** – The name of the Azure Cosmos DB NoSQL database.
- **Container name** – The name of the Azure Cosmos DB NoSQL container.  
  _Note:_ The container must already exist and have an `/id` partition key.
- **Consistency level** – The consistency level for the container. Defaults to `Eventual`.
- **Distance function** – The distance function to use for vector similarity search. Defaults to `Cosine`.
- **Vector index type** – The vector index type to use. Defaults to `Flat`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db
