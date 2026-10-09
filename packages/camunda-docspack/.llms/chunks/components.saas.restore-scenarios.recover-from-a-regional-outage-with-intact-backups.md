# Restore scenarios — Recover from a regional outage with intact backups

Use this when platform services recover but your cluster data requires restoration from a known backup.

### Steps

1. Confirm the outage state is resolved for your target cluster region.
2. Select the most recent valid backup.
3. Execute same-cluster restore.
4. Validate connectivity and application recovery.
5. Communicate recovery completion to stakeholders.

### Verification checklist

- Cluster endpoints are reachable.
- Applications reconnect without endpoint reconfiguration.
- Business-critical process flows are operational.

---
Source: https://docs.camunda.io/docs/next/components/saas/restore-scenarios
