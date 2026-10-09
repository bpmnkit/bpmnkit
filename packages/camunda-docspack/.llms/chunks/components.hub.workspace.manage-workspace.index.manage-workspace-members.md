# Manage workspace settings — Manage workspace members

Add members, edit member roles, or delete members:

1. In your workspace, in the left-side navigation, click **Settings**.
2. Under **Members**, follow the organization-level [manage the workspace's members](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members) guide.


## View assigned environments

An [environment](https://docs.camunda.io/docs/next/components/concepts/environments) is a deployment target where the projects of your workspace run. Your organization admin assigns environments to the workspace, and every project in the workspace can use all of them.

If you're a **Workspace Admin** or **Editor**, the left navigation shows a **Workspace environments** section. It lists each assigned environment with a **Details** entry and links to its applications. Organization owners and admins see the same list. Viewers and commenters don't see environments.

For each environment, the **Environments** page shows:

| Detail       | Description                                                                  |
| :----------- | :--------------------------------------------------------------------------- |
| Name         | The name of the environment. Select it to open the details.                  |
| Cluster      | The cluster that hosts the environment.                                      |
| Tags         | The tags of the cluster, for example `dev` or `prod`.                        |
| Version      | The Camunda version of the cluster.                                          |
| Status       | Whether the environment is healthy, unhealthy, paused, resuming, or unknown. |
| Applications | Links to the applications of the environment, such as Operate and Tasklist.  |

An unhealthy or paused environment stays in the list with its status. If no environment is assigned, the page tells you to contact an organization admin.

Select an environment to see its applications, details, and a summary of its jobs from the last 24 hours. Camunda Hub doesn't check your permissions in the applications. Each application enforces its own access.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-workspace/index
