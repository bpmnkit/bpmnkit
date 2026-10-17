# Runtime — Choreography

The runtime migration typically follows these phases:

### 1. Preparation

- Stop Camunda 7 process execution to avoid starting new instances during migration.
- Migrate BPMN models using the [Diagram Converter](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter). The Diagram Converter automatically adds the required `migrator` execution listener to None Start Events when the **Add Data Migration Execution Listener** option is enabled.
- Adjust Camunda 8 models to comply with migration limitations.
- Test migrated models in a Camunda 8 environment.
- Back up your Camunda 7 database before migration.

### 2. Migration

- Deploy Camunda 8 process models and resources to the target environment.
- **Do not start new Camunda 8 process instances** on models that still have the `migrator` execution listener. See [Externally Started Process Instances](#externally-started-process-instances) for details.
- Configure the migrator with proper database connections and settings.
- Start the migrator and monitor progress through logs.
- Verify results in Camunda 8 Operate.
- Handle skipped instances by reviewing and addressing validation failures.
- After successful migration, clean up models:
  - Remove `migrator` execution listeners from Camunda 8 models.
  - Revert temporary model changes.
  - Redeploy the updated models.
  - Migrate instances to the latest version of Camunda 8 models if appropriate.

### 3. Validation

- Check migrated instances in Camunda 8 Operate.
- Verify variable data and migrated state.
- Test process continuation by completing some migrated instances.
- Monitor system performance and resource usage.
- Validate business logic continues to work as expected.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
