# Vector Database connector — HTTP proxy configuration

In Self-Managed environments, the Vector Database connector supports routing HTTP requests through an HTTP proxy. This applies to both embedding model API calls and vector store connections.

The Vector Database connector supports [plain proxy variables](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration#plain-proxy-variables) in addition to the standard connector proxy variables. Refer to the [HTTP proxy configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration) page for the full list of environment variables and configuration options.

The following providers do not support connector proxy variables, but respect standard [JVM proxy properties](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration#jvm-properties):

- Google VertexAI (embedding model).
- Azure AI Search (vector store).

The following providers do not support proxy configuration:

- Azure Cosmos DB NoSQL (vector store).

To disable proxy support entirely (for example, if only an HTTPS-based proxy is available), set the following environment variable:

```bash
CAMUNDA_CONNECTOR_VECTORDB_HTTP_PROXYSUPPORT_ENABLED=false
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db
