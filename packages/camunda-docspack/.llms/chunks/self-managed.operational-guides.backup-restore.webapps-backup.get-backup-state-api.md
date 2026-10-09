# Web applications backup management API — Get backup state API

As a backup is created asynchronously, call the following endpoint to check the state of the backup:

```
GET actuator/backupHistory/{backupId}
```

**Note**
For backward compatibility, the endpoint `actuator/backups` is available if the component is running standalone.

Response:

| Code             | Description                                                                             |
| ---------------- | --------------------------------------------------------------------------------------- |
| 200 OK           | Backup state could be determined and is returned in the response body.                  |
| 404 Not Found    | Backup with given ID does not exist.                                                    |
| 500 Server Error | All other errors, e.g. ES returned error response when attempting to execute the query. |
| 502 Bad Gateway  | Elasticsearch is not accessible, the request can be retried when it is back.            |

For example, the request could look like this:

```shell
curl 'http://localhost:9600/actuator/backupHistory/123'
```

Example response:

```json
{
  "backupId": 123,
  "state": "COMPLETED",
  "failureReason": null,
  "details":  [
    //here goes the list of all Elasticsearch snapshots included in the backup
    {
      "snapshotName": "camunda_webapps_123_8.8.0_part_1_of_6",
      "state": "SUCCESS",
      "startTime": "2023-01-01T10:10:10.100+0000",
      "failures": []
    },
    <..>
  ]
}
```

Possible **states** of the backup:

- `COMPLETED`: Backup can be used for restoring the data.
- `IN_PROGRESS`: Wait until the backup completes to use it for restore.
- `FAILED`: Something went wrong when creating this backup. To find out the exact problem, use the [Elasticsearch get snapshot status API](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-snapshot-status-api.html) for each of the snapshots included in the given backup.
- `INCOMPATIBLE`: Backup is incompatible with the current Elasticsearch version.
- `INCOMPLETE`: Backup is incomplete (e.g. when backup process was interrupted).

**State** of the individual snapshot is a copy of [Elasticsearch state](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/get-snapshot-api.html#get-snapshot-api-response-state).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup
