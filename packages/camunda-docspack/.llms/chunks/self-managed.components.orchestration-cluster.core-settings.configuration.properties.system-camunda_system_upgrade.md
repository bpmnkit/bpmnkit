# Property reference — System — `CAMUNDA_SYSTEM_UPGRADE`

| Property                                    | Description                                                                                                                                                                                                                                                                    | Default value | Overridable per Physical Tenant |
| :------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_SYSTEM_UPGRADE_ENABLEVERSIONCHECK` | Toggles the version check restriction, used for migration.This is useful for testing migration logic on snapshot or alpha versions.The default value `true` means it is not allowed to migrate to an incompatible version such as: `SNAPSHOT` or `alpha`. | `true`        | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
