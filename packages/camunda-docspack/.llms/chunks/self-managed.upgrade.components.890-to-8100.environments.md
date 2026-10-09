# Upgrade Camunda components from 8.9 to 8.10 — Environments

In 8.10, teams deploy to [environments](https://docs.camunda.io/docs/next/components/concepts/environments) instead of the clusters connected to a project.

What happens when you upgrade:

- Camunda Hub creates environments from the clusters in your `camunda.hub.clusters` configuration. On a cluster at version 8.10 or later, each Physical Tenant is an environment. See [environments and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments#physical-tenants).
- During the data migration, Camunda Hub assigns to each workspace an environment for every cluster that its projects used at any deployment stage, and for every cluster that its IDP projects used. If several projects share a workspace, the workspace gets all their clusters, and each one is assigned once. Existing projects can continue to deploy to the clusters they used before. For a cluster at version 8.10 or later, the environment is backed by the `default` Physical Tenant and keeps its workspace assignments.
- Projects no longer have their own deployment stages or connected clusters. A project can deploy to every environment assigned to its workspace.
- Workspaces you create after the upgrade start without environments. An organization admin must [assign environments to the workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments).
- A cluster or Physical Tenant that is no longer in the configuration, for example because its ID changed, stays in Camunda Hub with the status **Not reported** while a workspace uses it. This also applies to clusters that you manage with dynamic cluster management, because they aren't part of the static configuration. Their assignments stay in place, and only the status shows **Not reported**. Reassign the workspace to another environment, or remove the assignment, when you no longer need it.

Before you upgrade, review the following:

| Task                                    | Why                                                                                                                                                                                                                                                                                            |
| :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (Optional) Tag a cluster with `prod`    | Do this only if you want Camunda Hub to treat the environments of a cluster as production environments. Camunda Hub identifies them by the `prod` tag in `camunda.hub.clusters[].tags`, and the project deployment policy applies to them. Without the tag, no production restriction applies. |
| Add a `readiness` address to components | Camunda Hub determines the status of an environment from the `urls.readiness` address of its components. Without it, the status is **Unknown**.                                                                                                                                                |

**Note: Helm behavior**
In a Helm combined installation, the chart already tags the default cluster with `prod`, so the production deployment policy applies to its environment from the start. In Helm hub mode, the clusters in `global.topology.clusters` have no tags, so Camunda Hub doesn't treat their environments as production environments.

Camunda Hub reads the cluster configuration at startup. After you change it, perform a rolling restart.

#### Deployments to production environments

In earlier versions, only administrators could deploy to the production stage of a project by default. In 8.10, this default no longer applies to environments. Any collaborator with deployment privileges can deploy to an environment tagged `prod`. Access to production is controlled by which environments are assigned to the workspace and by the deployment permissions in the cluster.

To require an approved project snapshot for production deployments, turn on **Require approval of project snapshots to deploy to production environments** in the [project deployment settings](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeler-settings#project-deployment).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
