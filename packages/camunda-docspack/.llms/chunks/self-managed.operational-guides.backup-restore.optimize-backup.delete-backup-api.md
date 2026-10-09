# Optimize backup management API — Delete backup API

Note that the backup API can be reached via the `/actuator` management port, which by default is `8092`.
The configured context path does not apply to the management port.

An existing backup can be deleted using the below API which deletes all Optimize snapshots associated with the supplied backupID.

```
DELETE actuator/backups/{backupId}
```

### Response

| Code             | Description                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 204 No Content   | The delete request for the associated snapshots was submitted to the database successfully.                                                                              |
| 400 Bad Request  | There is an issue with the request, for example the repository name specified in the Optimize configuration does not exist. Refer to returned error message for details. |
| 500 Server Error | An error occurred, for example the snapshot repository does not exist. Refer to the returned error message for details.                                                  |
| 502 Bad Gateway  | Optimize has encountered issues while trying to connect to Elasticsearch/OpenSearch.                                                                                     |

### Example request

```shell
curl --request DELETE 'http://localhost:8092/actuator/backups/123456'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup
