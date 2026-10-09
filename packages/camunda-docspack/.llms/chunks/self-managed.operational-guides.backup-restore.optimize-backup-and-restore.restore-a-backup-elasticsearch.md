# Back up and restore Optimize independently — Restore a backup — elasticsearch

```bash
curl -s "$ELASTIC_ENDPOINT/_index_template" \
  | jq -r '.index_templates[].name' \
  | grep optimize \
  | sort
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
