# Troubleshoot Physical Tenants — Storage problems — Database rejects new connections on RDBMS

On RDBMS secondary storage, the number of database connections grows with the number of nodes multiplied by the number of Physical Tenants, and can exceed the database's connection limit. This is relevant when the Physical Tenants share the same database instance.

#### What you observe

- Brokers fail to start or restart repeatedly, and their logs show the database refusing new connections. For example:
  - PostgreSQL: `FATAL: sorry, too many clients already`
  - MySQL and MariaDB: `Too many connections`
  - Oracle: `ORA-00018: maximum number of sessions exceeded` or `ORA-00020: maximum number of processes exceeded`
- The failures start after you add Physical Tenants or broker nodes, not after an increase in load.
- Most connections open on the database are idle.

#### Why it happens

Each node opens a separate database connection pool for every Physical Tenant it serves. Nodes don't share pools, so the connections to one database instance scale with both the cluster size and the number of tenants stored on that instance. This is a known limitation, tracked in [camunda/camunda#61935](https://github.com/camunda/camunda/issues/61935). To plan connection capacity before you add tenants, see [Size RDBMS connections](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants#size-rdbms-connections).

| Connections                            | Formula                               | Example: 10 nodes, 10 tenants, default pool settings |
| :------------------------------------- | :------------------------------------ | :--------------------------------------------------- |
| Held open while idle                   | nodes × tenants × `minimum-idle`      | 10 × 10 × 2 = 200                                    |
| Maximum, when every pool is fully used | nodes × tenants × `maximum-pool-size` | 10 × 10 × 10 = 1,000                                 |

When the total passes the database's connection limit, the database rejects further connections. Default limits differ per vendor:

| Database             | Default connection limit                               |
| :------------------- | :----------------------------------------------------- |
| PostgreSQL           | 100 (`max_connections`)                                |
| MySQL and MariaDB    | 151 (`max_connections`)                                |
| Oracle               | Set by `processes` and `sessions`. Check your instance |
| Microsoft SQL Server | Up to 32,767 (`user connections`)                      |

In the example above, the idle connections alone exceed the PostgreSQL default before the cluster processes any load. Managed database services often set the limit from the instance size, so check the effective value for your instance.

#### How to fix it

Apply one or more of the following mitigations:

| Mitigation                               | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Trade-off                                                                                                                                                          |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reduce pool sizes                        | Lower `minimum-idle` and `maximum-pool-size` under `camunda.data.secondary-storage.rdbms.connection-pool.*`, or per tenant under `camunda.physical-tenants.<tenant-id>.data.secondary-storage.rdbms.connection-pool.*`. See [connection pool configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#connection-pool-configuration).                                                                                                                              | Pools that are too small make requests wait for a connection, and fail after `connection-timeout`. Monitor the Hikari pending-connection metrics after the change. |
| Raise the database's connection limit    | Increase `max_connections` on PostgreSQL, MySQL, or MariaDB, or `processes` and `sessions` on Oracle.                                                                                                                                                                                                                                                                                                                                                                                    | Each connection consumes database memory, and scaling further eventually reaches the new limit.                                                                    |
| Pool connections with a proxy            | Run a connection pooling proxy between Camunda and the database, and point the tenants' JDBC URLs at the proxy. Examples include [PgBouncer](https://www.pgbouncer.org/) for PostgreSQL, [ProxySQL](https://proxysql.com/) or [MariaDB MaxScale](https://mariadb.com/docs/maxscale/) for MySQL and MariaDB, and [Database Resident Connection Pooling (DRCP)](https://docs.oracle.com/en/database/oracle/oracle-database/23/jjdbc/database-resident-connection-pooling.html) for Oracle. | Adds a component to deploy and operate. Refer to the proxy's documentation for its configuration.                                                                  |
| Spread tenants across database instances | Store groups of Physical Tenants on separate database instances, so each instance only receives connections for the tenants it stores. See [storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#rdbms-storage).                                                                                                                                                                                                                                                                                    | Requires additional database instances.                                                                                                                            |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
