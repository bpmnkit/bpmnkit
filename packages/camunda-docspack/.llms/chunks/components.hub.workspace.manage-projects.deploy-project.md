# Deploy your project

Deploy your project to an environment assigned to your workspace.

Deploy your project to an environment assigned to your workspace, for example a testing, staging, or production environment.


## Deployment environments

You deploy a project to an [environment](https://docs.camunda.io/docs/next/components/concepts/environments), not to a cluster. The deploy dialog lists the environments that are assigned to the workspace of the project. Each entry shows the following details:

| Detail  | Description                                                                                                           |
| :------ | :-------------------------------------------------------------------------------------------------------------------- |
| Name    | The [name of the environment](https://docs.camunda.io/docs/next/components/concepts/environments#how-an-environment-maps-to-infrastructure).        |
| Cluster | The cluster that hosts the environment. Camunda Hub shows the cluster only if it's needed to tell environments apart. |
| Version | The Camunda version of the cluster, for example **Camunda 8.9**.                                                      |
| Tags    | The tags of the cluster, for example `dev`, `test`, `stage`, or `prod`.                                               |
| Status  | The [status](#environment-status) of the environment.                                                                 |

An organization admin decides which environments a workspace can use. Camunda Hub doesn't offer any other targets, and it doesn't select the next environment for you when you promote a project. You choose the environment you want to deploy to.

### Prerequisites

Before you deploy a project:

- An organization admin has [assigned at least one environment to the workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments).
- You're a **Workspace Admin** or **Editor** in the workspace.
- You have permission to deploy in the target environment. If the cluster or its Physical Tenant has [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) enabled, ensure you have the [`CREATE` permission to the `RESOURCE` resource type](https://docs.camunda.io/docs/next/components/admin/authorization#create-an-authorization-in-admin).

Camunda Hub doesn't check your permissions before you deploy. The cluster decides whether you can deploy, and Camunda Hub shows you the result.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
