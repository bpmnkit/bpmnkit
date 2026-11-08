# Manage users and roles — Manage users {#manage-users-self-managed}

You create users in your identity provider, and manage users, groups, and roles in Management Identity.

- [Management Identity user, group, and role management](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/identity-application-user-group-role-management-overview)
- [Manage groups](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-groups)
- [Manage roles](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles)


## Roles and permissions {#roles-and-permissions-self-managed}

Users are assigned organization-level roles. The following table shows what each role can do.

| Role               | Organization | Workspaces and projects | Clusters | Environments  | Catalog   | Optimize and business value |
| :----------------- | :----------- | :---------------------- | :------- | :------------ | :-------- | :-------------------------- |
| Organization Admin | Manage       | Manage                  | Manage   | Manage        | Manage    | Yes                         |
| DevOps             | None         | Create and collaborate  | Manage   | Manage        | Read-only | No                          |
| Analyst            | Read-only    | Create and collaborate  | None     | Assigned only | Manage    | Yes                         |
| Member             | Read-only    | Create and collaborate  | None     | Assigned only | Read-only | No                          |

- **Organization Admin**: Manages the organization, its members, and its workspaces, with full access to every workspace and project by default. No separate mode needs to be enabled.
- **DevOps**: A specialized role for infrastructure management, not people management. Grants the ability to view all clusters and their details, plus Member-level modeling. Cannot manage or view organization members or organization settings.
- **Analyst**: Includes everything a Member can do, plus full access to Optimize to build process dashboards and reports. Access to specific dashboards and reports within Optimize is governed separately by [Optimize collection roles](https://docs.camunda.io/docs/next/components/optimize/userguide/user-permissions).
- **Member**: Full access to create and collaborate on workspaces and projects, plus read-only visibility into the organization.

### Management Identity roles {#management-identity-roles-self-managed}

In Self-Managed, you assign roles in Management Identity. The **Hub Admin** role gives the access of an Organization Admin, and the **Hub** role the access of a Member. The **DevOps** and **Analyst** roles keep their names. The default roles **DevOps**, **Hub**, and **Hub Admin** were previously known as **Console**, **Web Modeler**, and **Web Modeler Admin**. The earlier roles still exist, grant the same permissions, and are kept for backward compatibility. See [default roles](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles#default-roles).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles
