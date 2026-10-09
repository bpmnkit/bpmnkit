# Cluster variables — Manage tenant cluster variables

When [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) is enabled, you can define tenant-specific cluster variables that override global variables with the same name for processes running in that tenant.

### Create a tenant cluster variable

1. Log in to Admin in your cluster, and select the **Cluster Variables** tab.
2. Select the tenant for which you want to create a variable.
3. Click **Create variable**.
4. Provide the following details:
   - **Name**: A unique identifier for the variable.
   - **Value**: The value of the variable.
5. Click **Create variable**.

The variable is created and available in FEEL expressions for processes running in the selected tenant using `camunda.vars.tenant.<name>` or `camunda.vars.env.<name>`.

**Note**
If a global variable with the same name exists, the tenant-level variable takes precedence for processes running in this tenant. See [scope resolution](https://docs.camunda.io/docs/next/components/modeler/feel/cluster-variable/scope-and-priority) for details.

### Update a tenant cluster variable

1. Log in to Admin in your cluster, and select the **Cluster Variables** tab.
2. Select the tenant for which you want to update the variable.
3. Click the **pencil icon** next to the variable you want to update.
4. Update the variable value.
5. Click **Save**.

### Delete a tenant cluster variable

1. Log in to Admin in your cluster, and select the **Cluster Variables** tab.
2. Select the tenant for which you want to delete the variable.
3. Click **Delete** next to the variable you want to delete.
4. Confirm the deletion by clicking **Delete** in the confirmation dialog.

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-variables
