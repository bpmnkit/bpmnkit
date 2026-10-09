# Property reference — Data - primary storage — `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_RETENTION`

| Property                                                       | Description                                                                                                                                                                                                             | Default value | Overridable per Physical Tenant                                                   |
| :------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :-------------------------------------------------------------------------------- |
| `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_RETENTION_WINDOW`          | The active window of backups available for restore in the configured backup store. Uses an ISO-8601 duration, for example `PT5M`.                                                                                       | `-`           | Yes                                                                               |
| `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_RETENTION_CLEANUPSCHEDULE` | The interval at which the retention mechanism checks for backups outside the active window. Can be a CRON expression, an ISO-8601 duration, or `none`. For example, every 5 minutes would be `0 */5 * * * *` or `PT5M`. | `-`           | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
