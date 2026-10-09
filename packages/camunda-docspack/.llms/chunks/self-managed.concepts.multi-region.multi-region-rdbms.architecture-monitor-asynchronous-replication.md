# Multi-Region RDBMS — Architecture — Monitor asynchronous replication

Asynchronous replication monitoring is required, not a tuning option. Without it the RDBMS exporter acknowledges records the standby has not received yet, and a writer failover loses exported data. This architecture treats a writer failover as a routine operation rather than an incident, so set `camunda.data.secondary-storage.rdbms.async-replication.enabled` to `true`.

Camunda turns this monitoring off by default. The default suits a single database without asynchronous replicas, and the monitoring needs extra database privileges, for example the `PG_MONITOR` role on PostgreSQL. This architecture needs it, so the reference implementation sets it to `true`. Once you turn it on, the strategy defaults to `LOG_SEQ`.

The strategy you can use depends on the database engine, not on the cloud provider. Use `LOG_SEQ` when your database is in its [vendor support list](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#lsn-replication-monitoring). Otherwise, choose `TIME_LAG` or `DELAY`. The reference implementation covers only Aurora Global Database. Managed databases on other providers, such as Azure or Google Cloud, follow the same rules but have no reference implementation.

{/* TODO: replace this paragraph with a link to a per-database table of the preferred multi-region replication settings once that reference exists. */}

| Strategy                   | When to use it                                                                                                                                                                       | What you configure                                                                          |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `LOG_SEQ` (LSN monitoring) | Default and preferred. Reads the database's own replication position. Supported on Aurora Global Database with PostgreSQL, Aurora Global Database with MySQL, MSSQL, and PostgreSQL. | `async-replication.type: LOG_SEQ`                                                           |
| `TIME_LAG`                 | Less precise than `LOG_SEQ`. Reads the replication lag the primary reports, and acknowledges less often. Supported on the same databases as `LOG_SEQ`.                               | `async-replication.type: TIME_LAG`                                                          |
| `DELAY`                    | Fallback for a database that supports neither `LOG_SEQ` nor `TIME_LAG`, for example Azure SQL Database. Carries no replication signal.                                               | `async-replication.type: DELAY`, a `delay` value, and your own monitoring of the actual lag |

Camunda doesn't switch strategies for you. See [multi-region support](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#multi-region-support) for the supported backends and the settings.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
