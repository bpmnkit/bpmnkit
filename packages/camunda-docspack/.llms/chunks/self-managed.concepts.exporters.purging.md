# Camunda exporters — Purging

The data purge feature allows you to delete all historical (and runtime) data from your cluster. Therefore every
exporter needs to implement the `Exporter#purge` method.

When a purge is happening, the `Exporter#purge` method is called. This method:

- Deletes all data exported so far.
- Is blocking and only returns when all data has been deleted.
- May be retried and therefore must be idempotent.

When the purge cluster operation is executed, the following steps are taken:

- All nodes leave existing partitions resulting in a cluster with no partitions. This means all exporters are closed.
  At this point all runtime data is deleted.
- For all previously configured exporters, the following steps are executed sequentially for each exporter:
  - It is configured via `Exporter#configure(Context)`
  - The `Exporter#purge` method is called.
  - The exporter is closed via `Exporter#close`.
- Partitions are bootstrapped and nodes rejoin the partitions with the same configuration as before the purge.

**Note**
`Exporter#open(Context)` is not called during the purge operation.

When an exporter is purged, it is expected to delete all data, but not schemas.
In the case that an exporter exports to a database, only the records are deleted, not the tables themselves.

**Note**
All resources required for purging need to be closed afterwards to avoid memory leaks.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
