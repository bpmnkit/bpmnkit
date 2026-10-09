# Zeebe backup management API — List backups API

Information about all backups can be retrieved using the following request:

### Request to list all backups

```
GET actuator/backupRuntime
```

  Example request

```shell
curl --request GET 'http://localhost:9600/actuator/backupRuntime'
```

### Request to list backups matching a prefix

The list of backups can be filtered by specifying a backup ID prefix:

```
GET actuator/backupRuntime/{backupIdPrefix}
```

The backup ID prefix must end with `*`, for example `10*` will match all backups with IDs starting with `10`.

  Example request

```shell
curl --request GET 'http://localhost:9600/actuator/backupRuntime/10*'
```

### Response

| Code             | Description                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------ |
| 200 OK           | Backup state could be determined and is returned in the response body (see example below). |
| 400 Bad Request  | There is an issue with the request. Refer to the returned error message for details.       |
| 500 Server Error | All other errors. Refer to the returned error message for more details.                    |
| 502 Bad Gateway  | Zeebe has encountered issues while communicating with different brokers.                   |
| 504 Timeout      | Zeebe failed to process the request within a predetermined timeout.                        |

When the response is 200 OK, the response body consists of a JSON object with a list of backup info.
See [get backup info API response](#response-1) for the description of each field.

  Example response body with 200 OK

```json
[
  {
    "backupId": 100,
    "details": [
      {
        "brokerVersion": "8.2.0-SNAPSHOT",
        "createdAt": "2022-12-08T13:00:55.344276672Z",
        "partitionId": 1,
        "state": "COMPLETED"
      },
      {
        "brokerVersion": "8.2.0-SNAPSHOT",
        "createdAt": "2022-12-08T13:00:55.370965069Z",
        "partitionId": 2,
        "state": "COMPLETED"
      }
    ],
    "state": "COMPLETED"
  },
  {
    "backupId": 200,
    "details": [
      {
        "brokerVersion": "8.2.0-SNAPSHOT",
        "createdAt": "2022-12-08T13:01:15.27750375Z",
        "partitionId": 1,
        "state": "COMPLETED"
      },
      {
        "brokerVersion": "8.2.0-SNAPSHOT",
        "createdAt": "2022-12-08T13:01:15.279995106Z",
        "partitionId": 2,
        "state": "COMPLETED"
      }
    ],
    "state": "COMPLETED"
  }
]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
