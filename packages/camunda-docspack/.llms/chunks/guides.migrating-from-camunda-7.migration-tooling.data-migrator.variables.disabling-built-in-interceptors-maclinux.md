# Variables — Disabling built-in interceptors — maclinux

```bash
# List all skipped variables
./start.sh --history --list-skipped HISTORY_VARIABLE

# List all skipped decision instances
./start.sh --history --list-skipped HISTORY_DECISION_INSTANCE

# List the Camunda 7 ID and Camunda 8 key for each migrated variable
./start.sh --history --list-migrated HISTORY_VARIABLE

# Retry skipped entities after fixing issues
./start.sh --history --retry-skipped
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
