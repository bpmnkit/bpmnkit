# RDBMS configuration overview — Exporter cache configuration — LSN replication monitoring

The exporter monitors the replication lag to the secondary databases based on the Log Sequence Number (LSN) of the last
exported record. Only when an RDBMS redo log segment is replicated to a minimum quorum of secondary databases, the
exporter will acknowledge the records in the logstream.

```yaml
camunda.data.secondary-storage.rdbms.async-replication.enabled: true
camunda.data.secondary-storage.rdbms.async-replication.type: LOG_SEQ
camunda.data.secondary-storage.rdbms.async-replication.min-sync-replicas: 2
```

| Property name                                 | Description                                                                   | Default |
| --------------------------------------------- | ----------------------------------------------------------------------------- | ------- |
| `async-replication.enabled`                   | If the async replication monitoring should be enabled                         | false   |
| `async-replication.min-sync-replicas`         | The minimum number of replicas in sync                                        | 1       |
| `async-replication.polling-interval`          | The interval in which to check the replicas                                   | PT15S   |
| `async-replication.max-lag`                   | The max tolerated lag of a replication (ISO-8601 duration)                    | PT15M   |
| `async-replication.pause-on-max-lag-exceeded` | If the exporter should pause exporting when the maximum lag limit is exceeded | false   |

#### Vendor support

The following databases are supported for LSN replication monitoring:

- Aurora Global Database with PostgreSQL
- Aurora Global Database with MySQL
- MSSQL
- PostgreSQL
- Oracle

Oracle uses system change numbers (SCNs) to track replication progress. To use LSN replication monitoring with Oracle, grant the database user `SELECT` access to the following views:

```sql
GRANT SELECT ON v_$database TO <user>;
GRANT SELECT ON v_$archive_dest TO <user>;
GRANT SELECT ON v_$archive_dest_status TO <user>;
```

To use the LSN replication monitoring with PostgreSQL, the database user must have the following additional privileges:

- `PG_MONITOR` role

```sql
GRANT PG_MONITOR TO <user>;
```

To use the LSN replication monitoring with MSSQL, the database user must have the following additional privileges:

- `VIEW SERVER STATE` role on SQL Server 2019 and earlier versions

  ```sql
  GRANT VIEW SERVER STATE TO <user>;
  ```

- `VIEW SERVER PERFORMANCE STATE` role on SQL Server 2022 and newer versions

  ```sql
  GRANT VIEW SERVER PERFORMANCE STATE TO <user>;
  ```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
