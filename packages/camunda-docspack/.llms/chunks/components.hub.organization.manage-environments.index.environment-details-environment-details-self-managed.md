# Manage environments — Environment details {#environment-details-self-managed}

Camunda Hub provides details for each environment. Select an environment on the **Environments** page to open them.

| Detail             | Description                                                                                                                                          |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name               | The [name of the environment](https://docs.camunda.io/docs/next/components/concepts/environments#how-an-environment-maps-to-infrastructure).                                       |
| Status             | The [status](#environment-statuses-self-managed) of the environment.                                                                                 |
| Tags               | The tags of the backing cluster, for example `dev` or `prod`.                                                                                        |
| Version            | The Camunda version that the environment is running.                                                                                                 |
| Cluster ID         | The ID of the backing cluster.                                                                                                                       |
| Physical tenant ID | The ID of the Physical Tenant, if the environment is backed by one.                                                                                  |
| Workspaces         | The workspaces the environment is assigned to. Organization owners and admins see **Unassigned** if the environment isn't assigned to any workspace. |

### Environment statuses {#environment-statuses-self-managed}

The status of an environment reflects the state of its cluster. Camunda Hub monitors the health of the components of each environment to determine its status. For details on how the status is determined, see the [Camunda Hub configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments#environment-status).

| Status       | Description                                                                                                                                                                      |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Healthy      | The environment is running.                                                                                                                                                      |
| Unhealthy    | The environment reports a problem.                                                                                                                                               |
| Unknown      | Camunda Hub can't determine the status, for example because a component doesn't respond.                                                                                         |
| Not reported | The environment is assigned to a workspace, but its cluster or Physical Tenant is no longer in the Camunda Hub configuration. It shows no live data, and you can't deploy to it. |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index
