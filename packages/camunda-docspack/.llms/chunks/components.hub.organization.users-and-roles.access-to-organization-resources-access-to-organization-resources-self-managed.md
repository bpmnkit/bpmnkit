# Manage users and roles — Access to organization resources {#access-to-organization-resources-self-managed}

The organization-level roles of a user set the level of access to each of the following resources. The table above lists the level for each role. This section describes what each level means.

### Workspace and project access {#workspace-and-project-access-self-managed}

- **Manage**: Full access to every workspace and project in the organization. Organization Admin has this level. See [elevated workspace access](#elevated-workspace-access-self-managed).
- **Create and collaborate**: Create and collaborate on workspaces and projects. DevOps, Analyst, and Member have this level. What a user can do inside a workspace also depends on their [workspace role](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members#workspace-roles).

### Elevated workspace access {#elevated-workspace-access-self-managed}

Organization admins always have **Workspace Admin** access to every workspace in the organization, including workspaces they aren't explicitly a member of. This access is on by default and can't be changed.

The main purpose of this access is to assign members to workspaces that have no members. Ordinarily, these workspaces would not be accessible or visible to any other users.

The user must be assigned the **Hub Admin** role.

If the role is not pre-existing, it can be created with the following permissions:

- Hub Internal API - `write:*`
- Hub Internal API - `admin:*`
- Camunda Identity Resource Server - `read:users`

Refer to the documentation pages about [assigning roles](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles) and [adding permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview) for detailed instructions.

### Catalog access {#catalog-access-self-managed}

- **Manage**: Browse and use catalog items, and also see usage statistics and adoption data. Analyst and Organization Admin have this level.
- **Read-only**: Browse and use catalog items. Member and DevOps have this level.

### Business value access {#business-value-access-self-managed}

Access to Optimize includes access to the [business value dashboard](https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/business-value-dashboard), where users view metrics and set targets. The same roles that grant access to Optimize also grant access to business value: Analyst and Organization Admin.

### Cluster visibility {#cluster-visibility-self-managed}

- **Manage**: View all clusters and their details. In Self-Managed, you provision clusters outside Camunda Hub, and Camunda Hub is read-only for clusters. Organization Admin and DevOps have this level.
- **None**: No access to the cluster pages. Analyst and Member have this level.

### Environment visibility {#environment-visibility-self-managed}

- **Manage**: View all environments. Organization Admin and DevOps have this level. Only Organization Admin can assign environments to workspaces.
- **Assigned only**: See only the environments assigned to the workspaces where the user is an editor or a workspace admin. Analyst and Member have this level.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles
