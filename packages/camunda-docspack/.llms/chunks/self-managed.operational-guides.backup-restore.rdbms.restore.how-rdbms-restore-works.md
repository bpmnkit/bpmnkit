# Restore a backup (RDBMS) — How RDBMS restore works

As described in the [architecture overview](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup#architecture-overview), backups involve two independent systems: **primary storage backups** (Zeebe's log stream and snapshots in a blob store) and the **secondary storage backup** (the RDBMS).

During restore, Zeebe reads the **exporter position** from the restored RDBMS — the last log stream position that was successfully exported — and uses it to determine which primary storage backup, or backups, to restore from. This ensures that Zeebe's state is at least as advanced as what the RDBMS contains. After restart, Zeebe re-exports any events between the RDBMS position and its restored checkpoint position, bringing the secondary storage up to date.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore
