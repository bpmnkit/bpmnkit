# Web applications backup management API — Get backups list API

To get the list of existing backups, the following endpoint can be used:

```
GET actuator/backupHistory
```

**Note**
For backward compatibility, the endpoint `actuator/backups` is available if the component is running standalone.

### Query parameters

The following optional query parameters can be used to optimize the response:

| Parameter | Description                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `verbose` | Controls the level of detail in the response. When set to `false`, returns a streamlined response with essential information. Default: `true`. |
| `pattern` | Filters backups by ID pattern. For example, `pattern=20250401*` returns only backups with IDs starting with `20250401`.                        |

Response:

| Code             | Description                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 200 OK           | Backup list could be determined and is returned in the response body. Can be an empty response in case no backups were created yet. |
| 404 Not Found    | Backup repository is not configured.                                                                                                |
| 500 Server Error | All other errors, e.g. ES returned error response when attempting to execute the query.                                             |
| 502 Bad Gateway  | Elasticsearch is not accessible, the request can be retried when it is back.                                                        |

Example requests:

```shell
# Get all backups
curl 'http://localhost:9600/actuator/backupHistory'

# Get backups with streamlined response
curl 'http://localhost:9600/actuator/backupHistory?verbose=false'

# Get backups matching a specific pattern
curl 'http://localhost:9600/actuator/backupHistory?pattern=20250401*'

# Combine parameters for optimized filtered results
curl 'http://localhost:9600/actuator/backupHistory?verbose=false&pattern=20250401*'
```

Response will contain JSON with array of objects representing state of each backup (see [get backup state API endpoint](#get-backup-state-api)).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup
