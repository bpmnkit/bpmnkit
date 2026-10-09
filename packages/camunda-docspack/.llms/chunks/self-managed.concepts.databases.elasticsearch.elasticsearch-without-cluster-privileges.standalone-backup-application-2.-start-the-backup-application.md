# Elasticsearch without cluster privileges — Standalone backup application — 2. Start the backup application

Start the Java application `backup-webapps` (or `backup-webapps.bat` on Windows), located in the `bin` folder of the delivered JAR package.

This application requires a `<backupID>` argument—a unique identifier of type `java.lang.Long`, used as part of the snapshot names.  
To learn more, see the [backup and restore guide](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).

Assuming your custom configuration is saved in a file named `backup-manager.yaml`, start the application using the following command:

```shell
SPRING_CONFIG_ADDITIONALLOCATION=/path/to/backup-manager.yaml ./bin/backup-webapps <backupID>
```

The standalone application will log the current state of the backup every five seconds until it completes.

Verify that the application executed successfully.

Example output logs:

```
11:42:13.713 [main] INFO  i.c.a.StandaloneBackupManager - Snapshot observation:
11:42:13.714 [main] INFO  i.c.a.StandaloneBackupManager - Indices snapshot is COMPLETED. Details: [GetBackupStateResponseDto{backupId=12345, state=COMPLETED, failureReason='null', details=[GetBackupStateResponseDetailDto{snapshotName='camunda_webapps_12345_snapshot_part_1_of_7', state='SUCCESS', startTime=2025-06-25T11:42:08.495+02:00, failures=null}, GetBackupStateResponseDetailDto{snapshotName='camunda_webapps_12345_snapshot_part_2_of_7', state='SUCCESS', startTime=2025-06-25T11:42:08.695+02:00, failures=null}, GetBackupStateResponseDetailDto{snapshotName='camunda_webapps_12345_snapshot_part_3_of_7', state='SUCCESS', startTime=2025-06-25T11:42:08.897+02:00, failures=null}, GetBackupStateResponseDetailDto{snapshotName='camunda_webapps_12345_snapshot_part_4_of_7', state='SUCCESS', startTime=2025-06-25T11:42:08.897+02:00, failures=null}, GetBackupStateResponseDetailDto{snapshotName='camunda_webapps_12345_snapshot_part_5_of_7', state='SUCCESS', startTime=2025-06-25T11:42:08.897+02:00, failures=null}, GetBackupStateResponseDetailDto{snapshotName='camunda_webapps_12345_snapshot_part_6_of_7', state='SUCCESS', startTime=2025-06-25T11:42:09.097+02:00, failures=null}, GetBackupStateResponseDetailDto{snapshotName='camunda_webapps_12345_snapshot_part_7_of_7', state='SUCCESS', startTime=2025-06-25T11:42:09.097+02:00, failures=null}]}]
11:42:13.714 [main] INFO  i.c.a.StandaloneBackupManager - Backup with id:[12345] is completed!
```

The backup manager creates a backup of Elasticsearch data. The backup includes several Elasticsearch snapshots containing sets of Camunda, Operate and Tasklist indices.

For example, a backup with an ID of `123` might contain the following Elasticsearch snapshots:

```
camunda_webapps_123_8.8.0_part_1_of_7
camunda_webapps_123_8.8.0_part_2_of_7
camunda_webapps_123_8.8.0_part_3_of_7
camunda_webapps_123_8.8.0_part_4_of_7
camunda_webapps_123_8.8.0_part_5_of_7
camunda_webapps_123_8.8.0_part_6_of_7
camunda_webapps_123_8.8.0_part_7_of_7
```

Once completed, you can proceed with step 7 of the [backup procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#backup-process).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
