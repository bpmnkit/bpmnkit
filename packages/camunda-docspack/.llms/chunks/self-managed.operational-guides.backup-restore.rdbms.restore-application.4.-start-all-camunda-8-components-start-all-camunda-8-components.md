# Restore a backup with the Restore Application (RDBMS) — 4. Start all Camunda 8 components {#start-all-camunda-8-components}

After both primary and secondary storage are restored, start all Camunda components. Ensure all components are configured to use the restored database instance and that the configuration matches the original deployment.

**Note**
After starting the components, monitor the logs for any errors or warnings. Components will reconcile their state with the restored data, which may take some time depending on the size of the data. When using RDBMS-aware or time range restore, Zeebe re-exports events from the backup's checkpoint position up to its current state, bringing the RDBMS up to date.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
