# Restore a backup with the Restore Application — 1. Restore Elasticsearch/OpenSearch snapshots {#restore-es-snapshots-step} — 4. Delete all indices

Now that you have successfully restored the templates and stopped the components adding more indices, you must delete the existing indices to be able to successfully restore the snapshots (otherwise these will block a successful restore).

**Warning**
If multiple physical tenants are configured, make sure to delete the indices corresponding to the required tenant by specifying the proper prefix.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
