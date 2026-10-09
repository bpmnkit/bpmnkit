# Management Identity — Get started

If you're new to Management Identity, learn how to access and log in to the Management Identity UI.

- [Get started with Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/identity-first-steps)


## Core concepts

Learn about the core concepts of Management Identity.

### Authentication

Management Identity supports two types of authentication:

- **Web login**: Users access web applications through an IdP login page.
- **Machine-to-machine (M2M)**: Applications authenticate using tokens for API access.

Both methods use the [OAuth 2.0 protocol](https://oauth.net/2/) for secure authentication.

- [Learn about authentication methods](https://docs.camunda.io/docs/next/self-managed/components/management-identity/authentication)

### User, group, role, and application management

Organize and control access using a role-based access control (RBAC) model.

- [Manage users, groups, roles, and applications](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/identity-application-user-group-role-management-overview)

### Access management

Control who can access what by assigning permissions through roles.

- [Manage access and permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview)

### Multi-tenancy

**Note**
This section describes **logical tenants** for Optimize. For strong physical isolation of separate teams or organizations within a single cluster, see [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants), including the [Optimize deployment guidance](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index#optimize-deployment).

Isolate data and access in Optimize between different customers or business units by organizing resources into tenants. This is effective only if you have [multi-tenancy checks enabled for your Orchestration Cluster](https://docs.camunda.io/docs/next/components/admin/tenant).

- [Manage tenants for Optimize](https://docs.camunda.io/docs/next/self-managed/components/management-identity/manage-tenants)

### Mapping rules

Automatically assign roles and tenants to users based on information in their authentication tokens (JWT claims). This enables dynamic access control when integrating with external identity providers.

- [Configure mapping rules](https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview
