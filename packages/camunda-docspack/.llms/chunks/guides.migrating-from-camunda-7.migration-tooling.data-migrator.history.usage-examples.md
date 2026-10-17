# History — Usage examples

### maclinux

```bash
# Run history migration
./start.sh --history

# List all skipped history entities
./start.sh --history --list-skipped

# List skipped entities for specific types
./start.sh --history --list-skipped HISTORY_PROCESS_INSTANCE HISTORY_USER_TASK

# List the Camunda 7 ID and Camunda 8 key for each migrated entity
./start.sh --history --list-migrated

# List the Camunda 7 ID and Camunda 8 key for specific entity types
./start.sh --history --list-migrated HISTORY_PROCESS_INSTANCE

# Retry skipped history entities
./start.sh --history --retry-skipped
```

### windows

```bash
# Run history migration
start.bat --history

# List all skipped history entities
start.bat --history --list-skipped

# List skipped entities for specific types
start.bat --history --list-skipped HISTORY_PROCESS_INSTANCE HISTORY_USER_TASK

# List the Camunda 7 ID and Camunda 8 key for each migrated entity
start.bat --history --list-migrated

# List mappings for specific entity types
start.bat --history --list-migrated HISTORY_PROCESS_INSTANCE

# Retry skipped history entities
start.bat --history --retry-skipped
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
