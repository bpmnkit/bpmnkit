# Camunda Hub modeler settings — Project deployment

Organization admins can configure the deployment policy for projects in the Camunda Hub modeler settings.

By default, only [organization administrators](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index) can deploy projects to clusters marked as
[production stages](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project#deployment-stages) from Camunda Hub.

You can change this in the **Project deployment** settings:

1. In Camunda Hub, in the top right corner, click the user icon
2. Select **Settings**.
3. Under **Project deployment settings**, you can permit non-admin users with deployment permissions to deploy project snapshots to production stage clusters after a workspace member has reviewed and approved the project snapshot using the [project review](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning#request-a-review) feature.

This setting can only be configured by organization admins and applies to all projects in the organization.

By default, only users with the **Hub Admin** role can deploy projects to clusters marked as [production stages](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project#deployment-stages) from Camunda Hub.

You can change this in the **Project deployment** settings:

1. In Camunda Hub, in the top right corner, click the user icon
2. Select **Settings**.
3. Under **Project deployment settings**, you can permit non-admin users with deployment permissions to deploy project snapshots to production stage clusters after a workspace member has reviewed and approved the project snapshot using the [project review](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning#request-a-review) feature.

This setting can only be configured by users with the **Hub Admin** role and applies to all projects in the organization.

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
