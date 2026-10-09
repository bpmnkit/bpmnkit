# Back up and restore Optimize independently — Restore a backup — opensearch

```bash
curl -s "$OPENSEARCH_ENDPOINT/_index_template" \
  | jq -r '.index_templates[].name' \
  | grep optimize \
  | sort
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
