# Limitations — History — General

- All migrated data is assigned `partitionId=1` so that the RDBMS exporter on partition 1 can perform history cleanup for migrated data.
- Migrated data has partition ID 4095 encoded in their keys to avoid key collisions with Zeebe produced data.
  - Due to this, migrated process instances cannot be deleted via C8 API or in Operate since Zeebe cannot delegate the operation to a partition.
    - See https://github.com/camunda/camunda/issues/47927
  - Please use [RDBMS History Cleanup](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#history-cleanup-1) to delete the migrated data.
- The minimum required history level in Camunda 7 is `FULL` to ensure that sufficient data is available for migration.
- To avoid collisions with native Camunda 8 definitions, the Data Migrator prefixes each migrated Camunda 7 history definition ID (process, decision, and form definitions) with `c7-legacy-` by default.
  - (Optional) You can configure a different prefix with the `camunda.migrator.history.legacy-id-prefix` property. For configuration details and validation rules, see the [property reference](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties#camundamigrator).
  - The same effective prefix is applied to all migrated history definition types and to the entities that reference them.
  - Do not deploy new definitions in Camunda 8 with IDs starting with the effective prefix. Changing or removing the default prefix increases the risk of ID collisions, so only change it when you are sure your Camunda 8 definition IDs cannot clash with migrated IDs.
- Migrated definitions are visible in Camunda 8 Tasklist but cannot be started. To start new instances, you need to use the [Diagram Converter](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter) to migrate your legacy processes to Camunda 8 compatible versions and deploy them to Camunda 8 as described in the [preparation step for runtime migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime#1-preparation).
  - See https://github.com/camunda/camunda-7-to-8-migration-tooling/issues/1000
- Avoid manipulating Camunda 7 data in between History Data Migrator runs to ensure data consistency unless there is a specific migration issue to fix (e.g. moving instances out of states that are not migratable). See [Auto-cancellation of active instances](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history#auto-cancellation-of-active-instances) for details.
- During migration, some entities may be skipped due to unresolved dependencies (for example, when a parent entity has not yet been migrated).
  - After the initial migration completes, the migrator automatically retries skipped entities to resolve cross-entity dependencies.
  - Automatic retries run in multiple passes until no further progress can be made.
  - Entities that remain skipped after all automatic retries are logged as warnings, along with their skip reasons.
  - After fixing underlying issues, you can manually retry remaining skipped entities using the `--retry-skipped` flag.
  - Examples of temporary skip reasons include:
    - Flow node instances whose parent flow node (scope) has not yet been migrated.
    - Child process instances called from parent call activities, where the parent flow node has not yet been migrated.
- The History Data Migrator does not support the following Camunda 7 entity types:
  - **CMMN entities**: CMMN user tasks and CMMN variables are not supported and are skipped during migration.
  - **Standalone user tasks**: User tasks that are not associated with a process instance are not supported and are skipped during migration.
- Camunda 7 does not store audit data of asyncBefore wait state for flow nodes. Migration of flow nodes is executed in all other cases.
- The History Data Migrator does not support the following Camunda 8 entities or properties:
  - Sequence flow: Sequence flows cannot be highlighted in Operate.
  - Message subscription and correlated message subscription: These entities are not available in Camunda 7.
  - Batch operation entity and batch operation item: Camunda 7 does not retain sufficient information about processed instances.
  - User metrics: Not available in Camunda 7.
  - Exporter position: This entity does not exist in Camunda 7.
- Please note that if any Camunda 7 process instances progress in their state in between multiple runs of the History Data Migrator, data consistency might be affected: for example, if a process instance is completed in Camunda 7 after the first run but before the second run, the History Data Migrator would migrate it as canceled in the first and as completed in the second run. As a result, in Operate you may see that a process instance was canceled in a Flow Node that chronologically precedes the end event in your model, where the instance will be marked as completed. To avoid such situations, ensure that Camunda 7 data remains unchanged between History Data Migrator runs.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
