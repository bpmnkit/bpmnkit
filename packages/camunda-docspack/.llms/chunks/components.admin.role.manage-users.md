# Roles — Manage users

### Assign users to a role

To assign users to a role:

1. Log in to Admin in your cluster, and select the **Roles** tab.
2. Click on the role you want to assign users to.
3. Select the **Users** tab.
4. Click **Assign user**.
5. Type the username of the user you want to assign to the role, and click **Assign user**. For SaaS deployments, the username field refers to the email address of the user. For Self-Managed deployments, the username field has to match [the value of the claim configured as `username-claim`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-4-configure-the-oidc-connection-details).

**Note**
For Self-Managed deployments with Basic authentication, you must search for existing users.

The user is assigned to the role and inherits its permissions.

### Remove users from a role

To remove users from a role:

1. Log in to Admin in your cluster, and select the **Roles** tab.
2. Click on the role you want to remove users from.
3. Select the **Users** tab.
4. Click **Remove** next to the user you want to remove from the role.
5. Confirm the removal by clicking **Remove** in the confirmation dialog.

The user is removed from the role and loses any permissions that were granted through it.

---
Source: https://docs.camunda.io/docs/next/components/admin/role
