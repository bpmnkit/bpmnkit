# Restore a backup with the Restore Application (RDBMS) — 1. Stop all Camunda components {#stop-all-camunda-components}

It is critical that no Camunda components (Zeebe, Operate, Tasklist, Optimize, Connectors) are running during the restore. Running components may propagate an incorrect cluster configuration, potentially disrupting cluster communication and data consistency.


## 2. Restore the RDBMS {#restore-rdbms}

Restore the RDBMS from its backup using your database vendor's native tools. The restored database must contain the entire Camunda schema.

Skip this step if the RDBMS was already restored another way, for example as part of a wider disaster recovery procedure.

Complete this step before you restore Zeebe. Each restore option below reads the exporter position from the restored RDBMS to determine which primary storage backup to restore from, so the RDBMS must already be in its target state.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
