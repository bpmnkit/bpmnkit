# Workspaces — Workspaces in Camunda Hub

In Camunda Hub, an organization contains workspaces, and workspaces contain projects:

```
Camunda Hub
└─ Organization
    └─ Workspace
        ├─ Members
        ├─ Environments
        └─ Projects
            └─ Files and folders
```

A workspace has the following parts:

| Part         | Description                                                                                                                                                                                                         |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Members      | The users who can see the workspace. Each member has a [workspace role](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members#workspace-roles): Workspace Admin, Editor, Commenter, or Viewer. |
| Projects     | The [projects](https://docs.camunda.io/docs/next/components/concepts/projects) of the workspace. Every project belongs to exactly one workspace.                                                                                                                     |
| Environments | The [environments](https://docs.camunda.io/docs/next/components/concepts/environments) that the projects of the workspace can deploy to. An organization admin assigns them.                                                                                         |

Members can view only the workspaces they're invited to. Organization owners and admins can access every workspace.

---
Source: https://docs.camunda.io/docs/next/components/concepts/workspaces
