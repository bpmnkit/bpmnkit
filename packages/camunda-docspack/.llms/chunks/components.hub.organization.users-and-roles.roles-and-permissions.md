# Manage users and roles — Roles and permissions

Users are assigned organization-level roles. The following table shows what each role can do.

| Role               | Organization | Workspaces and projects | Clusters | Environments  | Catalog   | Optimize and business value |
| :----------------- | :----------- | :---------------------- | :------- | :------------ | :-------- | :-------------------------- |
| Organization Owner | Full access  | Manage                  | Manage   | Manage        | Manage    | Yes                         |
| Organization Admin | Manage       | Manage                  | Manage   | Manage        | Manage    | Yes                         |
| DevOps             | None         | Create and collaborate  | Manage   | Manage        | Read-only | No                          |
| Analyst            | Read-only    | Create and collaborate  | None     | Assigned only | Manage    | Yes                         |
| Member             | Read-only    | Create and collaborate  | None     | Assigned only | Read-only | No                          |

- **Organization Owner**: All rights in the organization, including settings, billing, and ownership transfer. Reserved for a single user per organization; transferred rather than assigned or removed like other roles.
- **Organization Admin**: Manages the organization, its members, and its workspaces, with full access to every workspace and project by default. No separate mode needs to be enabled.
- **DevOps**: A specialized role for infrastructure management, not people management. Grants cluster create and update, cluster clients, connector secrets, IP allowlisting, secure connectivity, encryption, and the connector-management view, plus Member-level modeling. Cannot manage or view organization members, billing, or organization settings.
- **Analyst**: Includes everything a Member can do, plus full access to Optimize to build process dashboards and reports. Access to specific dashboards and reports within Optimize is governed separately by [Optimize collection roles](https://docs.camunda.io/docs/next/components/optimize/userguide/user-permissions).
- **Member**: Full access to create and collaborate on workspaces and projects, plus read-only visibility into the organization.

### Additional roles

Beyond the roles above, an organization may show a few legacy roles depending on its history. They aren't recommended with Camunda Hub:

- **Developer** _(deprecated)_: No longer offered for new assignment. Existing holders keep their current permissions unchanged; they are not automatically moved to another role.
- **Task user** and **Visitor** _(legacy)_: Available only for organizations with at least one cluster on version 8.7 or older, alongside a user's organization-level roles. They govern access to the older cluster apps and disappear once no such clusters remain.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles
