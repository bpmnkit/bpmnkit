# Configure secondary storage with Docker Compose — Document-store environment variables

Use these variables when you adapt the Elasticsearch and OpenSearch examples:

| Variable                                                | Use                                                        |
| :------------------------------------------------------ | :--------------------------------------------------------- |
| `CAMUNDA_DATA_SECONDARY_STORAGE_TYPE`                   | Selects `elasticsearch` or `opensearch`.                   |
| `CAMUNDA_DATA_SECONDARY_STORAGE_ELASTICSEARCH_URL`      | Endpoint for Elasticsearch.                                |
| `CAMUNDA_DATA_SECONDARY_STORAGE_ELASTICSEARCH_USERNAME` | Username for Elasticsearch when authentication is enabled. |
| `CAMUNDA_DATA_SECONDARY_STORAGE_ELASTICSEARCH_PASSWORD` | Password for Elasticsearch when authentication is enabled. |
| `CAMUNDA_DATA_SECONDARY_STORAGE_OPENSEARCH_URL`         | Endpoint for OpenSearch.                                   |

For additional secondary storage settings, see [Configure secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage) and [Configure RDBMS for manual installations](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
