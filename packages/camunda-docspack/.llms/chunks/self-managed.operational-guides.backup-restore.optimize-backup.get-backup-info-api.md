# Optimize backup management API — Get backup info API

Note that the backup API can be reached via the `/actuator` management port, which by default is `8092`.
The configured context path does not apply to the management port.

Information about a specific backup can be retrieved using the following request:

```
GET actuator/backups/{backupId}
```

Information about all existing Optimize backups can be retrieved by omitting the optional `backupId` parameter:

```
GET actuator/backups
```

### Response

| Code             | Description                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 200 OK           | Backup state could be determined and is returned in the response body (see example below).                                                                               |
| 400 Bad Request  | There is an issue with the request, for example the repository name specified in the Optimize configuration does not exist. Refer to returned error message for details. |
| 404 Not Found    | If a backup ID was specified, no backup with that ID exists.                                                                                                             |
| 500 Server Error | All other errors, e.g. issues communicating with the database for snapshot state retrieval. Refer to the returned error message for more details.                        |
| 502 Bad Gateway  | Optimize has encountered issues while trying to connect to the database.                                                                                                 |

### Example request

```shell
curl --request GET 'http://localhost:8092/actuator/backups/123456'
```

### Example response

```json
  {
    "backupId": 123456,
    "failureReason": null,
    "state": "COMPLETE",
    “details”: [
      {
          "snapshotName": "camunda_optimize_123456_8.8.0_part_1_of_2",
          "state": "SUCCESS",
          "startTime": "2024-11-09T10:11:36.978+0100",
          "failures": []
      },
      {
          "snapshotName": "camunda_optimize_123456_8.8.0_part_2_of_2",
          "state": "SUCCESS",
          "startTime": "2024-11-09T10:11:37.178+0100",
          "failures": []
      }
    ]
  }
```

Note that the endpoint will return a single item when called with a `backupId` and a list of items when called without specifying a `backupId`.

Possible states of the backup:

- `COMPLETE`: The backup can be used for restoring data.
- `IN_PROGRESS`: The backup process for this backup ID is still in progress.
- `FAILED`: Something went wrong when creating this backup. To find out the exact problem, use the [Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-snapshot-status-api.html)/[OpenSearch](https://opensearch.org/docs/latest/api-reference/snapshots/get-snapshot-status/) get snapshot status API for each of the snapshots included in the given backup.
- `INCOMPATIBLE`: The backup is incompatible with the current Elasticsearch/OpenSearch version.
- `INCOMPLETE`: The backup is incomplete (this could occur when the backup process was interrupted or individual snapshots were deleted).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup
