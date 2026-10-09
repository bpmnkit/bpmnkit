# Supported environments — Component requirements

Requirements for components are as follows:

| Component                                                  | Java version  | Other requirements                                                                                                                                                                                                                                                                                                                                   |
| :--------------------------------------------------------- | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orchestration Cluster (Zeebe, Operate, Tasklist, Identity) | OpenJDK 21–25 | Elasticsearch 9.4+Elasticsearch 8.19+OpenSearch 3.6+OpenSearch 2.19+For supported relational databases and versions when using an RDBMS (for example, as secondary storage), see the [RDBMS version support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy)    |
| Optimize                                                   | OpenJDK 21–25 | Elasticsearch 9.4+Elasticsearch 8.19+OpenSearch 3.6+OpenSearch 2.19+                                                                                                                                                                                                                                    |
| Connectors                                                 | OpenJDK 21–25 | –                                                                                                                                                                                                                                                                                                                                                    |
| Management Identity                                        | OpenJDK 17+   | Keycloak 26.xPostgreSQL 14.x, 15.x, 16.x, 17.x (required for [certain features](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#database-configuration)), or Amazon Aurora PostgreSQL 13.x, 14.x, 15.x, 16.x, 17.xOracle 19cMicrosoft SQL Server 2019, 2022, 2025 |
| Camunda Hub                                                | –             | Supported relational databases and versions are defined in the [RDBMS version support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy)                                                                                                                                                              |

**Info: Optimize compatibility**
When running Optimize, make sure you use an [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter) or [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter) version that is compatible with your Optimize version.

**Info: RDBMS support**
For a complete list of supported RDBMS versions, JDBC driver information (bundled vs. user-supplied), and component compatibility when using relational databases as secondary storage, see the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

---
Source: https://docs.camunda.io/docs/next/reference/supported-environments
