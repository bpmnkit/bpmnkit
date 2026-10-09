# Deploy your project — Deploy your project

Once you've [validated your process](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/validate-project), deploy your project to an environment in your [development lifecycle](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/manage-projects#project-development-lifecycle), such as testing, staging, or production. For example, deploy to your testing environment to run automated tests or make it available for testing.

1. In your workspace, open a project.
1. At the top right of the project view, click the **Deploy & run** combo button, and select **Deploy latest changes**. This opens the **Deploy project** dialog.
1. Under **Deployment environment**, select the environment to deploy to. Camunda Hub preselects the first one.
1. If the environment has [Logical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/logical-tenants), select one under **Logical tenant**. In Self-Managed, you can enter a **Logical tenant ID**, which is optional.
1. In Self-Managed, if the cluster uses Basic authentication, enter your **Username** and **Password** under **Authentication**.
1. Click **Deploy** to deploy the project to the selected environment.

When you deploy from the project homepage, all BPMN, DMN, and form files in the project are deployed as a single bundle. Camunda Hub confirms a successful deployment with **Project deployed!**

**Note**
If any resource fails to deploy, the whole deployment [fails](#deployment-errors) and the environment state remains unchanged. This safely ensures that a project cannot be deployed incompletely or in an inconsistent state.

**Tip**
If you don't want to deploy all resources in a project, you can [deploy an individual resource](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process#deploy-a-process).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
