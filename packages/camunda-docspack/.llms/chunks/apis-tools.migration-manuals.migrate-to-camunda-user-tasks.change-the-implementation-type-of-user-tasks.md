# Migrate to Camunda user tasks — Change the implementation type of user tasks

We recommend you migrate process-by-process, allowing you to thoroughly test the processes in your test environments or via your [CI/CD](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd). To do this, take the following steps:

1. Open a diagram you want to migrate.
2. Click on a user task.
3. Check if the task has an embedded form.
   - If a form is embedded, [transform it into a linked form](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#camunda-form-linked) before you change the task type implementation. Press `Ctrl+Z` or `⌘+Z` to undo if you accidentally removed your embedded form.
4. Open the **Implementation** section in the properties panel.
5. Click the **Type** dropdown and select **Camunda user task**. The linked form or external form reference will be preserved.

Repeat these steps for all user tasks in the process. Then, deploy the process to your development cluster and test it by running the process and ensuring your custom task applications work.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks
