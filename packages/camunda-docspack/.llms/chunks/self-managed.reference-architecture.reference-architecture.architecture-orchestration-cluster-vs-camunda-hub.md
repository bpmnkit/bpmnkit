# Camunda 8 reference architectures — Architecture — Orchestration Cluster vs Camunda Hub

When designing a reference architecture, it's essential to understand the differences between Orchestration Cluster and Camunda Hub Self-Managed. These components serve different purposes and include distinct elements.

In Camunda 8.10, they're also deployed separately. Each Helm release declares its role through `global.topology.mode`, so one `hub` release running Camunda Hub and Management Identity can serve many independently deployed `orchestration` releases, with one `optimize` release per [Physical Tenant](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants). For the release roles, their requirements, and how to choose between them, see [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology).

#### Orchestration Cluster

![Orchestration Cluster](./img/orchestration-cluster.jpg)

The Orchestration Cluster is the core of Camunda.

The following components are bundled into a single artifact:

- [Zeebe](https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview): Highly scalable, cloud-native workflow engine that tracks the state of active process instances and drives business processes from start to finish.
- [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction): Monitoring tool for visualizing and troubleshooting process instances running in Zeebe.
- [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist): User interface for interacting with user tasks, including assigning and completing them.
- [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview): Integrated authentication and authorization service for managing access to all Orchestration Cluster components and APIs.

Tightly integrated with the Orchestration Cluster:

- [Optimize](https://docs.camunda.io/docs/next/components/optimize/what-is-optimize): Business intelligence tool for analyzing bottlenecks and examining improvements in automated processes.
- [Connectors](https://docs.camunda.io/docs/next/components/connectors/introduction): Reusable building blocks for easily connecting processes to external systems, applications, and data.

This unified architecture ensures seamless communication, consistent state management, and reliable process execution across all components.

Connectors deploy with the Orchestration Cluster release. Optimize is deployed as its own release, one per Physical Tenant, because each Optimize instance reads exported records from a single index prefix. See [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release).

#### Camunda Hub

<!-- Source: https://miro.com/app/board/uXjVL-6SrPc=/?moveToWidget=3458764670398265451&cot=14 -->

![Camunda Hub](./img/management-cluster.jpg)

Camunda Hub is designed to interact with multiple orchestration clusters:

- [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index): Manage organizational resources, analyze operations and business value, and deliver agentic processes at scale.
- [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview): Centralized authentication and authorization service.

**Note: Admin separation**
Camunda Hub uses a separate Management Identity deployment, distinct from the embedded Admin in the Orchestration Cluster. Optimize also requires Management Identity and cannot use the embedded Orchestration Cluster Admin.  

#### Admin vs Management Identity

The following table outlines the key differences between Admin and Management Identity:

| Category                  | Admin                                                                                                                                                                                                                                                                                                                                                                                                                                          | Management Identity                                                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope                     | Provides access and permission management for all Orchestration Cluster components: Zeebe, Operate, Tasklist, and the Orchestration Cluster REST and gRPC API.                                                                                                                                                                                                                                                                                 | Manages access for Camunda Hub and Optimize.                                                                                                                                                 |
| Unified access management | Authentication and authorizations are handled directly by the Orchestration Cluster across all components and APIs, eliminating any dependency on Management Identity.                                                                                                                                                                                                                                                                         | Manages access for Camunda Hub and Optimize.                                                                                                                                                 |
| Authentication            | No authentication: No authentication required for API access. Form-based login in the UI. Users and groups are managed in Admin.Basic authentication: API access with Basic authentication. Form-based login in the UI. Users and groups are managed in Admin.OIDC: Any compatible identity provider (for example, Keycloak, Microsoft Entra ID, Okta). | Direct Keycloak integration (default).OIDC: Any compatible identity provider (for example, Keycloak, Microsoft Entra ID, Okta). |
| Authorizations            | Fine-grained [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) provide consistent access control for process instances, tasks, and decisions across components and APIs.                                                                                                                                                                                                                                                 |                                                                                                                                                                                              |
| Keycloak integration      | Treated as a standard external identity provider integrated via OIDC, making it easier to use other providers without special integration.                                                                                                                                                                                                                                                                                                     | Default Keycloak integration, with OIDC available for other providers.                                                                                                                       |
| Tenant management         | Tenants are directly managed within the Orchestration Cluster, allowing per-cluster tenant management.                                                                                                                                                                                                                                                                                                                                         | Does not manage tenants for Orchestration Cluster components. Tenants apply only to Optimize.                                                                                                |

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture
