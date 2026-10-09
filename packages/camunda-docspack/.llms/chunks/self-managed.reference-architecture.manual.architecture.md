# Manual deployment overview — Architecture

![Single JAR](./img/manual-single.jpg)

This above diagram illustrates a single-machine deployment using the single JAR package. While simple and effective for lightweight setups, scaling to multiple machines requires careful planning.

### High Availability (HA)

![HA JAR](./img/manual-ha.jpg)

For high availability, a minimum of three machines is recommended to ensure fault tolerance and enable master election in case of failures. Refer to the [clustering documentation](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering) to learn more about the raft protocol and clustering concepts.

### Components

The Orchestration Cluster is packaged as a single JAR file and includes the following components:

- [Zeebe](https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview)
- [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction)
- [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist)
- [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview)

It facilitates:

1. **gRPC communication**: For client workers.
2. **HTTP endpoints**: Used by the Orchestration Cluster REST API and Web UI.

Both types of endpoints can be routed through a load balancer to maintain availability, ensuring that the system remains accessible even if a machine becomes unavailable. While using a load balancer is optional, it is recommended for enhanced availability and security. Alternatively, you can expose static machines, ports, and IPs directly. However, direct exposure is generally discouraged due to security concerns.

Connectors expose additional HTTP(s) endpoints for handling incoming webhooks, which can also be routed through the same HTTP load balancer.

The Orchestration Cluster relies on a configured [secondary storage](https://docs.camunda.io/docs/next/reference/glossary#secondary-storage) backend for indexing and search. Depending on your deployment and configuration, this backend can use a document-store backend ([Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch)) or an [RDBMS](https://docs.camunda.io/docs/next/reference/glossary#rdbms) for supported scenarios.

**Note**
Secondary storage is configurable. For backend trade-offs and production guidance, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture). For RDBMS configuration details, see [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration) and the glossary entry [RDBMS](https://docs.camunda.io/docs/next/reference/glossary#rdbms).

Components within the Orchestration Cluster communicate seamlessly, particularly:

- **Zeebe brokers** exchange data over gRPC endpoints for efficient inter-broker communication.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual
