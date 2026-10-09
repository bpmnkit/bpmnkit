# Camunda backup creation (RDBMS) — Verify your backup setup

After configuring backups, verify that they are working correctly by querying the [backup state actuator](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#request-runtime-state):

```bash
curl 'http://localhost:9600/actuator/backupRuntime/state'
```

Confirm the following in the response:

- **`backupStates`** contains an entry for each partition, indicating that at least one backup has been taken.
- **`ranges`** contains at least one range per partition. Each range has a `start` and `end` timestamp defining the time period you can restore from.
- If you see **multiple ranges** for a single partition, there is a gap between them where no data is available for restore.

If the response is empty or missing partitions, check your backup store configuration and ensure continuous backups are enabled.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
