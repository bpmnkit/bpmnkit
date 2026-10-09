# Data retention — Archive period

The time between a process instance finishing and being moved to a dated index can be configured using the [waitPeriodBeforeArchiving](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter#configurations) parameter. Refer to that configuration for the current default value.


## Archive by ID

When `archiveByIdEnabled` is `true` (the default), archiving moves documents in small, targeted batches instead of all matching records at once. Archiving continues incrementally until every document for the selected process instances reaches the relevant dated indices.

The core archiving concept is unchanged: data still moves to the same dated destination indices (for example, `operate-variable_2020-01-01`). Archiving by ID uses fewer resources, which improves stability.

`rolloverBatchSize` controls how many process instances are selected per run, and `reindexBatchSize` controls how many individual Elasticsearch/OpenSearch documents are archived in each targeted batch. When `archiveByIdEnabled` is `true`, `rolloverBatchSize` defaults to 500 (and to 100 when `false`); keep `rolloverBatchSize` at 500 or higher to maintain a healthy pipeline of data.

See [history archiving settings](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter.md?configuration=history#options) for the full configuration reference.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/data-retention
