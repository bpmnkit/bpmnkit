# Back up and restore Optimize independently — Restore a backup — elasticsearch

The following uses the [Elasticsearch snapshot API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-snapshot-restore) to restore a snapshot.

```bash
curl -XPOST "$ELASTIC_ENDPOINT/_snapshot/$ELASTIC_SNAPSHOT_REPOSITORY/$SNAPSHOT_NAME/_restore?wait_for_completion=true"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
