# Deploy your project — Deploy your project — Environment status

The status of an environment decides whether you can deploy to it:

| Status      | What it means for deployment                                                                  |
| :---------- | :-------------------------------------------------------------------------------------------- |
| Healthy     | You can deploy.                                                                               |
| Unhealthy   | You can deploy, but the deployment may fail because the environment is unhealthy.             |
| Updating    | You can deploy, but the deployment may fail because the environment is updating.              |
| Paused      | You can't deploy until the environment is resumed. Resume the environment first.              |
| Resuming    | You can't deploy. Wait until the environment is healthy.                                      |
| Creating    | You can't deploy. Wait until the environment is ready.                                        |
| Unavailable | You can't deploy, for example because the environment is temporarily unavailable.             |
| Unknown     | You can deploy, but the deployment may fail because the status of the environment is unknown. |

For how the status follows the state of the cluster, see [environment statuses](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index#how-environment-statuses-follow-the-cluster). To resume a paused environment, click **Resume** next to it. Only organization owners, admins, and DevOps users see this button. You can also [resume the environment from the environments page](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index#resume-a-paused-environment).

| Status       | What it means for deployment                                                                                       |
| :----------- | :----------------------------------------------------------------------------------------------------------------- |
| Healthy      | You can deploy.                                                                                                    |
| Unhealthy    | You can deploy, but the deployment may fail because the environment is unhealthy.                                  |
| Unknown      | You can deploy, but the deployment may fail because the status of the environment is unknown.                      |
| Not reported | You can't deploy. The cluster or Physical Tenant of the environment is no longer in the Camunda Hub configuration. |

A Self-Managed environment reports only its health, so it is never paused, resuming, creating, updating, or unavailable. For more information, see [environment statuses](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index#environment-statuses-self-managed).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
