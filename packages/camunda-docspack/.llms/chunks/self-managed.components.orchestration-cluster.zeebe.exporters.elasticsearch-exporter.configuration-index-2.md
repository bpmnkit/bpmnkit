# Elasticsearch exporter — Configuration — index (2)

**Note**
The number of shards varies by index template. Most indices use `1` shard by default. The following high-volume index templates default to `3` shards:

- `zeebe-record-job`
- `zeebe-record-process-instance`
- `zeebe-record-user-task`

If you set `number-of-shards`, it overrides the template defaults for all indices, including the three listed above.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter
