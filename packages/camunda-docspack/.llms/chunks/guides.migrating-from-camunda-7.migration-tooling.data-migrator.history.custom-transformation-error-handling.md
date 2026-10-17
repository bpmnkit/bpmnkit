# History — Custom transformation — Error handling

When an entity transformation fails:

1. The entity is marked as _skipped_ in the migration database.
2. After the initial migration completes, the migrator automatically retries all skipped entities.
3. Retries run in multiple passes until no further progress can be made (that is, no additional entities are successfully migrated).
4. Any entities that remain skipped after all automatic retries are logged as warnings, along with their skip reasons.
5. Use `--history --list-skipped` to view entities that remain skipped after automatic retries.
6. After resolving the underlying issue (for example, unsupported variable types), use `--history --retry-skipped` to manually retry the migration.

This automatic retry mechanism is particularly useful for resolving cross-entity dependencies, such as:

- Flow node instances that depend on their parent flow node (scope)
- Child process instances that depend on parent call activities
- Variables or user tasks that depend on their parent process instance

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
