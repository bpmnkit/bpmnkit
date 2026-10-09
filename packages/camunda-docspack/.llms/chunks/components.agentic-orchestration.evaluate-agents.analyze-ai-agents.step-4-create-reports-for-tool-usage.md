# Analyze your AI agents with Optimize — Step 4: Create reports for tool usage

You can create reports for tool usage across process instances and over time.

### Example: Create a heatmap

Use a heatmap to understand how long your AI agent spends in each task.

1. Go to the **Collections** tab.
1. Select **Report** from the **Create new** dropdown.
1. Select **Flow node** as the **View**.
1. Select **Duration** as the **Measure**.
1. (Optional) Filter the report by selecting **Flow node selection** in the **Filter flow nodes** dropdown. For example, select only tool tasks within the AI Agent connector.
1. In the **Visualization** settings, select **Heatmap**. Click the gear icon and enable the tooltip to show absolute values.
1. Save the report with a descriptive name. For example, **Tool usage heatmap**.

You can see from the heatmap that the **Search recipe**, **Jokes API**, and **Get list of Tech Stuff** tools are the only ones that were called across all process executions, and that your AI agent spent the most time in **Get list of Tech Stuff**.

### Example: Create a report for tool call counts

Create a bar chart to see how many times each tool is called.

1. Go to the **Collections** tab.
1. Select **Report** from the **Create new** dropdown.
1. Select **Flow node** as **View**.
1. Select **Count** as the **Measure**.
1. (Optional) Filter the report by selecting **Flow node selection** in the **Filter flow nodes** dropdown. For example, select only tool tasks within the AI Agent connector.
1. In the **Visualization** settings, select **Bar chart** or **Pie chart**. Then click the gear icon and enable both tooltips to show absolute and relative values.
1. Save the report with a descriptive name. For example, **Tool usage**.

You can see from the pie chart that the AI agent called the Jokes API tool most often across all process executions.

### Example: Track trends over time

Use a timeline report to analyze trends over time. For example, you can see how many times a tool is called per day over a one-week period.

1. Go to the **Collections** tab.
1. Select **Report** from the **Create new** dropdown.
1. Select **Flow node** as **View**.
1. Select **Count** as the **Measure**.
1. In **Group by**, select **Start date**. Then choose your preferred interval, for example, **Week**.
1. (Optional) Filter the report by selecting **Flow node selection** in the **Filter flow nodes** dropdown. For example, select only tool tasks within the AI Agent connector.
1. In the **Visualization** settings, select **Bar chart** or **Line chart**. Then click the gear icon and enable both tooltips to show absolute and relative values.
1. Save the report with a descriptive name. For example, **Tool usage over time**.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/analyze-ai-agents
