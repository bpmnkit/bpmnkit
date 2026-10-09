# Back up and restore Optimize independently — Restore a backup — opensearch

The following uses the [OpenSearch snapshot API](https://docs.opensearch.org/docs/latest/api-reference/snapshots/restore-snapshot/) to restore a snapshot.

```bash
curl -XPOST "$OPENSEARCH_ENDPOINT/_snapshot/$OPENSEARCH_SNAPSHOT_REPOSITORY/$SNAPSHOT_NAME/_restore?wait_for_completion=true"
```

   

Where `$SNAPSHOT_NAME` would be any of the following based on our example in [find available backup IDs](#step-2-find-available-backup-ids).

Ensure that all snapshots correspond to the same backup ID and restore them one by one.

```bash
camunda_optimize_1748937221_<optimize-version>_part_1_of_2
camunda_optimize_1748937221_<optimize-version>_part_2_of_2
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
