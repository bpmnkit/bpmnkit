# Zeebe backup management API — Delete backup API

A backup can be deleted using the following request:

### Request

```
DELETE actuator/backupRuntime/{backupId}
```

  Example request

```shell
curl --request DELETE 'http://localhost:9600/actuator/backupRuntime/100'
```

### Response

| Code             | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| 204 No Content   | The backup has been deleted.                                                         |
| 400 Bad Request  | There is an issue with the request. Refer to the returned error message for details. |
| 500 Server Error | All other errors. Refer to the returned error message for more details.              |
| 502 Bad Gateway  | Zeebe has encountered issues while communicating with different brokers.             |
| 504 Timeout      | Zeebe failed to process the request within a predetermined timeout.                  |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
