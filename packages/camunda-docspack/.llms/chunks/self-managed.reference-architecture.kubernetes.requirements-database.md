# Kubernetes deployment overview — Requirements — Database

The following databases are required:

| Database                                  | Requirement                                                                                                                                           |
| :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Secondary storage (Orchestration Cluster) | Elasticsearch or OpenSearch (document store) in this topology, or a supported RDBMS as an alternative. Optimize requires Elasticsearch or OpenSearch. |
| PostgreSQL                                | Required by Management Identity and Camunda Hub. Also required by Keycloak if deployed in-cluster.                                                    |

**Info: OpenSearch support**
Camunda 8 supports both [Amazon OpenSearch](https://aws.amazon.com/opensearch-service) and the open-source [OpenSearch](https://opensearch.org/) distribution.

For backend trade-offs and production guidance, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture). For more general context, see the [reference architecture overview](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#architecture).

Sizing is use case dependent. It is crucial to conduct thorough load testing and benchmarking to determine the appropriate sizing for your specific environment and workload.

**Note: Secondary storage disk requirements**
Secondary storage is customer-managed, and the same disk expectations apply to both backend families. Provision it with sufficient resources and use performant SSD-backed disks, because disk latency directly impacts export throughput and overall cluster performance.

- Elasticsearch/OpenSearch: see [Elasticsearch scaling](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#elasticsearch-scaling) for disk type and sizing guidance.
- RDBMS: see [secondary storage considerations](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#secondary-storage-considerations) for sizing guidance. An RDBMS scales vertically rather than horizontally, so size the instance and its storage with more initial headroom.

Once deployed, the included [Grafana dashboard](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics#grafana) can be used with [Prometheus](https://prometheus.io/) to monitor for bottlenecks when exporting data from the Orchestration Cluster to your database.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
