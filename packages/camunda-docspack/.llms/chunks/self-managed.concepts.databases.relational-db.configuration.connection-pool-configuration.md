# RDBMS configuration overview — Connection pool configuration

Camunda uses HikariCP for JDBC connection pooling. The following properties can be adjusted:

| Property name                                                             | Description                                                               | Default |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------- |
| `camunda.data.secondary-storage.rdbms.connection-pool.maximum-pool-size`  | Maximum number of simultaneous connections                                | 10      |
| `camunda.data.secondary-storage.rdbms.connection-pool.minimum-idle`       | Minimum number of idle connections                                        | 2       |
| `camunda.data.secondary-storage.rdbms.connection-pool.idle-timeout`       | Timeout (ms) before closing an idle connection                            | 600000  |
| `camunda.data.secondary-storage.rdbms.connection-pool.max-lifetime`       | Maximum lifetime (ms) of each connection before it is closed and replaced | 1800000 |
| `camunda.data.secondary-storage.rdbms.connection-pool.connection-timeout` | Maximum time (ms) the application waits for a connection from the pool    | 30000   |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
