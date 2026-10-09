# Zeebe backup management API — Sync runtime state

Force a synchronization of the backup metadata stored in the blob store. This returns the updated state in the same format as the [GET state](#request-runtime-state) endpoint.

### Request

```
POST actuator/backupRuntime/state/sync
```

  Example request

```shell
curl --request POST 'http://localhost:9600/actuator/backupRuntime/state/sync'
```

### Response

| Code                      | Description                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 200 OK                    | The backup state was successfully synced and is returned in the response body.                              |
| 500 Internal Server Error | An unexpected error occurred while processing the request. Refer to the returned error message for details. |
| 502 Bad Gateway           | Zeebe encountered issues while communicating with other brokers.                                            |
| 504 Gateway Timeout       | Zeebe was unable to process the request within the configured timeout.                                      |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
