# Workspaces — Workspaces and projects

A workspace is the container of projects. Every project belongs to one workspace, and the members of the workspace decide who can work on it.

- A project doesn't have its own deployment targets. It deploys to the environments assigned to its workspace, and every project in the workspace sees the same environments.
- When you delete a workspace, its projects are deleted with it. You can restore both from [recently deleted](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/recently-deleted) during the retention period.

Learn more about [projects](https://docs.camunda.io/docs/next/components/concepts/projects).


## Workspaces and environments

A workspace is assigned environments, never clusters. An organization admin decides which environments a workspace can use, so a team can deploy only to the places that were approved for it.

An environment can be assigned to more than one workspace, and a workspace can have any number of environments, including none. Workspace admins and editors see the environments of their workspace. Viewers and commenters don't.

Learn more about [environments](https://docs.camunda.io/docs/next/components/concepts/environments) and [clusters](https://docs.camunda.io/docs/next/components/concepts/clusters).

---
Source: https://docs.camunda.io/docs/next/components/concepts/workspaces
