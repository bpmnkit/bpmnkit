# Cluster variables — Manage global cluster variables

Global cluster variables are available to all processes across the entire cluster.

### Create a global cluster variable

1. Log in to Admin in your cluster, and select the **Cluster Variables** tab.
2. Click **Create variable**.
3. Provide the following details:
   - **Name**: A unique identifier for the variable.
   - **Value**: The value of the variable, which can be a string, number, boolean, or JSON object.
4. Click **Create variable**.

The variable is created and immediately available for use in FEEL expressions across all processes in the cluster using `camunda.vars.cluster.<name>` or `camunda.vars.env.<name>`.

### Update a global cluster variable

1. Log in to Admin in your cluster, and select the **Cluster Variables** tab.
2. Click the **pencil icon** next to the variable you want to update.
3. Update the variable value.
4. Click **Save**.

The updated value takes effect for new evaluations of FEEL expressions that reference this variable.

### Delete a global cluster variable

1. Log in to Admin in your cluster, and select the **Cluster Variables** tab.
2. Click **Delete** next to the variable you want to delete.
3. Confirm the deletion by clicking **Delete** in the confirmation dialog.

The variable is deleted and is no longer available in FEEL expressions.

**Note**
Deleting a cluster variable does not affect process instances that have already resolved the variable value.

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-variables
