# Limitations — History — Incidents

The History Data Migrator supports migration of DMN entities, but with the following limitations:

- The incidents are migrated in `resolved` state. Operate does not visualize resolved incidents,
  therefore incidents of migrated process instances will not be visible in Operate.
  Audit data related to incidents can be observed by querying APIs.
- When there's a failing start timer in Camunda 7, the incident cannot be migrated (as there's no process instance history) and will be skipped.
- Incidents associated with multi-instance activities are skipped. (https://github.com/camunda/camunda-7-to-8-migration-tooling/issues/1103)
- Incidents whose corresponding Camunda 7 historic activity instance was never persisted are skipped. This happens for async-before activities that fail on all available retries before the activity is entered, so no `flowNodeInstanceKey` can be resolved. Camunda 8.10 enforces non-nullability on `flowNodeInstanceKey`; previously these incidents were migrated with a null value. The skip is recorded in the skip log with a reason.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
