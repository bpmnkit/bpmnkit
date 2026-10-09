# Camunda Exporter — Configuration — bulk

Helm property path prefix for these options:
`camunda.data.secondary-storage.{elasticsearch|opensearch}.bulk.`

To avoid too many expensive requests to the Elasticsearch/OpenSearch cluster, the exporter performs batch
updates by default. The size of the batch, along with how often it should be flushed (regardless of
size) can be controlled by configuration.

| Option | Description                                                                                                                                                    | Default |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| delay  | Delay, in seconds, before force flush of the current batch. This ensures that even when we have low traffic of records, we still export every once in a while. | `1`     |
| size   | The amount of records a batch should have before we flush the batch.                                                                                           | `1000`  |

With the default configuration, the exporter will aggregate records and flush them to Elasticsearch/OpenSearch:

1. When it has aggregated 1000 records.
2. One seconds have elapsed since the last flush (regardless of how many
   records were aggregated).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
