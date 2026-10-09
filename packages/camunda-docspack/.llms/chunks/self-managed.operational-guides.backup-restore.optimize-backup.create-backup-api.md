# Optimize backup management API — Create backup API

Note that the backup API can be reached via the `/actuator` management port, which by default is `8092`.
The configured context path does not apply to the management port.

The following endpoint can be used to trigger the backup process:

```
POST actuator/backups
{
  "backupId": <backupId>
}
```

### Response

| Code             | Description                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 202 Accepted     | Backup process was successfully initiated. To determine whether backup process was completed refer to the GET API.                         |
| 400 Bad Request  | Indicates issues with the request, for example when the `backupId` contains invalid characters.                                            |
| 409 Conflict     | Indicates that a backup with the same `backupId` already exists.                                                                           |
| 500 Server Error | All other errors, e.g. issues communicating with the database for snapshot creation. Refer to the returned error message for more details. |
| 502 Bad Gateway  | Optimize has encountered issues while trying to connect to the database.                                                                   |

### Example request

```shell
curl --request POST 'http://localhost:8092/actuator/backups' \
-H 'Content-Type: application/json' \
-d '{ "backupId": 123456 }'
```

### Example response

```json
{
  "message": "Backup creation for ID 123456 has been scheduled. Use the GET API to monitor completion of backup process"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup
