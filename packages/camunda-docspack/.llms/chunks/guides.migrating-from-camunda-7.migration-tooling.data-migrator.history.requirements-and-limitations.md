# History — Requirements and limitations

The following requirements and limitations apply:

- Camunda 7 must be stopped, and the Camunda 8 database must be reachable. Zeebe can be stopped during history migration.
- The History Data Migrator must be able to access the Camunda 7 database.
- The History Data Migrator can migrate data to Camunda 8 only when a relational database (RDBMS) is used.
- The History Data Migrator must be able to access the Camunda 8 database. As a result, you can run this tool only in a self-managed environment.
- If you manipulate Camunda 7 data between History Data Migrator runs, data consistency might be affected. See [auto-cancellation of active instances](#auto-cancellation-of-active-instances) for details.
- **History cleanup during migration**: If you keep Camunda 8 running and history cleanup is enabled during history migration, and cleanup dates are due (for example, past removal times from Camunda 7 or negative auto-cancel TTL values), Camunda 8 history cleanup will run concurrently with migration. This may result in parent entities being cleaned up before their children are migrated, causing child entities to be skipped. See [history cleanup](#history-cleanup) for mitigation strategies.
- If you migrate runtime and history data for an active Camunda 7 process instance, two separate records will appear in Operate:
  1. **Fresh runtime instance**: The migrated active process instance running on Zeebe. This instance continues execution from the last wait state before migration and produces new history going forward. It does not include historical data from before the migration.
  2. **Auditable instance**: A canceled historic process instance that preserves the audit trail (history data) up to the last wait state pre-migration. This instance appears as canceled and serves only as an audit record of what happened in Camunda 7.

  These two instances are separate entities and are not automatically linked in the UI, although they share the same process variables from the migration point.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
