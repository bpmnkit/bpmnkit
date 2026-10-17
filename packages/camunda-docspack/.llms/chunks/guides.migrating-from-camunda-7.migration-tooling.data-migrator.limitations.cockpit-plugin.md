# Limitations — Cockpit plugin

The [Cockpit plugin](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/cockpit-plugin) has the following limitations:

- The migration schema has no authorization mechanism. Anyone with authenticated access to the Camunda 7 Cockpit can see the Cockpit Plugin and read the migration schema.
- If the migration of a process instance or any other entity is skipped for multiple reasons, only one reason is stored and displayed.
  - See https://github.com/camunda/camunda-bpm-platform/issues/5389
- For historic data migration the skip reason is currently only stored for the initial migration attempt. If migration fails again after retry, the skip reason is not updated.
  - See https://github.com/camunda/camunda-bpm-platform/issues/5390
- There are currently some UI inconsistencies. See:
  - https://github.com/camunda/camunda-bpm-platform/issues/5422
  - https://github.com/camunda/camunda-bpm-platform/issues/5423
  - https://github.com/camunda/camunda-bpm-platform/issues/5424
- The Cockpit plugin doesn't have extensive test coverage yet so we cannot guarantee a high level of stability and therefore don't claim it to be production-ready.
  - See https://github.com/camunda/camunda-bpm-platform/issues/5404

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
