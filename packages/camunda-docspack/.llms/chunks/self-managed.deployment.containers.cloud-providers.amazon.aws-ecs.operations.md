# Deploy to Amazon ECS — Operations

### Backup and restore

The general [backup and restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) applies.

The backup process, itself, doesn't require changes.

Restoring, however, introduces additional complexity because each broker's data directory (persistent volume) must be restored in a coordinated manner. To support this, an init container is introduced as part of the Orchestration Cluster, responsible for restoring the data directory for the broker running in that task. This mechanism corresponds to the step of [restoring the Zeebe Cluster](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application#restore-zeebe).

This approach is implemented in the example module. Set the `restore_enabled` parameter to `true` to enable it. You can optionally provide the `restore_backup_id` parameter to target a specific backup (see [restore options when using RDBMS](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application#restore-options)).

On startup, the init container leverages the node-id provider to determine its broker ID in alignment with the other tasks. It restores the partitions associated with that broker, then blocks execution until all brokers have completed their restore operations. Afterward, the init container exits, allowing the Orchestration Cluster container to start.

You must configure the init container and the Orchestration Cluster container identically. If you use environment variables, this requirement is automatically satisfied. If configuration is distributed through other mechanisms, those must also be explicitly applied to the init container.

As long as the `restore_enabled` parameter remains set to `true`, the init container remains part of the task definition. After the backup has been successfully restored, subsequent executions will effectively be no-ops until the parameter is removed.

**Note**
Camunda recommends restoring to a fresh cluster rather than reusing an existing one. A newly created cluster already has an empty S3 bucket and EFS volume, so no additional cleanup is needed. If you choose to restore into an existing cluster instead, you must manually ensure the S3 bucket configured for the node ID provider is empty and the EFS volume is fully cleared before starting the restore.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
