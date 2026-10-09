# Backups — Restore from backup

### Prepare replacement cluster

**Warning**
Always use the same or the next minor version of Zeebe that you were using when taking the backup.
Using a different version may result in data corruption or data loss.
See the [upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/index) for more details.

Ensure your replacement cluster has the same number of brokers as the old cluster and uses the [same node IDs](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster#configuration).

### Shutting down all brokers in the replacement cluster

Before installing the backup, ensure all brokers are fully shut down.

### Installing the backup

To install the backup, take the following steps:

1. Delete the existing data folder on each broker of your replacement cluster.
2. For each broker, copy over the configuration and the data folder.
3. You may need to slightly adjust the configuration for your replacement cluster, for example to update IP addresses.

### Starting the Zeebe cluster

After replacing the data folders, brokers can be started again and will automatically resume with processing.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backups
