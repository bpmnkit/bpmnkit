# RDBMS configuration overview — Exporter cache configuration — Time based replication monitoring

The exporter monitors the replication lag to the secondary databases based on the reported replication lag from the
primary replica. The exporter will only acknowledge records which have been exported before this lag time to a minimum
quorum of secondary databases. The exporting will come to a stop when the lag time is exceeded and will only continue
when the lag time is back within the configured limit.

Note, that this strategy is not as precise as LSN replication monitoring and may lead to less frequent acknowledgements.
It is recommended to use LSN replication monitoring whenever possible.

```yaml
camunda.data.secondary-storage.rdbms.async-replication.enabled: true
camunda.data.secondary-storage.rdbms.async-replication.type: TIME_LAG
camunda.data.secondary-storage.rdbms.async-replication.min-sync-replicas: 2
```

| Property name                                 | Description                                                                   | Default |
| --------------------------------------------- | ----------------------------------------------------------------------------- | ------- |
| `async-replication.enabled`                   | If the async replication monitoring should be enabled                         | false   |
| `async-replication.min-sync-replicas`         | The minimal number of replicas in sync                                        | 1       |
| `async-replication.polling-interval`          | The interval in which to check the replicas                                   | PT15S   |
| `async-replication.max-lag`                   | The max tolerated lag of a replication (ISO-8601 duration)                    | PT15M   |
| `async-replication.pause-on-max-lag-exceeded` | If the exporter should pause exporting when the maximum lag limit is exceeded | false   |

#### Vendor support

The following databases are supported for time lag replication monitoring:

- Aurora Global DB with PostgreSQL
- Aurora Global DB with MySQL
- MSSQL
- PostgreSQL

To use the time lag replication monitoring with PostgreSQL, the database user must have the following additional privileges:

- `PG_MONITOR` role

```sql
  GRANT PG_MONITOR TO <user>;
```

To use the time lag replication monitoring with MSSQL, the database user must have the following additional privileges:

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
