# Assign environments to a workspace — Assign environments when you create a workspace

1. In Camunda Hub, click **Workspaces** in the left navigation, and then click **Create workspace**.
2. Complete the **General** and **Members** steps. See [create a workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace#create-a-workspace).
3. Under **Environments**, select the environments for the workspace. You can change this later.
4. Click **Create workspace**.

If Camunda Hub creates the workspace but can't assign the environments, it shows a message. Assign the environments from the workspace settings.


## Change the assigned environments

1. In Camunda Hub, click **Workspaces** in the left navigation, find the workspace, and click **Manage**. Alternatively, open the workspace and click **Settings** in the left navigation.
2. Open the **Environments** tab.
3. Click **Edit environments**. If the workspace has no environments, click **Add environments**.
4. Select the environments to assign, and remove the ones you no longer need. Then click **Save**.

Saving replaces the assigned environments with your selection.

### Find an environment

The selection view lists the available environments. For each environment, it shows the version, status, region, and the other workspaces that use it, or **Not assigned**.

- Use **Search environments** to search by name.
- Filter by version or tag.
- Turn on **Show only unassigned** to hide the environments that other workspaces use.

### Remove the last environment

If you remove every environment from a workspace, Camunda Hub asks you to confirm with **Remove environments**. The workspace then has no environment to deploy to. You can assign environments again at any time.

### What happens when you unassign an environment

When you unassign an environment, projects in the workspace can no longer select it, and they can't deploy to it. Nothing else changes in the environment or in other workspaces that use it.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments
