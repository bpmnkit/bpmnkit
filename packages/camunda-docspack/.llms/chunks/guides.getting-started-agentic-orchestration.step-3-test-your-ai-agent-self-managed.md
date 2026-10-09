# Build your first AI agent — Step 3: Test your AI agent — self-managed

1. If using **Desktop Modeler**:
   1. [Deploy the process model](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/deploy-diagram) to your local Camunda 8 environment.
   1. Open each form, and click **Deploy**. [Linked forms are not deployed automatically with the process](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/utilize-forms#deploy-a-form). Skipping this step causes Tasklist to fail with "We were not able to load the form" when you try to start the process.
1. If using **Camunda Hub**, choose one of the following options:
   - [Deploy your project](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project) as a bundle.
   - [Deploy **All resources**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process) from the diagram or a form.
1. Open Tasklist in your browser at http://localhost:8080/tasklist.
1. On the **Processes** tab, find the `AI Agent Chat With Tools` process and click **Start process**.
1. In the start form, add a prompt for the AI agent. For example, enter "Tell me a joke" in the **How can I help you today?** field, and click **Start process**.
1. The AI agent analyzes your prompt, decides what tools to use, and responds with an answer.
1. Select the **Tasks** tab in Tasklist. When the AI agent finishes processing, you should see a `User Feedback` task waiting for you to complete.
1. You can [monitor the process execution](#monitor-the-process-execution) in Operate.
1. You can follow up with more prompts to continue testing the AI agent. Select the **Are you satisfied with the result?** checkbox when you want to finish the process.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
