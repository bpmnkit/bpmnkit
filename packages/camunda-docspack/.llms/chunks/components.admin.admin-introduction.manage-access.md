# Introduction to Admin — Manage access

Depending on your setup, Admin allows you to manage Orchestration Cluster access as follows:

| Entity                             | Description                                                                                                                         | Availability      |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :---------------- |
| [Users](https://docs.camunda.io/docs/next/components/admin/user)                   | Individuals who can access applications and perform actions based on their permissions.                                             | All deployments   |
| [Groups](https://docs.camunda.io/docs/next/components/admin/group)                 | Simplify access management by granting permissions collectively to groups of users.                                                 | All deployments   |
| [Roles](https://docs.camunda.io/docs/next/components/admin/role)                   | Sets of permissions to define what actions can be performed on specific resources. Roles can be assigned to users and groups.       | All deployments   |
| [Authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) | The specific permissions that connect users, groups, or roles with resources and actions (for example, `READ`, `UPDATE`, `DELETE`). | All deployments   |
| [Tenants](https://docs.camunda.io/docs/next/components/admin/tenant)               | Logically isolate data within a single cluster. This is useful for multi-tenancy applications.                                      | All deployments   |
| [Cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin)  | A separate role for cluster-wide operations that span all Physical Tenants, such as status, topology, and restore.                  | Self-Managed only |

**Info: Admin in Self-Managed**
For documentation on deploying Admin as part of Camunda 8 Self-Managed, see [Admin in Self-Managed](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview).

---
Source: https://docs.camunda.io/docs/next/components/admin/admin-introduction
