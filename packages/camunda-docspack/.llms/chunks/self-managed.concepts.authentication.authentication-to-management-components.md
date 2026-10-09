# Management and modeling component authentication in Self-Managed

Learn about authentication methods for management and modeling components in Self-Managed and how to choose the right one for your environment.

The Camunda 8 management and modeling components authenticate with the same `camunda.security.*` settings as the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster). This includes components such as [Camunda Hub](https://docs.camunda.io/docs/next/self-managed/components/hub/index) and [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview).

In 8.10, these shared settings cover authentication only. User, group, role, tenant, and permission management for Camunda Hub and Optimize stays in [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview). The Orchestration Cluster is not affected, because it manages its own users, groups, roles, and authorizations.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components
