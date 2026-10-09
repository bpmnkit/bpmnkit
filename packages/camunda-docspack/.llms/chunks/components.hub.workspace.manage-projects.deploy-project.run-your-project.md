# Deploy your project — Run your project

You can manually [run](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process#run-a-process) your project to test it after it has been deployed to an environment.

**Note**
Use [Test mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) to validate and debug your project against any environment assigned to your workspace. Use Run to execute a full process instance of your already-deployed project, for example to exercise your real job workers and APIs on a testing, staging, or production environment.

To run your project:

1. In your workspace, open a project.
1. At the top right of the project view, click **Deploy & run** to open the **Deploy & run** modal.
1. Select the process for which you want to start a new instance in **Process to run**.
1. Select **Deploy & run** to start a new instance.
   - Before the process instance starts, all resources are redeployed if required so the new instance uses their latest state.
   - After the process instance starts, you will receive an **Instance started!** notification. Click **View process instance** to open the process instance in the [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) of the environment, and monitor it.

You can also open the **Deploy & run** modal from the details page of any BPMN file in the project. In that case, the current process is run and the modal includes an additional option to select the resources to deploy.

If the target environment has [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) enabled, make sure you have the following permissions to be able to view the process instance in Operate:

| Resource type        | Permission                                            |
| :------------------- | :---------------------------------------------------- |
| `PROCESS_DEFINITION` | `READ_PROCESS_DEFINITION` and `READ_PROCESS_INSTANCE` |
| `COMPONENT`          | `operate`                                             |

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
