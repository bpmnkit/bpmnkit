# Limitations — Runtime — General limitations

- To migrate running process instances, the historic process instance must exist.
  - You cannot migrate running instances when you have configured history level to `NONE` or a custom history level that doesn't create historic process instances.
  - The minimum supported history level is `ACTIVITY`.
- You must add an execution listener of type `migrator` to all your start events.
- Migration of users, groups, or tenants as well as authorizations is currently not supported.
  - You must ensure that the users, groups, and authorizations are already migrated to Camunda 8 before migrating process instances.
  - See https://github.com/camunda/camunda-bpm-platform/issues/5175
- Data changed via user operations
  - Data set via user operations like setting a due date to a user task cannot be migrated currently.
  - Job and process priority values are not migrated. During migration a new Camunda 8 process instance is created, so it uses the job priorities defined on its Camunda 8 process definition rather than any values from the Camunda 7 instance.
  - See https://github.com/camunda/camunda-bpm-platform/issues/5182

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
