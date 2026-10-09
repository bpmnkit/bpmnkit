# Restore a backup with the Restore Application — 2. Restore the Zeebe cluster {#restore-zeebe-cluster} — manual

To restore a Zeebe Cluster, run the following in each node where the broker will be running:

```bash
mkdir -p camunda
tar -xzf camunda-zeebe-X.Y.Z.tar.gz --strip-components=1 -C camunda/
./camunda/bin/restore --backupId=<backupId>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
