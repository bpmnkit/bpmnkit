# Camunda backup creation (RDBMS) — Backing up RDBMS

Back up the RDBMS as described in the [prerequisites](#prerequisites). While exact synchronization with Zeebe backups is not required, as the restore process handles alignment automatically, keeping backup intervals similar minimizes the time Zeebe needs to re-export events after a restore.

During restore, Zeebe reads the **exporter position** from the `EXPORTER_POSITION` table — which records the last Zeebe log stream position exported to the RDBMS — to determine which primary storage backup to restore from.


## (Optional) Back up Optimize data {#back-up-optimize-data}

If you are using Optimize alongside an RDBMS-backed Orchestration Cluster, Optimize must be backed up independently. Optimize always stores its data in Elasticsearch or OpenSearch, regardless of what the Orchestration Cluster uses as secondary storage.

See [back up and restore Optimize independently](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore) for the complete procedure.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
