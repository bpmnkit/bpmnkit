# Manage secondary storage — Monitoring secondary storage health

Use the [Data Layer Dashboard](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics) to monitor performance and detect issues with your secondary storage integration.

For example:

- Track exporter and indexing latency.
- Detect shard or replica imbalances for document-store backends (Elasticsearch/OpenSearch).
- Identify degraded query performance early across secondary storage backends (document-store or RDBMS).


## Advanced: Elasticsearch deprecation logging

If you are using Elasticsearch version ≥8.16.0, you may want to turn off deprecation logging to reduce log noise:

```bash
curl -X PUT "http://localhost:9200/_cluster/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "persistent": {
      "logger.org.elasticsearch.deprecation": "OFF"
    }
  }'
```

This is optional but can help keep logs clean in production environments.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/managing-secondary-storage
