# Manage environments

View the environments in your organization, monitor their status, open their applications, and learn how new environments are added.

Environments are the deployment targets for your teams, where they run their processes. Use the **Environments** page in Camunda Hub to view every environment in your organization, monitor its status, and open its applications.

Each environment runs on a [cluster](https://docs.camunda.io/docs/next/components/concepts/clusters), which you administer on the [cluster pages](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index). To learn how environments and clusters relate, see [environments](https://docs.camunda.io/docs/next/components/concepts/environments).


## Permissions

Your role determines which environments you can see and what you can do with them across Camunda Hub, for example on the organization's **Environments** page, in workspaces, and projects:

| Role                               | What you can do                                                                                                   |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| Organization owner or admin        | View all environments, assign environments to workspaces, and resume a paused environment.                        |
| DevOps                             | View all environments, open the cluster pages, and resume a paused environment. DevOps can't assign environments. |
| Editor or admin in a workspace     | View the environments assigned to the workspaces where you are an editor or workspace admin.                      |
| Viewer or commenter in a workspace | No access to environments.                                                                                        |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index
