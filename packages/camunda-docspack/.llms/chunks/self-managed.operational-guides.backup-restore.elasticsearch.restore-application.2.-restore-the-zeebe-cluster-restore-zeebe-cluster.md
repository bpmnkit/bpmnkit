# Restore a backup with the Restore Application — 2. Restore the Zeebe cluster {#restore-zeebe-cluster}

Restore the Zeebe partitions by running the Restore Application on every node where a Zeebe Broker will run.

**Note**
During the restoration of the Elasticsearch / OpenSearch state, we had to temporarily deploy Zeebe. This will have resulted in persistent volumes on Kubernetes and a filled data directory on each Zeebe Broker in case of a manual deployment.

In the case of Kubernetes to remove all related persistent volumes.

```bash
kubectl get pvc -o custom-columns=NAME:.metadata.name --no-headers \
  | grep zeebe \
  | while read pvc; do
      kubectl delete pvc "$pvc"
    done
```

New persistent volumes will be created on a new Camunda Helm chart upgrade and install.

In case of a manual deployment, this means to remove the data directory of each Zeebe Broker.

Camunda provides a standalone app which must be run on each node where a Zeebe Broker will be running. This is a Spring Boot application similar to the broker and can run using the binary provided as part of the distribution. The app can be configured the same way a broker is configured - via environment variables or using the configuration file located in `config/application.yaml`.

**Warning**
When restoring, provide the same configuration (node id, data directory, cluster size, and replication count) as the broker that will be running in this node. The partition count **must be same** as in the backup.

The amount of partitions backed up are also visible in the backup store of Zeebe; see the available backups of Zeebe partitions you found when [finding available backup IDs](#find-available-backup-ids) above.
If brokers were dynamically scaled between backup and restore, this is not an issue - as long as the partition count remains unchanged.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
