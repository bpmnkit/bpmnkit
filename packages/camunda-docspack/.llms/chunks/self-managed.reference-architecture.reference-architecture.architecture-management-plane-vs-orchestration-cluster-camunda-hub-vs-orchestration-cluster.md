# Camunda 8 reference architectures — Architecture — Management plane vs Orchestration Cluster {#camunda-hub-vs-orchestration-cluster}

When designing a reference architecture, it's essential to understand the differences between the management plane and the Orchestration Cluster. These components serve different purposes, include distinct elements, and are deployed separately.

#### Management plane {#camunda-hub}

<!-- Source: https://miro.com/app/board/uXjVL-6SrPc=/?moveToWidget=3458764670398265451&cot=14 -->

![Camunda Hub](./img/management-cluster.jpg)

The management plane can connect to multiple Orchestration Clusters across environments, such as development, integration, and production. It consists of:

- [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index): Manage organizational resources, analyze operations and business value, and deliver agentic processes at scale.
- [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview): Centralized authentication and authorization service.

**Note: Admin separation**
Camunda Hub uses a separate Management Identity deployment, distinct from the embedded Admin in the Orchestration Cluster. Optimize also requires Management Identity and cannot use the embedded Orchestration Cluster Admin.  

#### Orchestration Cluster

![Orchestration Cluster](./img/orchestration-cluster.jpg)

The Orchestration Cluster is the core of Camunda.

Zeebe, Operate, Tasklist, and Admin are bundled into a single artifact:

- [Zeebe](https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview): Highly scalable, cloud-native workflow engine that tracks the state of active process instances and drives business processes from start to finish.
- [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction): Monitoring tool for visualizing and troubleshooting process instances running in Zeebe.
- [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist): User interface for interacting with user tasks, including assigning and completing them.
- [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview): Integrated authentication and authorization service for managing access to all Orchestration Cluster components and APIs.

[Connectors](https://docs.camunda.io/docs/next/components/connectors/introduction) are reusable building blocks for connecting processes to external systems, applications, and data. They run as a separate workload, but are deployed with the Orchestration Cluster as part of the same release. Throughout these guides, "Orchestration Cluster" includes Connectors unless stated otherwise.

This unified architecture ensures seamless communication, consistent state management, and reliable process execution across all components.

#### Optimize

[Optimize](https://docs.camunda.io/docs/next/components/optimize/what-is-optimize) is a business intelligence tool for analyzing bottlenecks and examining improvements in automated processes. It analyzes process data exported by an Orchestration Cluster.

Optimize is deployed separately from the Orchestration Cluster, one instance per Physical Tenant, because each instance reads exported records from a single index prefix. Optimize requires Management Identity and can't use the Orchestration Cluster's Admin. It can use the Management Identity in the management plane, shared with Camunda Hub, or a separate one when Physical Tenants need identical logical tenant IDs enforced independently. See [Optimize and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize#known-limitation-logical-tenants-with-the-same-id-across-physical-tenants).

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
