# Camunda 8 reference architectures — Architecture — Secondary storage architecture

Choose the secondary storage architecture before you finalize a production deployment pattern. This decision applies across manual, containerized, and Kubernetes deployments.

For production, use an external managed service or an externally operated database cluster whenever possible. Camunda does not manage database high availability, failover, backups, or lifecycle operations for you.

#### Production topology baseline

For a production Orchestration Cluster, use these baseline assumptions regardless of deployment method:

- Run at least three brokers across three availability zones for high availability. On Kubernetes, the default anti-affinity rule alone does not enforce zonal placement — see [high availability](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#high-availability-ha).
- Use one secondary storage backend family for the Orchestration Cluster's web applications and APIs.
- Keep the secondary storage backend in the same region as the Orchestration Cluster to reduce latency and failure domains.
- Treat secondary storage as part of your production data layer, with its own backup, monitoring, and scaling plan.

#### Compare Elasticsearch/OpenSearch and RDBMS

Both backend families are supported for production in the right scenarios. Choose based on query patterns, operational preferences, and component requirements.

| Topic                              | Elasticsearch/OpenSearch                                                              | RDBMS                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Best fit                           | Search-heavy, filter-heavy, analytics-heavy workloads                                 | Teams that prefer relational database operations and moderate query workloads                                                |
| Write throughput profile           | Higher write throughput in published comparison tests                                 | Lower write throughput than Elasticsearch/OpenSearch in current published tests                                              |
| Read/query profile                 | Better suited for broad filtering, sorting, aggregations, and dashboard-style queries | Better suited for key-based access and moderate query workloads; broad filters and statistics queries need closer validation |
| Optimize support                   | Required for Optimize                                                                 | Optimize still requires Elasticsearch or OpenSearch                                                                          |
| Operational model                  | Adds a document-store technology to your stack                                        | Reuses standard relational database tooling and operational practices                                                        |
| Migration between backend families | Not supported as an in-place production migration                                     | Not supported as an in-place production migration                                                                            |

Use benchmarking and workload validation before choosing a backend for production. For current published PostgreSQL results and caveats, see [RDBMS benchmark results](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/rdbms-benchmark-results). For general capacity planning, see [sizing your environment](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment).

#### Backend-specific guidance

Choose Elasticsearch/OpenSearch when:

- You expect heavy search, filtering, sorting, or dashboard-style query workloads.
- You need Optimize and want to avoid running two secondary storage technologies.
- You want the strongest current fit for large query-heavy environments.

Choose RDBMS when:

- You already operate relational databases at scale and want to align with existing tooling.
- Your workloads are moderate and you can validate query performance with production-like data.
- You prefer a relational secondary storage model for Orchestration Cluster APIs and web applications.

If you deploy Optimize with RDBMS-based secondary storage, plan for both backends: RDBMS for the Orchestration Cluster and Elasticsearch or OpenSearch for Optimize.

For supported versions and configuration details, see:

- [Secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index)
- [Configure secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage)
- [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy)
- [Supported environments](https://docs.camunda.io/docs/next/reference/supported-environments)

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture
