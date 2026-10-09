# OpenSearch exporter — Configuration — bulk

To avoid too many expensive requests to the OpenSearch cluster, the exporter performs batch updates by default. The size of the batch, along with how often it should be flushed (regardless of size) can be controlled by configuration.

| Option       | Description                                                                                                                                                    | Default            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| delay        | Delay, in seconds, before force flush of the current batch. This ensures that even when we have low traffic of records, we still export every once in a while. | `5`                |
| size         | The amount of records a batch should have before we flush the batch.                                                                                           | `1000`             |
| memory-limit | The size of the batch, in bytes, before we flush the batch.                                                                                                    | `10485760` (10 MB) |

With the default configuration, the exporter would aggregate records and flush them to OpenSearch either:

1. When it has aggregated 1000 records.
2. When the batch memory size exceeds 10 MB.
3. Five seconds have elapsed since the last flush (regardless of how many records were aggregated).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter
