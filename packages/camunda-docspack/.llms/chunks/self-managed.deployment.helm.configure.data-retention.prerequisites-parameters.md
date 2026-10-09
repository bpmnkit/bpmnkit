# Configure data retention — Prerequisites — Parameters

**Zeebe records retention parameters:**

| Key                                  | Type    | Default                         | Description                                                                                                                                                                                                      |
| ------------------------------------ | ------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orchestration.retention.enabled`    | boolean | `false`                         | If `true`, creates and applies the ILM/ISM policy to Zeebe record indices. **Requires the legacy Zeebe exporter to be enabled** (see prerequisites above).                                                       |
| `orchestration.retention.minimumAge` | string  | `30d`                           | How old the data must be before deletion. Uses [Elasticsearch TimeUnit format](https://www.elastic.co/guide/en/elasticsearch/reference/current/api-conventions.html#time-units) (for example, `30d`, `7d`, `1h`) |
| `orchestration.retention.policyName` | string  | `zeebe-record-retention-policy` | Name of the ILM/ISM policy to create and apply                                                                                                                                                                   |

**Note: Exported data vs. retained data**

The `orchestration.retention` policy always applies to the Zeebe record indices that are actually written (for example, `zeebe-record-*`). If you configure exporter-side filters in the legacy Elasticsearch or OpenSearch exporter (such as exporting only a subset of variables or processes for data analysis tools like Optimize), retention policies apply only to data that was exported. They do not recreate or restore records that were filtered out by exporter-side filters.

For Optimize and other data-analysis use cases, coordinate exporter-side filters and retention settings, and refer to:

- [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter)
- [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter)
- [Camunda 8 system configuration (Optimize)](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8)

**History archiving and retention parameters:**

| Key                                                      | Type    | Default                                  | Description                                                                                                                                    |
| -------------------------------------------------------- | ------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `orchestration.history.waitPeriodBeforeArchiving`        | string  | `1h`                                     | Grace period before archiving completed processes. Processes finished within this window are not yet archived.                                 |
| `orchestration.history.rolloverInterval`                 | string  | `1d`                                     | Time range for creating dated indices (for example, `1d` creates daily indices).                                                               |
| `orchestration.history.rolloverBatchSize`                | integer | `500`                                    | Maximum number of process instances selected for archiving per run. Defaults to 500 when `archiveByIdEnabled` is `true`, and 100 when `false`. |
| `orchestration.history.archiveByIdEnabled`               | boolean | `true`                                   | When `true`, archiving moves documents in small, targeted batches.                                                                             |
| `orchestration.history.reindexBatchSize`                 | integer | `2500`                                   | Number of individual Elasticsearch/OpenSearch documents archived in each targeted batch when `archiveByIdEnabled` is `true`.                   |
| `orchestration.history.elsRolloverDateFormat`            | string  | `date`                                   | Date format for historical indices in Java DateTimeFormatter syntax                                                                            |
| `orchestration.history.delayBetweenRuns`                 | integer | `2000`                                   | Millisecond interval between archiver runs                                                                                                     |
| `orchestration.history.maxDelayBetweenRuns`              | integer | `60000`                                  | Maximum millisecond interval between archiver runs due to failure backoffs                                                                     |
| `orchestration.history.retention.enabled`                | boolean | `false`                                  | If `true`, applies ILM/ISM policy to archived orchestration indices (Operate, Tasklist, Camunda)                                               |
| `orchestration.history.retention.minimumAge`             | string  | `30d`                                    | How old archived data must be before deletion                                                                                                  |
| `orchestration.history.retention.policyName`             | string  | `camunda-history-retention-policy`       | Name of the ILM/ISM policy for historical data                                                                                                 |
| `orchestration.history.retention.usageMetricsMinimumAge` | string  | `730d`                                   | Retention period for usage metrics indices (2 years by default)                                                                                |
| `orchestration.history.retention.usageMetricsPolicyName` | string  | `camunda-usage-metrics-retention-policy` | Name of the ILM/ISM policy for usage metrics                                                                                                   |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
