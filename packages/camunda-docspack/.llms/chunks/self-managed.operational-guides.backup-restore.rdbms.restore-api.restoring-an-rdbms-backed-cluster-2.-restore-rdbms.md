# Restore a backup with the Restore API (RDBMS) — Restoring an RDBMS-backed cluster — 2. Restore RDBMS

With the cluster in recovery mode, nothing is exported to secondary storage, so restore the RDBMS now. Skip this step if the RDBMS was already restored another way, for example as part of a wider disaster recovery procedure.

Restore the RDBMS to the point in time you intend to restore the primary storage to. Camunda aligns the Zeebe and RDBMS restore points automatically.

Complete this step before you trigger the Zeebe restore. The Restore API switches the brokers back to `PROCESSING` as soon as the last partition is restored, and processing then resumes against whatever secondary storage is in place.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
