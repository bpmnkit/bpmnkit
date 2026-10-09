# Zeebe backup management API — Delete runtime state

Clear the backup runtime state (checkpoint state and range tracking). Ranges will be rebuilt from the next backup onward.

**Caution**
This clears all tracked checkpoint and range state. Ranges will be rebuilt from the next backup onward, but previously tracked ranges are lost. This can be useful when switching backup stores (for example, from S3 to GCS) or after all backups have been lost from the store.

### Request

```
DELETE actuator/backupRuntime/state
```

  Example request

```shell
curl --request DELETE 'http://localhost:9600/actuator/backupRuntime/state'
```

### Response

| Code                      | Description                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 204 No Content            | The runtime state has been cleared.                                                                         |
| 500 Internal Server Error | An unexpected error occurred while processing the request. Refer to the returned error message for details. |
| 502 Bad Gateway           | Zeebe encountered issues while communicating with other brokers.                                            |
| 504 Gateway Timeout       | Zeebe was unable to process the request within the configured timeout.                                      |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
