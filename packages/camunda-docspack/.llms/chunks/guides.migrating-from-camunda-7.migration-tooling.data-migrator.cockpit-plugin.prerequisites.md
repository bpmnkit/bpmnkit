# Cockpit plugin — Prerequisites

- **Database Configuration**: The plugin can only access databases that Camunda 7 is connected to, so the migration schema needs to be created in the Camunda 7 database (default behavior), or both Camunda 7 and Camunda 8 databases must point to the same database instance. For an example, see the [Data Migrator setup example](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-examples#data-migrator).
- Camunda 7 Webapps are deployed, running, and accessible.
- Migration schema is available in Camunda 7 database.
- The Cockpit plugin requires running the migrator with `save-skip-reason` enabled.
  - The plugin doesn't show skip reasons without this setting because they are not stored.
- To use the Cockpit plugin, run the migrator with the following setting:
  ```yaml
  camunda.migrator:
    save-skip-reason: true
  ```

**Warning: Heads-Up**

- Saving the skip reason could result in a large amount of data being stored additionally in your database, depending on the order of magnitude of the data to be migrated or potentially skipped.
- We recommend testing your migration in a QA environment before running the Data Migrator against your production database.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/cockpit-plugin
