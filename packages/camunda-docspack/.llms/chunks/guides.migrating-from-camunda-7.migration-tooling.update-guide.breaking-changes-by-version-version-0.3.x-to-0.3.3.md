# Update guide — Breaking changes by version — Version 0.3.x to 0.3.3

**Release date:** TBD \
**Camunda 8 compatibility:** 8.9.x

#### Data Migrator: History nullability fixes

This patch fixes cases where the History Data Migrator wrote `null` values for fields that Camunda 8.10 enforces as non-nullable. Without these fixes, data migrated with the History Data Migrator can fail during migration from Camunda 8.9 to 8.10. The fixes change migration behavior in two ways:

- **Some rows are now skipped instead of migrated.** Jobs and incidents whose corresponding Camunda 7 historic activity instance was never persisted (async-before activities that fail on all available retries before entry) were previously migrated with a null `elementInstanceKey` / `flowNodeInstanceKey`. These rows are now skipped and recorded in the skip log with a reason. See [Jobs](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations#jobs) and [Incidents](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations#incidents-1) limitations.
- **Some previously-null fields now carry a value.** Job `worker`, incident `errorMessage`, and audit log `entityKey` are now populated, using a placeholder (for example, `C7_MIGRATED` or `C7_NO_MESSAGE`) if the value would have been `null` otherwise. Job `lastUpdateTime` is now populated from the most recent Camunda 7 historic log entry. See the [History migration coverage](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history-coverage) page for per-field details.

**Note**
If you already migrated history data with 0.3.0, re-running the migrator after this update applies the new behavior only to newly migrated rows. Rows already written with `null` values are not retroactively corrected.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/update-guide
