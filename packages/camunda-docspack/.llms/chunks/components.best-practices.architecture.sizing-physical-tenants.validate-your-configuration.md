# Size clusters with Physical Tenants — Validate your configuration

Before production, check:

- Representative load: Each tenant's real process models, payload sizes, and job workers.
- Concurrent load: All tenants at peak together, and one tenant above its peak.
- Database connections: HikariCP pending connections and timeouts by `physicalTenant`, pooler waiting clients, and database connections against `max_connections`.
- Heap: Heap usage and GC time after startup with all tenants, before load.
- CPU throttling: Container throttling, not only average CPU.
- Latency: Request p99 and data availability p99 for each tenant.
- Startup: A rolling restart and adding a tenant. The RocksDB check and heap exhaustion fail at startup, not under load.

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
