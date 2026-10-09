# Restore troubleshooting

Troubleshoot restore failures by phase, symptom, and corrective action.

Camunda Enterprise

Use this guide to diagnose and recover from restore failures.

**Note: Related pages**

- [Backup and restore overview](https://docs.camunda.io/docs/next/components/saas/backup-restore-overview)
- [Restore a cluster from backup](https://docs.camunda.io/docs/next/components/saas/how-to-restore)
- [Restore scenarios](https://docs.camunda.io/docs/next/components/saas/restore-scenarios)


## Common restore phases

Restore operations pass through these phases:

- `VALIDATING`
- `DeleteData`
- `EnterRestoreMode`
- `RestoreSnapshots`
- `ExitRestoreMode`


## Failure modes and actions

| Phase              | Typical symptom                                                      | Likely cause                                                                                                                  | Recommended action                                                                                                                |
| ------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `VALIDATING`       | Restore request fails quickly with validation error                  | Backup is not complete, backup is legacy (missing `generationUuid`), partition count mismatch, or restore already in progress | Select a completed non-legacy backup, confirm partition compatibility, and retry after any active restore reaches terminal state. |
| `DeleteData`       | Restore fails after initiation and cluster returns to previous state | Internal destructive phase could not complete safely                                                                          | Retry once after verifying cluster health; if repeated, contact support with restore ID and timestamps.                           |
| `EnterRestoreMode` | Cluster remains unavailable and restore does not progress            | Controller/operator state transition did not complete                                                                         | Check cluster status history and activity context, then contact support with restore ID.                                          |
| `RestoreSnapshots` | Restore progresses but fails before completion                       | Snapshot restore failure, backend storage issue, or compatibility issue                                                       | Retry with a different backup if available. If all fail, contact support and provide failed restore IDs.                          |
| `ExitRestoreMode`  | Restore appears complete but final healthy state is delayed or fails | Post-restore reconciliation did not complete                                                                                  | Wait for reconciliation window, then re-check cluster health. If still degraded, contact support with restore metadata.           |

<!-- TODO(restore-from-backup): Add exact user-visible error messages and final API error payload examples per phase once backend/frontend error mapping is finalized. -->

---
Source: https://docs.camunda.io/docs/next/components/saas/restore-troubleshooting
