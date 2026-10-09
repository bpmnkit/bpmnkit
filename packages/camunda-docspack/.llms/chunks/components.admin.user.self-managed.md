# Users — Self-Managed

For Self-Managed deployments, user management depends on your authentication setup:

- When using **Basic authentication**, users are managed through Admin. This involves creating, updating, and deleting them directly in your cluster.
- If you have configured an external [OpenID Connect (OIDC) provider](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider), user management is handled by that provider.

The following sections describe how to manage users in a Self-Managed environment with **Basic authentication** enabled.

### Create a user

To create a user:

1. Log in to Admin in your cluster, and click on the **Users** tab.
2. Click on the **Create user** button, and provide the following user details:
   - **Username**: The username for the user.
   - **Name**: The name of the user.
   - **Email**: The email address of the user.
   - **Password**: The password for the user.
3. Click on the **Create user** button.

The user is created, and can now log in to the Camunda 8 web applications.

![identity-create-user-tab](./img/create-user-tab.png)

### Update a user

1. Log in to Admin in your cluster, and click on the **Users** tab.
2. Click on the **pencil icon** next to the user you want to update.
**Note**
   You can also select the user, and click the three vertical dots > **Update**.
3. Update the user details:
   - **Name**: The name of the user.
   - **Email**: The email address of the user.
   - **Password**: The password for the user.
4. Click on the **Save** button.

The user details are updated, and the user can now use these credentials to log in.

![identity-update-user-tab](./img/update-user-tab.png)

### Delete a user

1. Log in to Admin in your cluster, and click on the **Users** tab.
2. Click on the **Delete** button next to the user you want to delete.
**Note**
   You can also select the user, and click the three vertical dots > **Delete**.
3. Confirm the deletion by clicking on the **Delete** button in the confirmation dialog.

The user is deleted, and can no longer log in to the Camunda 8 web applications.

### Assign authorizations to a user

See the [authorization](https://docs.camunda.io/docs/next/components/admin/authorization) section to learn how to create authorizations for users.

---
Source: https://docs.camunda.io/docs/next/components/admin/user
