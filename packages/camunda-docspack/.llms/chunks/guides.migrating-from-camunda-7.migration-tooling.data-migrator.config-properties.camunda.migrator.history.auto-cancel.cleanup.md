# Configuration property reference — `camunda.migrator.history.auto-cancel.cleanup`

Prefix: `camunda.migrator.history.auto-cancel.cleanup`

Configuration for history cleanup of auto-canceled instances.

| Property   | Type      | Description                                                                                                                                                                                                                       |
| :--------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.enabled` | `boolean` | Whether to populate cleanup dates for auto-canceled entities. When `false`, history cleanup dates are set to `null` for all auto-canceled instances. Default: `true`.                                                             |
| `.ttl`     | `period`  | Time-to-live for auto-canceled history records. The cleanup date is calculated as `end_date + ttl`. Accepts ISO-8601 duration format (e.g., `P6M` for 6 months, `P1Y` for 1 year, `P90D` for 90 days). Default: `P6M` (6 months). |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties
