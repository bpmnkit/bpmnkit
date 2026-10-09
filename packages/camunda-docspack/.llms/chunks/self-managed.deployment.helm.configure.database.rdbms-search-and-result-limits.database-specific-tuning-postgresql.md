# RDBMS search APIs and result count behavior — Database-specific tuning (PostgreSQL)

If you are using PostgreSQL as your RDBMS and experience slow search queries, tune compute resources, storage performance, and PostgreSQL server parameters based on your workload and hardware.

Typical PostgreSQL parameters to evaluate for load-testing scenarios include:

```conf
# WAL performance
wal_buffers = 64MB
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_timeout = 20min
checkpoint_completion_target = 0.9
wal_writer_delay = 200ms
wal_writer_flush_after = 1MB

# Memory
shared_buffers = 2GB
effective_cache_size = 4500MB
work_mem = 32MB
maintenance_work_mem = 512MB

# Autovacuum
autovacuum_max_workers = 6
autovacuum_naptime = 15s
autovacuum_vacuum_scale_factor = 0.03
autovacuum_analyze_scale_factor = 0.02
autovacuum_vacuum_cost_limit = 5000

# Monitoring
pg_stat_statements.track = all
pg_stat_statements.max = 10000
track_io_timing = on
track_functions = all
```

**Note**
These are PostgreSQL-native settings. How you apply them depends on your deployment model (for example, managed database parameter groups, `postgresql.conf`, or Kubernetes operator configuration such as CloudNativePG).

For production, start conservative and adjust based on your data volume, workload, and hardware. Camunda is a write-heavy application, so prioritize cache and vacuum settings for your environment.

Database-specific tuning for MariaDB and Oracle will be documented in future updates.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-search-and-result-limits
