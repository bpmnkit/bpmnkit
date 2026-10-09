# Deploy your project

Deploy your project to a testing, staging, or production environment.

Deploy your project to a testing, staging, or production environment.


## Deployment stages

The deployment pipeline has the following stages:

| Stage       | Description                                                                                                     |
| :---------- | :-------------------------------------------------------------------------------------------------------------- |
| Development | Use to create and test new software features and changes.                                                       |
| Testing     | Use for quality checks, ensuring software meets defined standards before release.                               |
| Staging     | Use for controlled testing where changes are validated before deployment to production.                         |
| Production  | The live system with the latest software. Only administrators and organization owners can deploy to this stage. |

To define your deployment pipeline stages, follow the [connect clusters](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/create-a-project#connect-clusters) instructions.

**Note**

- For each stage, an administrator must define the cluster to deploy to. Deployments can only be made to the pre-defined set of approved clusters. An **Undefined stages** warning is shown if no cluster is selected for at least one stage.
- Each deployment action is logged with information on the user and stage it was deployed to.

### Prerequisites

Make sure you've [set up a project](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/create-a-project), including at least one cluster.

Only users with correct privileges can deploy:

- If the target cluster has [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) enabled, ensure deploying users have [`CREATE` permission to the `RESOURCE` resource type](https://docs.camunda.io/docs/next/components/admin/authorization#create-an-authorization-in-admin).
- Configure your [deployment settings](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeler-settings#project-deployment)

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
