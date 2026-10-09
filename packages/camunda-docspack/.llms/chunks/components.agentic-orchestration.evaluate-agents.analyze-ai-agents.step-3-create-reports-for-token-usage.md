# Analyze your AI agents with Optimize — Step 3: Create reports for token usage

You can create reports for token usage across process instances and over time.

1. Go to the **Collections** tab.
1. Select **Report** from the **Create new** dropdown.
1. Select **AI Agent Chat With Tools** from the **Select one or more processes** dropdown. You can fetch data for all process model versions or customize it.
1. Choose a blank template.
1. Enable **Update preview automatically** to make it easier to see the report results as you configure it.
1. In the **Report setup** section, select **Variable** in the **View** option, and then select **tokenUsage**.
1. Click the pencil icon and select an aggregation that matches your goal. For example:
   - **Sum** to track total tokens across instances.
   - **Average** to track typical usage per process instance.
1. Save the report with a descriptive name. For example, **Token usage**.

**Note**
You can create similar reports, targeting other goals and process variables, such as `inputTokenUsage` or `outputTokenUsage`.

### Example: Set a target threshold

If you have a token budget, you can set a target in the report.

1. Complete steps 1–6 in [Step 3: Create reports for token usage](#step-3-create-reports-for-token-usage).
1. In the **Visualization** settings, click the gear icon and enable **Set target** to configure a target value. For example, a maximum token usage threshold.
1. Set the target threshold to match your budget. For example, select the **below** option and set it to 10,000 tokens.
1. Save the report with a descriptive name. For example, **Token usage with threshold**.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/analyze-ai-agents
