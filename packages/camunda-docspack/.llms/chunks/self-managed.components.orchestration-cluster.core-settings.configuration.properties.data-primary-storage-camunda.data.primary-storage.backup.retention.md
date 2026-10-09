# Property reference — Data - primary storage — `camunda.data.primary-storage.backup.retention`

| Property                                               | Description                                                                                                                                                                                                                      | Default value | Overridable per Physical Tenant                                                   |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :-------------------------------------------------------------------------------- |
| `camunda.data.primary-storage.backup.retention.window` | The active window of backups available for restore in the configured backup store, ISO8601 duration. For example `PT5M`                                                                                                          | `-`           | Yes                                                                               |
| `camunda.data.primary-storage.backup.cleanup-schedule` | The interval at which the retention mechanism checks for backups outside the active window. Can be a CRON expression, ISO8601 duration or `none`. For example, every 5 minutes would be `0 */5 * * * *` and `PT5M` respectively. | `-`           | Needs verification ([#9795](https://github.com/camunda/camunda-docs/issues/9795)) |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
