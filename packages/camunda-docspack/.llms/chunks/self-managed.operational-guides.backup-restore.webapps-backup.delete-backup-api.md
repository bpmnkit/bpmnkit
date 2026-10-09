# Web applications backup management API — Delete backup API

To delete all the Elasticsearch snapshots associated with the specific backup id, the following endpoint may be used:

```

DELETE actuator/backupHistory/123

```

**Note**
For backward compatibility, the endpoint `actuator/backups` is available if the component is running standalone.

Response:

| Code             | Description                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 204 No Content   | All commands to delete corresponding ELS snapshots were successfully sent to ELS. ELS will continue deletion asynchronously. |
| 404 Not Found    | Not a single snapshot corresponding to given ID exist.                                                                       |
| 500 Server Error | All other errors, e.g. ES returned error response when attempting to execute the query.                                      |
| 502 Bad Gateway  | Elasticsearch is not accessible, the request can be retried when it is back.                                                 |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup
