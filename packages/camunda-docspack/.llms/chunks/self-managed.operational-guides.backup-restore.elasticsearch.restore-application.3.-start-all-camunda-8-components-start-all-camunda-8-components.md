# Restore a backup with the Restore Application — 3. Start all Camunda 8 components {#start-all-camunda-8-components}

Now that you have actively restored Elasticsearch/OpenSearch and the Zeebe cluster partitions, you can start all components again and use Camunda 8 as normal.

For example:

- For Kubernetes, apply Helm values for normal startup and explicitly set `ZEEBE_RESTORE=false`. Also, keep your backup-store environment variables configured as outlined in the prerequisites.

```yaml
orchestration:
  enabled: true
  env:
    - name: ZEEBE_RESTORE
      value: "false"
    # all the envs related to the backup store as outlined in the prerequisites
    - name: CAMUNDA_DATA_BACKUP_STORE
      value: "S3" # just as an example
    - name: CAMUNDA_DATA_BACKUP_REPOSITORYNAME
      value: camunda # Change to name of the repository in Elasticsearch/OpenSearch
```

Ensure restore-only settings are not present in this final configuration (for example, `SPRING_PROFILES_ACTIVE=restore`, `ZEEBE_RESTORE_FROM_BACKUP_ID`, or a temporary restore command override).

- For a manual setup, execute the broker and all other components in their normal way.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
