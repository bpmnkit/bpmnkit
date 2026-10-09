# Back up and restore Optimize independently — Restore a backup — opensearch

```bash
curl -s "$OPENSEARCH_ENDPOINT/_snapshot/$OPENSEARCH_SNAPSHOT_REPOSITORY/_all" \
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

  

Ensure both `part_1_of_2` and `part_2_of_2` exist for your chosen backup ID before proceeding. An incomplete backup cannot be used for restore.

Once you have chosen the backup ID, set it as an environment variable for use in subsequent steps:

```bash
export BACKUP_ID=1748937221
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
