# Deploy your project — Deploy your project

Once you've [validated your process](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/validate-project), deploy your project to cluster stages in your [development lifecycle](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/manage-projects#project-development-lifecycle), such as testing, staging, or production. For example, deploy to your testing cluster to run automated tests or make it available for testing.

1. In your workspace, open a project.
1. At the top right of the project view, click the **Deploy & run** combo button, and select **Deploy latest changes**. This opens the deployment modal.
1. Select the cluster stage to deploy to. The next stage is not automatically selected. You must select the stage you want to promote to.
1. If the cluster is paused, you must resume it.
1. Click **Deploy** to deploy the project to the selected cluster.

When you deploy from the project homepage, all BPMN, DMN, and form files in the project are deployed as a single bundle.

**Note**
If any resource fails to deploy, the whole deployment [fails](#deployment-errors) and the cluster state remains unchanged. This safely ensures that a project cannot be deployed incompletely or in an inconsistent state.

In Self-Managed, you can deploy your project to the cluster defined in your Camunda Hub [configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters).

**Tip**
If you don't want to deploy all resources in a project, you can [deploy an individual resource](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process#deploy-a-process).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
