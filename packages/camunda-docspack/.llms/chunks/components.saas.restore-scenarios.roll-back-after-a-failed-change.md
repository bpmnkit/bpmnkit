# Restore scenarios — Roll back after a failed change

Use this when a recent change caused severe impact and you need to return to a known-good state quickly.

### Steps

1. Select the backup created before the failed change.
2. Start restore and monitor status until completion.
3. Validate core process paths and integration health.
4. Re-plan the failed change after root-cause analysis.

### Verification checklist

- Incident volume returns to baseline.
- Critical process KPIs recover.
- Cluster status remains healthy after restore.


## Run a quarterly DR test

Use this to validate operational readiness and runbook quality.

### Steps

1. Define test scope, acceptance criteria, and observer roles.
2. Pick a representative backup for restore rehearsal.
3. Execute restore using the same production runbook.
4. Record timings, blockers, and remediation actions.
5. Update internal runbooks based on lessons learned.

### Verification checklist

- Team can execute end-to-end without escalation.
- Recovery timing is captured and reviewed.
- Follow-up actions are documented and assigned.

---
Source: https://docs.camunda.io/docs/next/components/saas/restore-scenarios
