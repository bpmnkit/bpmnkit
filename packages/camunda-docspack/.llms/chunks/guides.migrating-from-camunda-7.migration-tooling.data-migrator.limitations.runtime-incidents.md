# Limitations — Runtime — Incidents

Due to the [limitation regarding async before/after wait states](#async-beforeafter-wait-states), incident data from instances currently waiting due to failed jobs causing active incidents will not be migrated during runtime migration. We recommend to resolve incidents prior to runtime migration.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
