# Data retention — Data cleanup

The amount of stored data can grow significantly over time. Therefore, we recommend implementing a data cleanup strategy.
Dated indices, which contain only finished process instances, may be safely removed from Elasticsearch/OpenSearch.

In the Orchestration Cluster, strategies for the deletion of archived data can be defined via the [retention configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter.md?configuration=retention#options).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/data-retention
