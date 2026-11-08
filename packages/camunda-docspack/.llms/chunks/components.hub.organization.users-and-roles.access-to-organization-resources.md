# Manage users and roles — Access to organization resources

The organization-level roles of a user set the level of access to each of the following resources. The table above lists the level for each role. This section describes what each level means.

### Workspace and project access

- **Manage**: Full access to every workspace and project in the organization. Organization Owner and Organization Admin have this level. See [elevated workspace access](#elevated-workspace-access).
- **Create and collaborate**: Create and collaborate on workspaces and projects. DevOps, Analyst, and Member have this level. What a user can do inside a workspace also depends on their [workspace role](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members#workspace-roles).

### Elevated workspace access

Organization admins and owners always have **Workspace Admin** access to every workspace in the organization, including workspaces they aren't explicitly a member of. This access is on by default and can't be changed.

The main purpose of this access is to assign members to workspaces that have no members. Ordinarily, these workspaces would not be accessible or visible to any other users.

The user must be assigned the organization **Organization Owner** or **Organization Admin** role.

### Catalog access

- **Manage**: Browse and use catalog items, and also see usage statistics and adoption data. Analyst, Organization Admin, and Organization Owner have this level.
- **Read-only**: Browse and use catalog items. Member and DevOps have this level.

### Business value access

Access to Optimize includes access to the [business value dashboard](https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/business-value-dashboard), where users view metrics and set targets. The same roles that grant access to Optimize also grant access to business value: Analyst, Organization Admin, and Organization Owner.

### Cluster visibility

- **Manage**: Create and update clusters, and manage cluster clients, connector secrets, IP allowlists, secure connectivity, and encryption. Organization Owner, Organization Admin, and DevOps have this level.
- **None**: No access to the cluster pages. Analyst and Member have this level.

### Environment visibility

- **Manage**: View all environments and resume paused ones. Organization Owner, Organization Admin, and DevOps have this level. Only Organization Owner and Organization Admin can assign environments to workspaces.
- **Assigned only**: See only the environments assigned to the workspaces where the user is an editor or a workspace admin. Analyst and Member have this level.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles
