# Operations and maintenance for RDBMS manual installations

Backup, restore, upgrade, troubleshoot, tune, and secure RDBMS for manual Camunda installations.

Operate and maintain RDBMS secondary storage for manual Camunda 8 installations (VM, bare metal, or standalone Java).


## Backup and restore

**DBA owns backups** using native RDBMS tools (pg_dump, mysqldump, RMAN, and similar). Camunda handles consistency.

- Use vendor-recommended backup procedures.
- Backup frequency depends on your RPO (Recovery Point Objective).
- Database backups capture consistent state (Camunda flushes synchronously).
- Zeebe exporter position is stored in RDBMS.

**Restore procedure**:

1. Restore database from backup.
2. Start Camunda pointing to restored database.
3. Check logs for Liquibase completion and RdbmsExporter success.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/operations
