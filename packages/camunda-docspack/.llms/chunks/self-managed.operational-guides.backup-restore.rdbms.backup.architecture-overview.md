# Camunda backup creation (RDBMS) — Architecture overview

When Camunda uses an RDBMS as **secondary storage**, backups involve **two independent systems**:

- **Zeebe (primary storage)**: Backs up its internal state (log stream, snapshots) to an external blob store (S3, GCS, Azure, or filesystem). These are called **primary storage backups**.
- **The external RDBMS**: Backed up using your database vendor's native tools (pg_dump, mysqldump, RMAN, and similar). This is the **secondary storage backup**.

During restore, Zeebe uses the exporter position stored in the RDBMS to find the correct primary storage backup, or backups, that match the RDBMS state. This ensures consistency between the two systems without requiring synchronized backup timing.

**Tip**
While Zeebe during restore will match the secondary storage's backup position, it is recommended to have the backups taken at similar intervals. This minimizes the time required after restore for Zeebe to re-export events to the secondary storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
