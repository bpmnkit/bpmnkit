# Groups — Assign authorizations to a group

See the [authorization](https://docs.camunda.io/docs/next/components/admin/authorization) section to learn how to create authorizations for groups.


## Manage users

### Assign users to a group

To assign users to a group:

1. Log in to Admin in your cluster, and click on the **Groups** tab.
2. Click on the group you want to assign users to.
3. Click on the **Users** tab.
4. Click on the **Assign user** button.
5. Type the username of the user you want to assign to the group, and click on the **Assign user** button. For SaaS deployments, the username field refers to the email address of the user. For Self-Managed deployments, the username field has to match [the value of the claim configured as `username-claim`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-4-configure-the-oidc-connection-details).

**Note**
For Self-Managed deployments with Basic authentication, you must search for existing users.

The user is assigned to the group and inherits its permissions.

### Remove users from a group

To remove users from a group:

1. Log in to Admin in your cluster, and click on the **Groups** tab.
2. Click on the group you want to remove users from.
3. Click on the **Users** tab.
4. Click on the **Remove** button next to the user you want to remove from the group.
5. Confirm the removal by clicking on the **Remove** button in the confirmation dialog.

The user is removed from the group and loses any permissions that were granted through the group.

---
Source: https://docs.camunda.io/docs/next/components/admin/group
