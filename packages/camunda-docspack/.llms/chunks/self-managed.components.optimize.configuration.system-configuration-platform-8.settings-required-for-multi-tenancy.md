# Camunda 8 system configuration — Settings required for multi-tenancy

Camunda 8 Self-Managed only

For more information on multi-tenancy in Camunda 8 Self-Managed environments, refer
to [this page](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/multi-tenancy).

To use multi-tenancy, the feature must be enabled across all components.

| YAML path                  | Default value | Description                                              |
| -------------------------- | ------------- | -------------------------------------------------------- |
| multitenancy.enabled       | false         | Enables the Camunda 8 multi-tenancy feature in Optimize. |
| security.auth.ccsm.baseUrl | null          | The base URL of Identity.                                |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8
