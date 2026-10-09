# Manage secondary storage — Configuring capacity and redundancy

Secondary storage configuration depends on the backend you choose (for example, a document-store backend such as Elasticsearch/OpenSearch, or an RDBMS). Both are valid options in supported scenarios. Use the documentation for your selected backend and validate decisions against your expected workload.

**Note**
Backend selection and sizing should be based on benchmarking and realistic workload expectations. Prefer configuration choices that you can validate with measured throughput, latency, and retention needs.

### Document-store backends (Elasticsearch/OpenSearch): shards and replicas

**Warning**
When Elasticsearch/OpenSearch Exporter indices and Orchestration Cluster indices share the same Elasticsearch or OpenSearch cluster, they must use different index prefixes. One prefix must not be the beginning of the other (for example, avoid `custom` and `custom-zeebe` together because `custom*` matches both). Do not use `operate`, `tasklist`, or `camunda` as the full exporter prefix, and do not use `zeebe-record` as the Orchestration Cluster index prefix, as `zeebe-record` is the default prefix for Elasticsearch/OpenSearch Exporter indices.

For detailed requirements, configuration examples, and common mistakes, see
[Index prefix configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices#index-prefix-configuration).

If you use [Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch) as your secondary storage backend, configure shards and replicas to support resilience and scalability.

#### Shards

Define shard count according to your data size and expected growth.

- Start with **1–5 primary shards** per index.
- More shards can improve scalability but increase management complexity.
- Avoid over-sharding, which can reduce performance and add unnecessary overhead.

#### Replicas

The default replica count for Elasticsearch/OpenSearch Exporter indices is `1`.

- **Single-node clusters:** Set `number-of-replicas: 0` explicitly. On a single node, replicas cannot be assigned to another node and remain unassigned, causing the cluster to report yellow health. This is expected behavior but may trigger monitoring alerts.

- **Multi-node clusters:** The default of `1` replica ensures fault tolerance. Keep or increase this value based on your availability requirements.

**Note**
Each replica stores a full copy of the primary shard data, so one replica per index approximately doubles the total disk required for those indices. Account for replica storage when [sizing your Elasticsearch/OpenSearch cluster](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#elasticsearch-scaling).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/managing-secondary-storage
