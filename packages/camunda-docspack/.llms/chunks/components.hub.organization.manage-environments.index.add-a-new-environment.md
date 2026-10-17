# Manage environments — Add a new environment

In SaaS, you add an environment by creating a cluster. Every SaaS cluster has one environment, which Camunda Hub creates automatically when the cluster is created.

1. [Create a cluster](https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster). The environment of the cluster appears on the **Environments** page.
1. [Assign the environment to a workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments) so that teams can deploy to it.


## Permissions {#permissions-self-managed}

Your role determines which environments you can see and what you can do with them across Camunda Hub, for example on the organization's **Environments** page, in workspaces, and projects:

| Role                               | What you can do                                                                              |
| :--------------------------------- | :------------------------------------------------------------------------------------------- |
| Organization admin                 | View all environments, and assign environments to workspaces.                                |
| DevOps                             | View all environments, and open the cluster pages. DevOps can't assign environments.         |
| Editor or admin in a workspace     | View the environments assigned to the workspaces where you are an editor or workspace admin. |
| Viewer or commenter in a workspace | No access to environments.                                                                   |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index
