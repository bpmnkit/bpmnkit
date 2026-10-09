# Admin in Self-Managed — Configure initial users

If users are managed within the Orchestration Cluster (that is, without an external Identity Provider), you can create an initial user in three ways:

If you use an external Identity Provider instead, continue with [connect Admin to an identity provider](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider).

- Using the [Orchestration Cluster UI](#option-1-orchestration-cluster-ui)
- Using the [Setup endpoint of the Orchestration Cluster REST API](#option-2-setup-rest-api)
- Using the [configuration](#option-3-configuration)

**Info: Production and no-clickops setups**
For production environments, prefer **Option 3: configuration** so your admin bootstrap, role assignments, and authentication settings are defined declaratively in `application.yaml`, environment variables, or Helm-managed application configuration.

The UI and Setup API options are useful for manual bootstrap, but they are not the best fit for repeatable, Git-managed deployments.

Typical production next steps are:

- Define initial users with the [configuration examples](#option-3-configuration) and assign them to roles with the [role assignment examples](#assign-users-clients-groups-or-mapping-rules-to-roles-via-configuration).
- If you deploy with Helm, provide these settings through [application configs](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs) and the [Helm authentication and authorization guides](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index).

**Warning**
After completing the initial setup, ensure at least one user remains assigned to the `admin` role.  
If no admin user exists, a third party could create a new admin account and gain full access.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
