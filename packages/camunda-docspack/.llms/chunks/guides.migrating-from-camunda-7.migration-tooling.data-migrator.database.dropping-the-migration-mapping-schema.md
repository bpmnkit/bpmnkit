# Database — Dropping the migration mapping schema

The migrator uses the `{prefix}MIGRATION_MAPPING` table to keep track of instances.

To drop this table after the migration is complete, use `--drop-schema` when starting the migrator. This will drop the migration mapping schema on shutdown if the migration was successful (no entities were skipped):

### maclinux

```bash
# Migrate and drop the migration mapping schema on shutdown if migration was successful
./start.sh --runtime --drop-schema
```

To drop the table regardless of the migration status, use `--force` in combination with `--drop-schema`. This will perform the drop in all cases:

```bash
# Migrate and force drop the migration mapping schema on shutdown
./start.sh --runtime --drop-schema --force
```

### windows

```bash
# Migrate and drop the migration mapping schema on shutdown if migration was successful
start.bat --runtime --drop-schema
```

To drop the table regardless of the migration status, use `--force` in combination with `--drop-schema`. This will perform the drop in all cases:

```bash
# Migrate and force drop the migration mapping schema on shutdown
start.bat --runtime --drop-schema --force
```

**Warning**
Using `--force` can lead to data loss. Use with caution.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/database
