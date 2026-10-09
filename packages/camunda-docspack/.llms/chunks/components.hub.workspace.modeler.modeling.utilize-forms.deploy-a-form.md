# Utilize forms — Deploy a form

To deploy your latest form changes:

1. Open the form.
2. At the top right of the form editor, click **Deploy**.
3. Select a stage and, optionally, a tenant ID.
4. Choose whether to deploy **All resources** or **Only this resource** (the form).
5. Click **Deploy**.


## Deploy your diagram and start an instance

To execute your process diagram, click **Deploy & run**.

To avoid incidents:

- When deploying a project, if the links between resources are configured with the 'deployment' binding, the BPMN diagrams and their forms must be deployed together.
- When deploying a BPMN file separately, and linking resources using the 'latest' binding, ensure the forms are deployed beforehand.

You can now monitor your instances in [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction).

**Info**
You have full control over when a form is deployed.

When [deploying a project](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project):

- If the form is saved in the project you're deploying, the form will be included in the deployment.
- If the form is saved in another project, you need to [deploy it separately](#deploy-a-form).

When [deploying a diagram](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process), not the form:

- If the form is saved in the same project as the diagram and you choose to deploy **All resources**, the form will be included in the deployment.
- If the form is saved in the same project as the diagram and you choose to deploy **Only this resource**, you need to [deploy the form separately](#deploy-a-form).
- If the form is saved in another project, you need to [deploy it separately](#deploy-a-form).

As linked forms are resolved to their latest version (unless you change the [binding type](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/form-linking#camunda-form-linked)), make sure the intended form version is available in the target cluster and the binding resolves to that version.

When deploying to a Camunda 8 cluster running a version earlier than 8.4, forms linked to user tasks or none start events will be automatically embedded in the user task to guarantee backwards compatibility.

Read more about the different ways to reference Camunda Forms in the [user task forms reference](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#user-task-forms).

To [complete a user task](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks), navigate to [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/utilize-forms
