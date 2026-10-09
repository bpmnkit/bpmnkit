# Back up and restore Optimize independently — Restore a backup — elasticsearch

```bash
for index in $(curl -s "$ELASTIC_ENDPOINT/_cat/indices?h=index" | grep optimize); do
  echo "Deleting index: $index"
  curl -X DELETE "$ELASTIC_ENDPOINT/$index"
done
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
