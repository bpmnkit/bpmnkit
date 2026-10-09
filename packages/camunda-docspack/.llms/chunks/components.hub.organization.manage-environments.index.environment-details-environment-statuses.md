# Manage environments — Environment details — Environment statuses

The status of an environment reflects the state of its cluster. The status updates automatically while the cluster changes state, and settles on the health of the cluster when the change completes.

| Status      | Description                                                                            |
| :---------- | :------------------------------------------------------------------------------------- |
| Healthy     | The environment is running.                                                            |
| Unhealthy   | The environment reports a problem.                                                     |
| Unknown     | Camunda Hub can't determine the status.                                                |
| Creating    | The cluster is being created.                                                          |
| Updating    | The cluster is being updated.                                                          |
| Unavailable | The cluster is under maintenance or waiting for input.                                 |
| Paused      | The cluster is paused. You can [resume](#resume-a-paused-environment) the environment. |
| Resuming    | The cluster is starting after being resumed.                                           |

#### How environment statuses follow the cluster

The status of an environment comes from the state of the cluster behind it. This table shows the status that each cluster state produces, and whether you can deploy:

| Cluster state                                      | Environment status | Deploying                                              |
| :------------------------------------------------- | :----------------- | :----------------------------------------------------- |
| Healthy                                            | Healthy            | Allowed.                                               |
| Unhealthy                                          | Unhealthy          | Allowed, with a **Deployment may fail** warning.       |
| Missing (its backing resources are gone)           | Unhealthy          | Allowed, with a **Deployment may fail** warning.       |
| Paused                                             | Paused             | Blocked until you resume the environment.              |
| Resuming                                           | Resuming           | Blocked until the environment is healthy.              |
| Creating                                           | Creating           | Blocked, with **Environment is being created**.        |
| Updating                                           | Updating           | Allowed, with a **Deployment may fail** warning.       |
| Maintenance                                        | Unavailable        | Blocked, until the maintenance is finished.            |
| Waiting for input                                  | Unavailable        | Blocked, until the cluster has the input it waits for. |
| No state, or a state Camunda Hub doesn't recognize | Unknown            | Not blocked.                                           |

A cluster in the **Maintenance** or **Waiting for input** state still exists, but its environment shows **Unavailable**. To see the state of the cluster, open it in [Manage clusters](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index).

The status of an environment reads the same wherever it appears: on the **Environments** page, in the environment details, in the environments of a workspace, on the cluster page, in the deploy dialog, and in the runtime connection of the modeler. For how deploying follows the status, see [deploy a project](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project#environment-status).

If Console stops reporting a cluster, its environment stays listed from the last known snapshot, with the status **Unknown** and the mark **Not reported**. You can't deploy to it.

The Camunda Hub API reports only the health of an environment: `HEALTHY`, `UNHEALTHY`, `PAUSED`, `RESUMING`, and `UNKNOWN`. An environment that is being created, is being updated, is under maintenance, or is waiting for input reads `UNKNOWN` there. The **Creating**, **Updating**, and **Unavailable** statuses appear only in the Camunda Hub interface.

#### Resume a paused environment

Organization owners, admins, and DevOps users can resume a paused environment wherever Camunda Hub shows its status, for example on the **Environments** page, in the environment details, or when you select an environment to deploy to. The status changes to **Resuming** while the cluster starts, and then to **Healthy**.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/index
