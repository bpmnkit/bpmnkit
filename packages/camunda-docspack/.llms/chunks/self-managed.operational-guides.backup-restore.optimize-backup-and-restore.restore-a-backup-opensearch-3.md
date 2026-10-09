# Back up and restore Optimize independently — Restore a backup — opensearch

```bash
for index in $(curl -s "$OPENSEARCH_ENDPOINT/_cat/indices?h=index" | grep optimize); do
  echo "Deleting index: $index"
  curl -X DELETE "$OPENSEARCH_ENDPOINT/$index"
done
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
