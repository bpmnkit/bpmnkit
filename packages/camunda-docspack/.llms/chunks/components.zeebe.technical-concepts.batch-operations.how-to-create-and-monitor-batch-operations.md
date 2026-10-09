# Batch operations — How to create and monitor batch operations

You can create batch operations using:

- **[Operate UI](https://docs.camunda.io/docs/next/components/operate/operate-introduction)**: Start batch operations directly from the Operate interface for process instances and incidents
- **[Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview)**: REST endpoints to create, manage, and monitor batches programmatically
- **[Camunda Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started)**: APIs for batch operations in Java applications

**Warning: Important for Operate users**
When you start a batch operation from Operate UI, the actual instances processed may differ from those displayed in the filter preview. The batch operation uses filter criteria to query the secondary database at execution time, and results may have changed since the preview was generated. The count is fixed when the batch starts and will not include instances created afterward.

**Note**
Lifecycle management (suspend, resume, cancel) is only available via the REST API and Java client, not through Operate UI. More features may be added in future Operate versions.

### Technical monitoring

Batch operation performance can be tracked via [Grafana dashboards](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics#grafana).

**Key metrics to monitor:**

- Initialization time and success rate
- Execution throughput and latency
- Error rates by type and partition
- Resource utilization during batch processing
- Secondary database query performance

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
