# Update guide — Breaking changes by version — Version 0.2.x to 0.3.0

**Release date:** 14th of April 2026 \
**Camunda 8 compatibility:** 8.9.x

#### Data Migrator: Database schema update

Run the Data Migrator with `camunda.migrator.auto-ddl: true` configuration to update the schema.

#### Data Migrator: Entity Interceptor API changes

The `EntityInterceptor` interface now provides compile-time type safety using Java generics, eliminating the need for manual casting.

##### What changed

```java
// 0.2.x
public class ProcessInstanceEnricher implements EntityInterceptor {
    @Override
    public void execute(EntityConversionContext<?, ?> context) {
        // Manual casting required
        HistoricProcessInstance entity = (HistoricProcessInstance) context.getC7Entity();
        ProcessInstanceDbModel.ProcessInstanceDbModelBuilder builder = (ProcessInstanceDbModel.ProcessInstanceDbModelBuilder) context.getC8DbModelBuilder();

        // Custom logic
        builder.processDefinitionId(entity.getProcessDefinitionKey());
    }
}

// 0.3.x
public class ProcessInstanceEnricher
    implements EntityInterceptor<HistoricProcessInstance, ProcessInstanceDbModel.ProcessInstanceDbModelBuilder> {

    @Override
    public void execute(HistoricProcessInstance entity,
                        ProcessInstanceDbModel.ProcessInstanceDbModelBuilder builder) {
        // No casting needed! Type-safe access
        builder.processDefinitionId(entity.getProcessDefinitionKey());
    }
}
```

#### Data Migrator: Automatic Camunda 8 datasource selection

When the Camunda 8 datasource is configured, the migrator now creates and uses the migration schema on the Camunda 8 database automatically. Manual selection is no longer required.

##### What changed

- Removed: `camunda.migrator.data-source`
- New behavior: The migration schema is created on the Camunda 8 database when `camunda.migrator.c8.data-source` is configured

##### Impact on existing migrations

**Warning: Risk of duplicate migrations**
If you ran a migration in 0.2.x without configuring `camunda.migrator.data-source: C8`, upgrading to 0.3.0 creates a new migration schema on the Camunda 8 database. This resets migration tracking and can result in duplicate data migration.

##### Migration steps

1. **If your Camunda 7 and Camunda 8 datasources point to the same database in 0.2.x:**
   - Remove `camunda.migrator.data-source` from your configuration.
   - No further action is required. The migration schema is already accessible from both datasources.

2. **If you explicitly configured `camunda.migrator.data-source: C8` in 0.2.x:**
   - Remove `camunda.migrator.data-source` from your configuration.
   - No further action is required. The migration schema is already on the Camunda 8 database.

3. **If you used the default configuration in 0.2.x (migration schema on the Camunda 7 database):**
   - Option A (recommended): Copy the migration schema from the Camunda 7 database to the Camunda 8 database before upgrading.
   - Option B: Start over without existing migration tracking.
     - This can result in duplicate migrations.
     - Before upgrading, you can use `--drop-schema` to remove the migration schema from the Camunda 7 database (for example, to reclaim disk space).

4. **If you have not started a migration yet:**
   - Configure the Camunda 8 datasource:

     ```yaml
     camunda.migrator.c8.data-source:
       jdbc-url: jdbc:postgresql://localhost:5432/camunda8
       username: camunda
       password: camunda
     ```

**Note**
See [history atomicity](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history#atomicity) for more details.

#### Data Migrator: New `StringVariableTransformer`

- **New transformer**: `StringVariableTransformer` now handles string variables specifically
- **Modified transformer**: `PrimitiveVariableTransformer` no longer handles string variables, only:
  - `BooleanValue`
  - `IntegerValue`
  - `LongValue`
  - `DoubleValue`
  - `ShortValue`

**If you need to disable the new string transformer:**

```yaml
camunda:
  migrator:
    interceptors:
      - class-name: io.camunda.migration.data.impl.interceptor.StringVariableTransformer
        enabled: false
```

**Note: Further reading**
See the [Variables documentation](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables#supported-types) for the complete list of variable types and their interceptors.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/update-guide
