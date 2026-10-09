# Identity — Executing identity migration

### maclinux

```bash
# Run identity migration
./start.sh --identity

# List all skipped identity entities
./start.sh --identity --list-skipped

# List the Camunda 7 ID and Camunda 8 key for each migrated entity
./start.sh --identity --list-migrated

# Retry skipped identity entities
./start.sh --identity --retry-skipped
```

### windows

```bash
# Run identity migration
start.bat --identity

# List all skipped identity entities
start.bat --identity --list-skipped

# List the Camunda 7 ID and Camunda 8 key for each migrated entity
start.bat --identity --list-migrated

# Retry skipped identity entities
start.bat --identity --retry-skipped
```

**Warning**
After migration has been completed, it is strongly recommended to verify the results in Camunda 8 before using the system in production.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity
