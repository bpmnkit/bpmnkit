# Environments — Environment tags

An environment carries the tags of the cluster that backs it, for example `dev`, `test`, `stage`, or `prod`. Use tags to filter environments and to see which stage of your development lifecycle an environment serves.

The `prod` tag also marks an environment as a production environment. Your organization can require an approved project snapshot before anyone deploys to it. See [project deployment settings](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeler-settings#project-deployment).


## Who can see and use environments

Organization admins assign environments to workspaces. An environment can be assigned to more than one workspace, and a workspace can have any number of environments, including none.

Every [project](https://docs.camunda.io/docs/next/components/concepts/projects) in a [workspace](https://docs.camunda.io/docs/next/components/concepts/workspaces) can use all the environments assigned to the workspace. A project can't reach an environment that its workspace doesn't have.

| Role                          | What the role sees                            |
| :---------------------------- | :-------------------------------------------- |
| Organization owner or admin   | Every environment in the organization         |
| Workspace admin or editor     | The environments assigned to their workspaces |
| Workspace viewer or commenter | No environments                               |

Seeing an environment doesn't grant access to what runs in it. The Orchestration Cluster decides who can deploy to an environment and use its applications. See [access control](https://docs.camunda.io/docs/next/components/concepts/access-control/access-control-overview).

---
Source: https://docs.camunda.io/docs/next/components/concepts/environments
