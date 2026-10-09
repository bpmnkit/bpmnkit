# Back up and restore Optimize independently — Restore a backup — elasticsearch

```bash
curl -s "$ELASTIC_ENDPOINT/_snapshot/$ELASTIC_SNAPSHOT_REPOSITORY/_all" \
  | jq -r '.snapshots[].snapshot' \
  | grep "^camunda_optimize_"
```

  Example output

```
camunda_optimize_1748937221_<optimize-version>_part_1_of_2
camunda_optimize_1748937221_<optimize-version>_part_2_of_2
camunda_optimize_1749130104_<optimize-version>_part_1_of_2
camunda_optimize_1749130104_<optimize-version>_part_2_of_2
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
