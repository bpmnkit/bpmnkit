# Install Camunda with Helm — Choose your secondary storage

This decision is independent of your topology. Both apply to every release that runs an Orchestration Cluster.

| Backend                     | Guide                                                                                                                          | Best for                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Elasticsearch or OpenSearch | [Using external Elasticsearch](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch) | High throughput, and any deployment that uses Optimize |
| Relational database         | [Install with RDBMS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms)                                                                                     | Organizations that standardize on relational databases |
| Embedded H2                 | [Quick install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install)                                                                                            | Evaluation only. Single broker, not for production     |

**Warning**
Optimize requires Elasticsearch or OpenSearch and can't read from a relational database. An Orchestration Cluster on RDBMS secondary storage can be analyzed with Optimize only if it also exports its records to a separate Elasticsearch or OpenSearch instance, and Optimize is deployed against that instance.

For the trade-offs between backends, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/index
