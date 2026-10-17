# Manage environments — Environment details

Camunda Hub provides details for each environment. Select an environment on the **Environments** page to open them.

| Detail     | Description                                                                                                                                          |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name       | The [name of the environment](https://docs.camunda.io/docs/next/components/concepts/environments#how-an-environment-maps-to-infrastructure).                                       |
| Status     | The [status](#environment-statuses) of the environment.                                                                                              |
| Tag        | The tag of the backing cluster, which represents the lifecycle phase of the environment: `dev`, `test`, `stage`, or `prod`.                          |
| Version    | The Camunda version that the environment is running.                                                                                                 |
| Region     | The region of the backing cluster.                                                                                                                   |
| Cluster ID | The ID of the backing cluster.                                                                                                                       |
| REST API   | The REST API address of the environment.                                                                                                             |
| Swagger UI | The Swagger UI address of the environment, if Swagger UI is enabled for the backing cluster.                                                         |
| Workspaces | The workspaces the environment is assigned to. Organization owners and admins see **Unassigned** if the environment isn't assigned to any workspace. |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index
