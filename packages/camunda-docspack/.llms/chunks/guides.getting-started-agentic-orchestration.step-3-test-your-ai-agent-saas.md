# Build your first AI agent — Step 3: Test your AI agent — saas

1. In [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index), open the BPMN diagram.
1. Select the [**Test**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) tab.
1. Select the environment you want to deploy and test the process on.
1. Click **Deploy**.
1. Open the Start form and add a prompt for the AI agent. For example, enter "Tell me a joke" in the **How can I help you today?** field, and click **Start instance**.
1. The AI agent analyzes your prompt, decides what tools to use, and responds with an answer. Open the **Task form** to view the result.
1. You can [monitor the process execution](#monitor-the-process-execution) in Operate.
1. You can follow up with more prompts to continue testing the AI agent. Select the **Are you satisfied with the result?** checkbox when you want to finish your testing and complete the process.

**Important: Test mode not supported**
Because the AI agent in this example is an ad-hoc sub-process, you can't use **Test mode** to run it (ad-hoc sub-processes are a known [limitation](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process#test-cases-limitations)). Instead, deploy the process within the **Implement** tab using **Deploy & Run**, and use [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist) to complete the form.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
