# Web applications backup management API — About this API

The Camunda web applications store their data over multiple indices in Elasticsearch. A backup of web application data includes several Elasticsearch snapshots containing sets of different indices. Each backup is identified by a `backupId`. For example, a backup with an ID of `123` may contain the following Elasticsearch snapshots:

```
camunda_webapps_123_8.8.0_part_1_of_6
camunda_webapps_123_8.8.0_part_2_of_6
camunda_webapps_123_8.8.0_part_3_of_6
camunda_webapps_123_8.8.0_part_4_of_6
camunda_webapps_123_8.8.0_part_5_of_6
camunda_webapps_123_8.8.0_part_6_of_6
```

All web applications provide the same API to perform a backup and manage backups (list, check state, delete). Restore a backup using the standard Elasticsearch API.

**Note**
The backup API can be reached via the Actuator management port, which default defaults to port 9600.

**Warning**
Usage of this API requires the backup store to be configured with the **same** repository name.

- [Operate configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/operate/operate-configuration#backups)
- [Tasklist configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-configuration#backups)

Additionally, it requires the same backup store to be configured on your chosen datastore.

- [Elasticsearch snapshot repository](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/manage-snapshot-repositories)
- [OpenSearch snapshot repository](https://docs.opensearch.org/docs/latest/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore/)

Web applications must have the right to take snapshots.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup
