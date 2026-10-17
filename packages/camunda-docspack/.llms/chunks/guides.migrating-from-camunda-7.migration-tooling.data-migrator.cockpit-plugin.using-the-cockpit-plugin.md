# Cockpit plugin — Using the Cockpit plugin

After installation and configuration, the Cockpit plugin provides:

- **Skipped entity overview**: View all entities that were skipped during migration.
- **Detailed skip reasons**: Understand why specific entities were not migrated.
- **Migration status tracking**: See data that has been migrated successfully.


## Screenshots

The following screenshots demonstrate the Cockpit plugin interface and functionality:

### Migrated process instances view

Shows a table of successfully migrated process instances from Camunda 7 to Camunda 8, including the process instance ID, process definition key, and the corresponding Camunda 8 key.

![Runtime Migrated Instances](img/runtime-migrated.png)

### Skipped process instances overview

Displays process instances that were skipped during migration, allowing users to identify which instances failed and need further attention.

![Runtime Skipped Instances](img/runtime-skipped.png)

### Entity type selection

Allows filtering historic entities by type (process instances, variables, tasks, etc.) to simplify analysis of migration issues.

![Skipped Entity Type Selection](img/skipped-select-type.png)

### Variable-specific skip analysis

When viewing historic variable data, the type and value of primitives are retrieved to provide additional context.

![Skipped Variables](img/skipped-variables.png)

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/cockpit-plugin
