# Web applications backup management API — Create backup API

During backup creation, web applications can continue running. To create the backup, call the following endpoint:

```
POST actuator/backupHistory
{
  "backupId": <backupId>
}
```

**Note**
For backward compatibility, the endpoint `actuator/backups` is available if the component is running standalone.

Response:

| Code             | Description                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 200 OK           | Backup was successfully started, snapshots will be created asynchronously. List of snapshots is returned in the response body (see example below). This list must be persisted together with the backup ID to be able to restore it later. |
| 400 Bad Request  | In case something is wrong with `backupId`, e.g. the same backup ID already exists.                                                                                                                                                        |
| 500 Server Error | All other errors, e.g. ES returned error response when attempting to create a snapshot.                                                                                                                                                    |
| 502 Bad Gateway  | Elasticsearch is not accessible, the request can be retried when it is back.                                                                                                                                                               |

Example request:

```shell
curl --request POST 'http://localhost:9600/actuator/backupHistory' \
-H 'Content-Type: application/json' \
-d '{ "backupId": 123 }'
```

Example response:

```json
{
  "scheduledSnapshots": [
    "camunda_webapps_123_8.8.0_part_1_of_6",
    "camunda_webapps_123_8.8.0_part_2_of_6",
    "camunda_webapps_123_8.8.0_part_3_of_6",
    "camunda_webapps_123_8.8.0_part_4_of_6",
    "camunda_webapps_123_8.8.0_part_5_of_6",
    "camunda_webapps_123_8.8.0_part_6_of_6"
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup
