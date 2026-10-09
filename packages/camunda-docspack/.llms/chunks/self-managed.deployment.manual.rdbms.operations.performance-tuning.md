# Operations and maintenance for RDBMS manual installations — Performance tuning

### Exporter batching

```bash
# Lower flush interval = lower latency, more frequent writes
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_FLUSHINTERVAL=PT0.1S

# Higher queue size = higher throughput, more memory
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_QUEUESIZE=5000
```

### Connection pooling

Tune based on your workload. Camunda uses the Hikari connection pool following Spring Boot best practices:

```bash
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_CONNECTION_POOL_MAXIMUM_POOL_SIZE=20
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_CONNECTION_POOL_MINIMUM_IDLE=10
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_CONNECTION_POOL_IDLE_TIMEOUT=600000
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_CONNECTION_POOL_MAX_LIFETIME=1800000
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_CONNECTION_POOL_CONNECTION_TIMEOUT=30000
```

### Database tuning

Consult your database vendor's guides:

- **PostgreSQL**: Index tuning, autovacuum settings
- **Oracle**: SGA size, parallel execution
- **MySQL/MariaDB**: Buffer pool sizing
- **SQL Server**: Memory configuration
- **AWS Aurora**: Consult AWS RDS documentation for Aurora-specific tuning

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/operations
