# Configuration variables — Feature flags

Identity uses feature flag environment variables to enable and disable features; the supported flags are:

| Environment variable         | Description                                      | Default value |
| :--------------------------- | :----------------------------------------------- | :------------ |
| RESOURCE_PERMISSIONS_ENABLED | Controls the resource authorizations feature.    | false         |
| MULTITENANCY_ENABLED         | Controls the multi-tenancy feature for Optimize. | false         |

**Note**
Setting either of the feature flags to `true` requires a database connection. To configure a database
connection, see [database configuration](#database-configuration).

**Note**
When using the Camunda Helm chart, setting `MULTITENANCY_ENABLED: true` alone does not enable the Tenants tab in Management Identity. You must also set `global.multitenancy.enabled: true` in your Helm values. Without the global flag, the Tenants tab does not appear in Management Identity even when `MULTITENANCY_ENABLED` is set to `true`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables
