# Runtime — Usage examples

### maclinux

```bash
# Run runtime migration
./start.sh --runtime

# List all skipped process instances
./start.sh --runtime --list-skipped

# List the Camunda 7 ID and Camunda 8 key for each migrated entity
./start.sh --runtime --list-migrated

# Retry skipped process instances
./start.sh --runtime --retry-skipped
```

### windows

```bash
# Run runtime migration
start.bat --runtime

# List all skipped process instances
start.bat --runtime --list-skipped

# List the Camunda 7 ID and Camunda 8 key for each migrated entity
start.bat --runtime --list-migrated

# Retry skipped process instances
start.bat --runtime --retry-skipped
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
