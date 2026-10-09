# Size clusters with Physical Tenants — Size secondary storage — Size RDBMS connections

Each broker opens one HikariCP connection pool per tenant at startup, so connections scale with brokers and tenants, not partitions:

```text
idle connections     =  brokers × tenants × minimum-idle
maximum connections  =  brokers × tenants × maximum-pool-size
```

With the defaults (`maximum-pool-size` `10`, `minimum-idle` `2`), three brokers and four tenants can open 120 connections, above the PostgreSQL default `max_connections` of 100. Calculate this for each database instance, counting only its tenants, and either raise the database limit or add a connection pooler. You can override [pool properties](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#connection-pool-configuration) for each tenant.

HikariCP metrics carry the `physicalTenant` tag. If data availability latency rises as you add tenants, check pool saturation before adding database capacity.

If brokers fail to start or restart repeatedly with a database connection error, see [Database rejects new connections](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting#database-rejects-new-connections-on-rdbms).

#### Use a connection pooler

Camunda doesn't ship or require a connection pooler. If you use one, such as PgBouncer, validate it with your own load and size its limits separately:

| Limit                         | What it caps                                    | Compare it against                       |
| :---------------------------- | :---------------------------------------------- | :--------------------------------------- |
| PgBouncer `max_client_conn`   | Client connections from all brokers and tenants | Brokers × tenants × `maximum-pool-size`  |
| PgBouncer `default_pool_size` | Server connections per database and user pair   | Concurrent queries the tenants need      |
| PostgreSQL `max_connections`  | Backend connections on the database server      | Sum of server connections from all pools |

Camunda's tests used PgBouncer in transaction pooling mode with `prepareThreshold=0` on the JDBC URL. The PgBouncer defaults were too low: a `default_pool_size` of 20 limited throughput with 24 partitions, and a `max_client_conn` of 100 was exhausted at 120 tenants.

#### Reduce table row count metric queries

The RDBMS table row count metric queries the database for each tenant on every broker, every `camunda.data.secondary-storage.rdbms.metrics.table-row-count-cache-duration` (default `5m`). Camunda issues one query per tenant per broker at this interval. If CPU spikes still match this interval, increase the duration.

#### Spread tenants across database instances

Tenants that share one database compete for its capacity. If tenants run at high load together, give them separate [database instances](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#rdbms-storage).

In an internal test with 10 tenants at maximum load, one shared instance reached 69% of the throughput of 10 single-tenant clusters, unevenly spread across tenants. Two instances with five tenants each reached 88%, evenly spread.

  Database split test configuration

10 tenants, three partitions each, replication factor three, 30 brokers. PostgreSQL behind PgBouncer. Optimize disabled.

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
