# Restore troubleshooting — Activity and audit interpretation

For each restore, capture:

- Who initiated the restore
- Which backup was selected
- Start and completion timestamps
- Final terminal state (`COMPLETED`, `FAILED`, or `ABORTED`)

Use this record for incident timelines and post-incident review.


## Common mistakes

- Restoring a backup without confirming partition count compatibility.
- Starting restore during other cluster mutation activities.
- Assuming restore is non-destructive for current cluster data.
- Running restore without a validated rollback/runbook plan.


## When to contact support

Contact support when:

- Restore repeatedly fails with the same backup and a newer valid backup is not available.
- Cluster does not return to healthy status after terminal restore state.
- You suspect data integrity issues after a reported successful restore.

Include restore ID, cluster ID, selected backup ID, timeframe, and screenshots of status and errors.

---
Source: https://docs.camunda.io/docs/next/components/saas/restore-troubleshooting
