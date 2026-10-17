# Get started with human task orchestration — Step 4: Run your process — saas

If no environment is assigned to your workspace, the deploy dialog tells you so. In SaaS, every cluster you create has one environment, which an organization admin must [assign to your workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments) before you move on.

1. At the top right of the modeling interface, click **Deploy & run** to deploy the process to your cluster.
2. Select a target environment.
3. Under **Resources**, select **All resources**. Your project contains two files: the BPMN process diagram and the linked form. This option deploys both together. In other contexts, it might make sense to deploy **Only this resource** for individual files.
4. Click **Deploy & run**.

This deploys both project resources and starts a process instance.

**Tip**
Other options to run a process are to start it via Tasklist, test it in the Test mode, or call it via the API or an inbound trigger. Read more about [run options](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process).

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks
