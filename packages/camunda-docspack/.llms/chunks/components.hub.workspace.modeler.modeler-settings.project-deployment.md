# Camunda Hub modeler settings — Project deployment

Organization admins can require an approved project snapshot before anyone deploys a project to a production environment.

Camunda Hub treats an [environment](https://docs.camunda.io/docs/next/components/concepts/environments) as a production environment if its tags include `prod`. The tags of an environment come from its cluster. In SaaS, [tag the cluster](https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster#tag-your-cluster) as `prod`. In Self-Managed, add `prod` to the `tags` of the cluster in the [cluster configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters).

To change the policy:

1. In Camunda Hub, in the top right corner, click the user icon.
2. Select **Settings**.
3. Click **Projects deployment**.
4. Turn the **Require approval of project snapshots to deploy to production environments** toggle on or off.

| Setting           | Effect                                                                                                                                                                                          |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Off (the default) | Any collaborator with deployment privileges can deploy to an environment tagged `prod`, approved or not.                                                                                        |
| On                | Any collaborator with deployment privileges can deploy an **approved** project snapshot to an environment tagged `prod`. An unapproved snapshot is blocked, and drafts can't be deployed there. |

When the toggle is off, access to production environments is controlled by which environments are [assigned to the workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments) and by the deployment permissions in the cluster.

When the toggle is on and you try to deploy to a production environment, the deploy dialog explains what's missing. See [production environments](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project#production-environments). To get a snapshot approved, use the [project review](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning#request-a-review) feature.

Only organization admins can change this setting. It applies to all projects in the organization.

### Self-Managed

In Self-Managed, only users with the **Hub Admin** role can change this setting.

If the **Hub Admin** role doesn't exist, you can create it with the following permissions:

- Hub Internal API - `write:*`
- Hub Internal API - `admin:*`
- Camunda Identity Resource Server - `read:users`

Refer to the documentation pages about [assigning roles](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles) and [adding permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview) for detailed instructions.

**Info**
The deployment policy applies only to deployments of **projects** made from Camunda Hub.
Deployments made from Desktop Modeler and deployments of single BPMN files, for example, are not affected by this setting.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeler-settings
