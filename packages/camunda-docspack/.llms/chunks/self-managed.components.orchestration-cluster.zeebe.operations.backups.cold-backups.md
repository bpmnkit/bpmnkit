# Backups — Cold backups

Cold backups, also called offline backups, require **downtime**.

During the downtime, processes don't make progress and clients can't communicate with Zeebe.
To make sure that the downtime doesn't cause issues for your clients, you should test how your clients behave during the downtime, or shut them down as well.

### Shutting down all brokers in the cluster

To take a consistent backup, all brokers must be shut down first.

As soon as brokers shut down, partitions become unhealthy and clients lose connections to Zeebe or experience full backpressure.
To prevent unnecessary failovers during the shutdown process, we recommend shutting down all brokers at the same time instead of a gradual shutdown.

Wait for all brokers to fully shut down before proceeding to the next step.

### Creating the backup

**Note**
The `data` folder contains symbolic and hard links which may require special attention when copying, depending on your environment.

To create the backup, take the following steps:

1. Each broker has a data folder where all state is persisted. The location of the data folder is [configured](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration) via `zeebe.broker.data.directory`. Create a copy of the data folder and store it in a safe location.

If you have direct access to the broker, for example in a bare-metal setup, you can do this by creating a tarball like this: `tar caf backup.tar.gz data/`.

You may also use filesystem snapshots or [Kubernetes volume snapshots](https://kubernetes.io/docs/concepts/storage/volume-snapshots/) if that fits your environment better

2. Double-check that your tool of choice supports symbolic and hard links.
3. Do not merge or otherwise modify data folders as this might result in data loss and unrestorable backups.
4. Save the broker configuration to ensure the replacement cluster can process the backed-up data.

See the following example on how a backup may look:

```bash
$ tree zeebe-backup-*
zeebe-backup-2021-01-31
├── zeebe-broker-0-config.yml
├── zeebe-broker-0-data.tar.gz
├── zeebe-broker-1-config.yml
├── zeebe-broker-1-data.tar.gz
├── zeebe-broker-2-config.yml
└── zeebe-broker-2-data.tar.gz
```

### Resuming

After taking the backup, brokers can be started again and will automatically resume with processing.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backups
