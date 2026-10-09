# Restore a backup with the Restore Application — 2. Restore the Zeebe cluster {#restore-zeebe-cluster} — kubernetes

Assuming you're using the official [Camunda Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install), you'll have to adjust your Helm `values.yml` to supply the following temporarily.

It will overwrite the start command of the resulting Zeebe pod, executing a restore script.
It's important that the backup is configured for Zeebe to be able to restore from the backup!

```yaml
orchestration:
  enabled: true
  env:
    # Environment variables to overwrite the Zeebe startup behavior
    - name: SPRING_PROFILES_ACTIVE
      value: "restore"
    - name: ZEEBE_RESTORE
      value: "true"
    - name: ZEEBE_RESTORE_FROM_BACKUP_ID
      value: "$BACKUP_ID" # Change the $BACKUP_ID to your actual value
    # all the envs related to the backup store as outlined in the prerequisites
    - name: CAMUNDA_DATA_BACKUP_STORE
      value: "S3" # just as an example
    - name: CAMUNDA_DATA_BACKUP_REPOSITORYNAME
      value: camunda # Change to name of the repository in Elasticsearch/OpenSearch
    ...

# If you use Elasticsearch from the embedded Helm chart, set this to true. Otherwise, set it to false.
elasticsearch:
  enabled: true
connectors:
  enabled: false
optimize:
  enabled: false
```

**Note: Alternative command overwrite**

Use this alternative approach to restore Zeebe partitions:

```yaml
orchestration:
  enabled: true
  command:
    - "/usr/local/camunda/bin/restore"
    - "--backupId=$BACKUP_ID" # Change the $BACKUP_ID to your actual value.
  env:
    - name: SPRING_PROFILES_ACTIVE
      value: "restore"
   # All the envs related to the backup store as outlined in the prerequisites
   ...
```

If you're not using the Camunda Helm chart, you can use a similar approach natively with Kubernetes to overwrite the command.

The application exits after restore and Kubernetes restarts the pod, which appears as `CrashLoopBackOff`. This is expected behavior. The restore application does not restore state again once partitions are already restored to persistent disk.

After removing the temporary restore command, or unsetting `ZEEBE_RESTORE` and the related restore environment variables to restore Zeebe's default behavior, you may optionally restart the StatefulSet to ensure the changes take effect immediately. This can be done by [scaling](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_scale/) the StatefulSet down and back up, or by [deleting](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/) the pods so they are recreated with the newly deployed revision.

**Tip**
In Kubernetes, Zeebe runs as a [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/), which is intended for long-running, persistent applications. Because StatefulSet pods are restarted automatically, restore-mode pods can appear in `CrashLoopBackOff` after a successful restore. Observe Zeebe Broker logs during restore. If a pod has already restarted, use `--previous` to view logs from the completed restore run:

```bash
kubectl logs <zeebe-pod-name> --previous
```

The restore app will not import or overwrite data again, but you may miss the first successful run if you are not observing logs actively.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
