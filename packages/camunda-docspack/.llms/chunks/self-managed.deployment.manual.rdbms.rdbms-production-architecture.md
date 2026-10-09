# Production architecture for Camunda 8 with RDBMS

Reference architecture for deploying Camunda 8 Self-Managed in production using an external RDBMS as secondary storage.

Apply RDBMS secondary storage to a **manual deployment**. For the canonical production architecture and trade-off guidance across manual, containerized, and Kubernetes deployments, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture).


## Manual deployment baseline

For manual production deployments with RDBMS, use these baseline decisions:

- Run at least three brokers across three availability zones for high availability.
- Use an external supported RDBMS for the Orchestration Cluster's secondary storage.
- Keep the database in the same region as the Orchestration Cluster.
- Use managed database services or vendor-supported high-availability mechanisms when possible.

For backend selection trade-offs, Optimize requirements, and Elasticsearch/OpenSearch versus RDBMS comparison guidance, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/rdbms-production-architecture
