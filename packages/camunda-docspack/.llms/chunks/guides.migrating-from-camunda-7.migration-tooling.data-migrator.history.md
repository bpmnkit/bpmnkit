# History

Copy audit trail (history) data from Camunda 7 to Camunda 8.

Use the History Data Migrator to copy process instance audit data to Camunda 8.


## About history migration

Process instances leave traces, referred to as [history in Camunda 7](https://docs.camunda.org/manual/latest/user-guide/process-engine/history/). These are audit logs of when a process instance was started, what path it took, and so on.

It is important to note that audit data can exist for ended processes from the past, but is also available for currently still running process instances, as those process instances also left traces up to the current wait state.

The History Data Migrator can copy this audit data to Camunda 8. For process instances that were still active or suspended in Camunda 7, the migrated history data will be marked as canceled in Camunda 8. This ensures a clear audit trail while preventing confusion with actively running instances in Camunda 8.

Audit data migration might need to look at a huge amount of data, which can take time to migrate.
You can run audit data migration alongside normal operations (for example, after the successful big bang migration of runtime process instances) so that it doesn't require downtime and as such, the performance might not be as critical as for runtime instance migration.

During history migration, the Data Migrator maps the Camunda 7 process instance `businessKey` to Camunda 8 `businessId`.
If no business key is present, the process instance is migrated without a business ID. If the business key is blank, it is migrated as a blank business ID.

During migration, the History Data Migrator sets a `legacyId` variable in the process instances to link them to their original Camunda 7 process instances.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
