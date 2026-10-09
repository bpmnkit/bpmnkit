# Restore scenarios

Use practical restore playbooks for common SaaS recovery situations.

Camunda Enterprise

Use these scenarios to standardize how your team runs restore operations in SaaS.

**Note: Related pages**

- [Backup and restore overview](https://docs.camunda.io/docs/next/components/saas/backup-restore-overview)
- [Restore a cluster from backup](https://docs.camunda.io/docs/next/components/saas/how-to-restore)
- [Restore troubleshooting](https://docs.camunda.io/docs/next/components/saas/restore-troubleshooting)


## Recover from data corruption

Use this when cluster data is inconsistent after an operational incident.

### Steps

1. Identify the last known-good backup.
2. Confirm the backup is in `Completed` state.
3. Start restore from Hub.
4. Wait for cluster to return to healthy state.
5. Validate process execution and key business variables in Operate.

### Verification checklist

- New process instances can start.
- Existing process data is readable.
- No restore error notification remains.

---
Source: https://docs.camunda.io/docs/next/components/saas/restore-scenarios
