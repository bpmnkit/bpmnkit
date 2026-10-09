# Zeebe backup management API — Get backup info API

Information about a specific backup can be retrieved using the following request:

### Request

```
GET actuator/backupRuntime/{backupId}
```

  Example request

```shell
curl --request GET 'http://localhost:9600/actuator/backupRuntime/100'
```

### Response

| Code             | Description                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------ |
| 200 OK           | Backup state could be determined and is returned in the response body (see example below). |
| 400 Bad Request  | There is an issue with the request. Refer to the returned error message for details.       |
| 404 Not Found    | A backup with that ID does not exist.                                                      |
| 500 Server Error | All other errors. Refer to the returned error message for more details.                    |
| 502 Bad Gateway  | Zeebe has encountered issues while communicating with different brokers.                   |
| 504 Timeout      | Zeebe failed to process the request within a pre-determined timeout.                       |

When the response is 200 OK, the response body consists of a JSON object describing the state of the backup.

- `backupId`: ID in the request.
- `state`: Gives the overall status of the backup. The state can be one of the following:
  - `COMPLETED` if all partitions have completed the backup.
  - `FAILED` if at least one partition has failed. In this case, `failureReason` contains a string describing the reason for failure.
  - `INCOMPLETE` if at least one partition's backup does not exist.
  - `IN_PROGRESS` if at least one partition's backup is in progress.
  - `DELETED` if at least one partition's backup is deleted.
- `details`: Gives the state of each partition's backup.
- `failureReason`: The reason for failure if the state is `FAILED`.

  Example response body with 200 OK

```json
{
  "backupId": 100,
  "details": [
    {
      "brokerVersion": "8.2.0-SNAPSHOT",
      "checkpointPosition": 5,
      "createdAt": "2022-12-08T13:00:55.344276672Z",
      "lastUpdatedAt": "2022-12-08T13:00:55.805351556Z",
      "partitionId": 1,
      "snapshotId": "2-1-3-2",
      "state": "COMPLETED"
    },
    {
      "brokerVersion": "8.2.0-SNAPSHOT",
      "checkpointPosition": 7,
      "createdAt": "2022-12-08T13:00:55.370965069Z",
      "lastUpdatedAt": "2022-12-08T13:00:55.84756566Z",
      "partitionId": 2,
      "snapshotId": "3-1-5-3",
      "state": "COMPLETED"
    }
  ],
  "state": "COMPLETED"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
