# Assign environments to a workspace — Assignment rules

- A workspace can have any number of environments, including none.
- A workspace can have more than one environment for the same lifecycle phase. For example, you can assign multiple development environments to a workspace.
- All projects in a workspace inherit the environments assigned to the workspace.
- An environment can be assigned to more than one workspace. Assigning one environment to one workspace is the recommended model, but Camunda Hub doesn't enforce it.
- Workspace members see only the environments assigned to their workspace. Viewers and commenters see none. See [environments](https://docs.camunda.io/docs/next/components/concepts/environments#who-can-see-and-use-environments).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments
