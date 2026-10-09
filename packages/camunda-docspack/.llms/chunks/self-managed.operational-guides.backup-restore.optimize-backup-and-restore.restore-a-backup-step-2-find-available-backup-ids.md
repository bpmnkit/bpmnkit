# Back up and restore Optimize independently — Restore a backup — Step 2: Find available backup IDs

With Optimize running from the previous step, identify which backups are available. You can query either the Optimize management API or the snapshot repository directly.

**Using the Optimize management API:**

```bash
curl -s "$OPTIMIZE_MANAGEMENT_API/actuator/backups"
```

  Example response

```json
[
  {
    "backupId": 1748937221,
    "state": "COMPLETE",
    "details": [
      {
        "snapshotName": "camunda_optimize_1748937221_<optimize-version>_part_1_of_2",
        "state": "SUCCESS",
        "startTime": "2025-06-03T07:53:54.389+0000",
        "failures": []
      },
      {
        "snapshotName": "camunda_optimize_1748937221_<optimize-version>_part_2_of_2",
        "state": "SUCCESS",
        "startTime": "2025-06-03T07:53:54.389+0000",
        "failures": []
      }
    ]
  }
]
```

**Alternatively, query the snapshot repository directly.** Optimize snapshot names follow the pattern `camunda_optimize_{backupId}_{version}_part_N_of_2`.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
