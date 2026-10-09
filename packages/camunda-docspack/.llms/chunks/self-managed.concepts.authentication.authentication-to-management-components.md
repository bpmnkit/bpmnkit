# Management and modeling component authentication in Self-Managed

Learn about authentication methods for management and modeling components in Self-Managed and how to choose the right one for your environment.

[Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview) authenticates with the same `camunda.security.*` settings as the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster). [Camunda Hub](https://docs.camunda.io/docs/next/self-managed/components/hub/index) keeps its own authentication properties in 8.10; see [Camunda Hub authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity) for details.

User, group, role, tenant, and permission management for Camunda Hub and Optimize stays in [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview). The Orchestration Cluster is not affected, because it manages its own users, groups, roles, and authorizations.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components
