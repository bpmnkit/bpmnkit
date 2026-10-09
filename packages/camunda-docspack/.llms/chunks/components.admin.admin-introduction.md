# Introduction to Admin

Admin is the cluster-level admin UI for managing administrative jobs for an orchestration cluster.

Use the integrated [Orchestration Cluster](https://docs.camunda.io/docs/next/components/orchestration-cluster) Admin (formerly Orchestration Cluster Identity) to manage Camunda 8 authentication, authorization, and cluster administration.

**Note**
This was renamed in 8.9 to reflect its expanded scope and to avoid confusion with [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview).


## About Admin

The Orchestration Cluster Admin interface centralizes all key administrative jobs for a single cluster.

This interface manages identity and access control for cluster components, including Zeebe, Operate, Tasklist, and Orchestration Cluster APIs, while also handling other core features such as cluster variables and the global user task listener. This provides administrators with one central place to configure and operate their clusters end-to-end.

Admin includes the following features:

| Feature                                                     | Description                                                                                                                                                   |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unified access management                                   | Authentication and authorization are handled consistently across all Orchestration Cluster components and APIs.                                               |
| Flexible authentication                                     | Admin supports multiple authentication modes, including no authentication, Basic authentication, and OpenID Connect (OIDC), depending on the deployment type. |
| Tenant management                                           | Multi-tenancy is managed directly within the Orchestration Cluster, allowing for clear separation of resources.                                               |
| [Cluster variables](https://docs.camunda.io/docs/next/components/admin/cluster-variables)                   | Manage configuration values centrally across your cluster, making them available in FEEL expressions.                                                         |
| [Global user task listeners](https://docs.camunda.io/docs/next/components/admin/global-user-task-listeners) | Configure cluster-wide listeners that react to user task lifecycle events across all processes.                                                               |

For details about authorization concepts, resources, and configuration, see
[Orchestration Cluster authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

---
Source: https://docs.camunda.io/docs/next/components/admin/admin-introduction
