# Manage users in your organization — Elevated workspace access

Organization admins and owners always have **Workspace Admin** access to every workspace in the organization, including workspaces they aren't explicitly a member of. This access is on by default and can't be changed.

The main purpose of this access is to assign members to workspaces that have no members. Ordinarily, these workspaces would not be accessible or visible to any other users.

The user must be assigned the organization **Organization Owner** or **Organization Admin** role.

The user must be assigned the **Hub Admin** role.

If the role is not pre-existing, it can be created with the following permissions:

- Hub Internal API - `write:*`
- Hub Internal API - `admin:*`
- Camunda Identity Resource Server - `read:users`

Refer to the documentation pages about [assigning roles](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles) and [adding permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview) for detailed instructions.

#### Other roles

Beyond the roles above, an organization may show a few additional roles depending on its history:

- **Developer** _(deprecated)_: No longer offered for new assignment. Existing holders keep their current permissions unchanged; they are not automatically moved to another role.
- **Task user** and **Visitor** _(legacy)_: Available only for organizations with at least one cluster on version 8.7 or older, alongside a user's organization-level role. They govern access to the older cluster apps and disappear once no such clusters remain.
- **Support agent** _(internal)_: Used only by the Camunda support team. Not assignable by customers.

Users are invited to a Camunda 8 organization via their email address, which must be accepted by the user. The user remains in the `Pending` state until the invitation is accepted.

People who do not yet have a Camunda 8 account can also be invited to an organization. To access the organization, the invited individual must first create a Camunda 8 account by following the instructions in the invitation email.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index
