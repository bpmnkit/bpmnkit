# Manage users and roles — Roles and permissions

Every user holds one organization-level role. The following table shows what each role can do.

| Role                           | Organization | Workspaces and projects | Clusters | Environments  | Catalog   | Optimize and business value |
| :----------------------------- | :----------- | :---------------------- | :------- | :------------ | :-------- | :-------------------------- |
| Organization Owner (SaaS only) | Full access  | Manage                  | Manage   | Manage        | Manage    | Yes                         |
| Organization Admin             | Manage       | Manage                  | Manage   | Manage        | Manage    | Yes                         |
| DevOps                         | None         | Create and collaborate  | Manage   | Manage        | Read-only | No                          |
| Analyst                        | Read-only    | Create and collaborate  | None     | Assigned only | Manage    | Yes                         |
| Member                         | Read-only    | Create and collaborate  | None     | Assigned only | Read-only | No                          |

- **Organization Owner** (SaaS only): All rights in the organization, including settings, billing, and ownership transfer. Reserved for a single user per organization; transferred rather than assigned or removed like other roles.
- **Organization Admin**: Manages the organization, its members, and its workspaces, with full access to every workspace and project by default. No separate mode needs to be enabled.
- **Analyst**: Includes everything a Member can do, plus full access to Optimize to build process dashboards and reports. Access to specific dashboards and reports within Optimize is governed separately by [Optimize collection roles](https://docs.camunda.io/docs/next/components/optimize/userguide/user-permissions).
- **Member**: Full access to create and collaborate on workspaces and projects, plus read-only visibility into the organization.
- **DevOps**: A specialized role for infrastructure management, not people management. Grants cluster create and update, cluster clients, connector secrets, IP allowlisting, secure connectivity, encryption, and the connector-management view, plus Member-level modeling. Cannot manage or view organization members, billing, or organization settings.

Catalog access has two levels: **Read-only** (browse and use catalog items) for Member and DevOps, and **Manage** (also see usage statistics and adoption data) for Analyst, Organization Admin, and Organization Owner.

Environment access has two levels: **Manage** (view all environments and resume paused ones) for Organization Owner, Organization Admin, and DevOps, and **Assigned only** for Analyst and Member. Only Organization Owner and Organization Admin can assign environments to workspaces. Users with the **Assigned only** level see the environments assigned to the workspaces where they are an editor or a workspace admin.

Business value access includes viewing the [business value dashboard](https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/business-value-dashboard) and setting targets. The same roles that grant access to Optimize also grant access to business value.

Starting with version 8.8, user access to clusters' Operate, Tasklist, and Zeebe applications is managed independently of the organization role. To control what a user can access there, define their authorizations in the cluster's [Admin](https://docs.camunda.io/docs/next/components/admin/authorization).

If cluster authorizations are disabled, the user will have full access to the cluster and its components.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles
