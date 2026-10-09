# Zeebe backup management API — Request runtime state — Response

This endpoint returns the current runtime state of backups and checkpoints across all partitions.

#### HTTP status codes

| Code                      | Description                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 200 OK                    | The backup state was successfully determined and is returned in the response body.                          |
| 400 Bad Request           | The request is invalid. Refer to the returned error message for details.                                    |
| 500 Internal Server Error | An unexpected error occurred while processing the request. Refer to the returned error message for details. |
| 502 Bad Gateway           | Zeebe encountered issues while communicating with other brokers.                                            |
| 504 Gateway Timeout       | Zeebe was unable to process the request within the configured timeout.                                      |

#### Response body

When the response status is `200 OK`, the response body contains a JSON object describing the current backup and checkpoint state.

##### `checkpointStates`

Latest checkpoint information per partition.

- `checkpointId`: Identifier of the checkpoint.
- `partitionId`: Identifier of the partition.
- `checkpointType`: Type of the checkpoint. One of `MARKER`, `SCHEDULED_BACKUP`, or `MANUAL_BACKUP`.
- `checkpointPosition`: Log stream position of the checkpoint record.
- `checkpointTimestamp`: Timestamp when the checkpoint was created.

##### `backupStates`

Latest backup information per partition.

- `checkpointId`: Identifier of the associated checkpoint.
- `partitionId`: Identifier of the partition.
- `checkpointType`: Type of the checkpoint. One of `MARKER`, `SCHEDULED_BACKUP`, or `MANUAL_BACKUP`.
- `checkpointPosition`: Log stream position of the checkpoint record.
- `checkpointTimestamp`: Timestamp when the checkpoint was created.
- `firstLogPosition`: First available log stream position included in this backup.

##### `ranges`

List of active continuous backup ranges per partition.

- `partitionId`: Identifier of the partition.
- `start`: First backup in the continuous backup range.
  - `checkpointId`: Identifier of the checkpoint.
  - `checkpointType`: Type of the checkpoint.
  - `checkpointPosition`: Log stream position of the checkpoint record.
  - `checkpointTimestamp`: Timestamp when the checkpoint was created.
  - `firstLogPosition`: First available log stream position included in this backup.
- `end`: Last backup in the continuous backup range.
  - `checkpointId`: Identifier of the checkpoint.
  - `checkpointType`: Type of the checkpoint.
  - `checkpointPosition`: Log stream position of the checkpoint record.
  - `checkpointTimestamp`: Timestamp when the checkpoint was created.
  - `firstLogPosition`: First available log stream position included in this backup.

  Example response body with 200 OK

```json
{
  "checkpointStates": [
    {
      "checkpointId": 1772001869309,
      "checkpointType": "SCHEDULED_BACKUP",
      "partitionId": 1,
      "checkpointPosition": 580,
      "checkpointTimestamp": "2026-02-25T06:44:29.309Z"
    },
    {
      "checkpointId": 1772001869309,
      "checkpointType": "SCHEDULED_BACKUP",
      "partitionId": 2,
      "checkpointPosition": 135,
      "checkpointTimestamp": "2026-02-25T06:44:29.308Z"
    }
  ],
  "backupStates": [
    {
      "checkpointId": 1772001869309,
      "checkpointType": "SCHEDULED_BACKUP",
      "partitionId": 1,
      "checkpointPosition": 580,
      "firstLogPosition": 1,
      "checkpointTimestamp": "2026-02-25T06:44:29.391Z"
    },
    {
      "checkpointId": 1772001869309,
      "checkpointType": "SCHEDULED_BACKUP",
      "partitionId": 2,
      "checkpointPosition": 135,
      "firstLogPosition": 1,
      "checkpointTimestamp": "2026-02-25T06:44:29.394Z"
    }
  ],
  "ranges": [
    {
      "partitionId": 1,
      "start": {
        "checkpointId": 1772001838336,
        "checkpointType": "SCHEDULED_BACKUP",
        "checkpointPosition": 580,
        "firstLogPosition": 1,
        "checkpointTimestamp": "2026-02-25T06:44:29.391Z"
      },
      "end": {
        "checkpointId": 1772001869309,
        "checkpointType": "SCHEDULED_BACKUP",
        "checkpointPosition": 580,
        "firstLogPosition": 1,
        "checkpointTimestamp": "2026-02-25T06:44:29.391Z"
      }
    },
    {
      "partitionId": 2,
      "start": {
        "checkpointId": 1772001838336,
        "checkpointType": "SCHEDULED_BACKUP",
        "checkpointPosition": 135,
        "firstLogPosition": 1,
        "checkpointTimestamp": "2026-02-25T06:44:29.394Z"
      },
      "end": {
        "checkpointId": 1772001869309,
        "checkpointType": "SCHEDULED_BACKUP",
        "checkpointPosition": 135,
        "firstLogPosition": 1,
        "checkpointTimestamp": "2026-02-25T06:44:29.394Z"
      }
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
