# Tenants — Create a tenant

**Note**
The `<default>` tenant is automatically created when Admin starts.

1. Log in to Admin and open the **Tenants** tab.

   ![tenant-management-tab](./img/tenant-management-tab.png)

2. Click **Create tenant**. In the modal, provide the tenant **ID**, **name**, and optional **description**. Then click **Create tenant**.

   ![tenant-management-create-tenant-modal](./img/tenant-management-create-tenant-modal.png)

3. The tenant appears in the list. If not, refresh the page.

   ![tenant-management-new-tenant-in-table](./img/tenant-management-new-tenant-in-table.png)

4. Click the tenant to open details and manage assignments.

   ![tenant-management-tenant-details-users-tab](./img/tenant-management-tenant-details-users-tab.png)


## Update a tenant

You can update the name and description of a tenant, but cannot change its ID after creation. To change a tenant's ID, you must delete the tenant and create a new one.

To update a tenant:

1. Log in to Admin in your cluster, and select the **Tenants** tab.
2. Click the **pencil icon** next to the tenant you want to update.
3. Update the tenant details:
   - **Name**: The name of the tenant.
   - **Description**: An optional description of the tenant.
4. Click the **Save** button.

The tenant details are updated.

**Note**
The `<default>` tenant is a system entity and cannot be updated.

---
Source: https://docs.camunda.io/docs/next/components/admin/tenant
