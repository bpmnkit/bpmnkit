# Environments

Learn how environments give teams a named deployment target to run processes in Camunda Hub, and how they relate to clusters and tenants.

An environment is a named deployment target where a team runs its processes in Camunda Hub. For example, a `payments-prod` environment gives the payments team its own isolated deployment target to run production processes.

Clusters are the infrastructure underneath. Organization admins manage [clusters](https://docs.camunda.io/docs/next/components/concepts/clusters), and teams work with the environments assigned to their [workspace](https://docs.camunda.io/docs/next/components/concepts/workspaces).


## Environments and clusters

Camunda Hub separates the infrastructure you operate from the place your teams work:

|               | Cluster                                                      | Environment                                                                               |
| :------------ | :----------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| Purpose       | Administrative unit. The infrastructure that runs Camunda 8. | Operational unit. The deployment target where a team tests, runs, and operates processes. |
| Managed by    | Organization admins and DevOps                               | Assigned to workspaces by organization admins                                             |
| Typical tasks | Create, size, update, back up, and secure the cluster.       | Deploy a project, test a process, and open Operate, Tasklist, or Admin.                   |

Teams deploy to an environment, not to a cluster. A cluster can host more than one environment, and every environment belongs to exactly one cluster. Learn more about [clusters](https://docs.camunda.io/docs/next/components/concepts/clusters).

---
Source: https://docs.camunda.io/docs/next/components/concepts/environments
