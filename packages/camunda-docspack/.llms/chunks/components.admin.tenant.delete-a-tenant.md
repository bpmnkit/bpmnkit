# Tenants — Delete a tenant

To delete a tenant, click on the **Delete** option in the list of tenants, and confirm the deletion.

**Note**
The `<default>` tenant is a system entity and cannot be deleted.


## Tenant assignments

You can assign the following entities to a tenant:

- [Users](https://docs.camunda.io/docs/next/components/admin/user)
- [Groups](https://docs.camunda.io/docs/next/components/admin/group)
- [Roles](https://docs.camunda.io/docs/next/components/admin/role)
- [Mapping rules](https://docs.camunda.io/docs/next/components/admin/mapping-rules)
- [Clients](https://docs.camunda.io/docs/next/components/admin/client)

You can manage these assignments by selecting the relevant tab on the tenant details page.

### Assign users to a tenant

1. Select the **Users** tab.
2. Click **Assign user**. In the modal, enter the username and confirm. The username field has to match [the value of the claim configured as `username-claim`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-4-configure-the-oidc-connection-details).

   ![tenant-management-assign-users-modal](./img/tenant-management-assign-users-modal.png)

3. The user appears in the list after assignment. Refresh the page if needed.

   ![tenant-management-assigned-users](./img/tenant-management-assigned-users.png)

### Assign groups to a tenant

1. Select the **Groups** tab.
2. Click **Assign group**. Search for a group ID and confirm.

   ![tenant-management-assign-groups-modal](./img/tenant-management-assign-groups-modal.png)

3. The group appears in the list after assignment. Refresh the page if needed.

   ![tenant-management-assigned-groups](./img/tenant-management-assigned-groups.png)

### Assign roles to a tenant

1. Select the **Roles** tab.
2. Click **Assign role**. Search for a role ID and confirm.

   ![tenant-management-assign-roles-modal](./img/tenant-management-assign-roles-modal.png)

3. The role appears in the list after assignment. Refresh the page if needed.

   ![tenant-management-assigned-roles](./img/tenant-management-assigned-roles.png)

### Assign mapping rules to a tenant

**Note**
Assignment of [mapping rules](https://docs.camunda.io/docs/next/components/concepts/access-control/mapping-rules) is only available for [OIDC authentication in Self-Managed](https://docs.camunda.io/docs/next/components/concepts/access-control/connect-to-identity-provider#self-managed). On SaaS, identity is managed by Camunda, so mapping rules cannot map claims from a customer identity provider.

1. Select the **Mapping rules** tab.
2. Click **Assign mapping rule**. Search for a mapping rule ID and confirm.

   ![tenant-management-assign-mapping-rules-modal](./img/tenant-management-assign-mapping-rules-modal.png)

3. The mapping rule appears in the list after assignment. Refresh the page if needed.

   ![tenant-management-assigned-mapping-rules](./img/tenant-management-assigned-mapping-rules.png)

### Assign clients to a tenant

1. Select the **Clients** tab.
2. Click **Assign client**. Enter the client ID and confirm.

   ![tenant-management-assign-client-modal](./img/tenant-management-assign-client-modal.png)

3. The client appears in the list after assignment. Refresh the page if needed.

   ![tenant-management-assigned-clients](./img/tenant-management-assigned-clients.png)

---
Source: https://docs.camunda.io/docs/next/components/admin/tenant
