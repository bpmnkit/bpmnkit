# Tenants for Optimize — Enable multi-tenancy for Optimize

By default, multi-tenancy is disabled in Management Identity.

To enable multi-tenancy:

1. Enable the [`MULTITENANCY_ENABLED` feature flag](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#feature-flags).
2. [Configure a database](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#database-configuration).


## Create a tenant

**Note**
A `<default>` tenant is automatically created during Identity startup.

1. Log in to Management Identity and select the **Tenants** tab.

   ![tenant-management-tab](./img/tenant-management-tab.png)

2. Click **Create Tenant** and a modal will open.

3. Enter a name and ID for the tenant, and click **Create tenant**:

   ![tenant-management-modal-1](./img/tenant-management-modal-1.png)

   On creation, the modal closes and the table updates with your new tenant.

4. Click on your new tenant to view the details:

   ![tenant-management-details](./img/tenant-management-details.png)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/manage-tenants
