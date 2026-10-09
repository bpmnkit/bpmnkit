# Analyze your AI agents with Optimize — Step 1: Make your data available

Optimize's report builder can only aggregate over process variables, so any custom report you build yourself needs its data available as one. To make data available to Optimize, make sure it's scoped at the process level. If it's scoped to a lower level, for example, within a connector or tool-execution scope, extract it into process variables.

**Important**
Optimize can only use variable data at the **process level**.

### Example: Collect token usage

In the AI Agent Chat Quick Start example, token usage data is not available at the process level, but in a nested scope.
How you extract it depends on your AI agent implementation. The important aspect is that the target variables exist at the **process level** when the instance finishes.

**Note**
Getting the token usage from the agent context only works with the AI Agent Sub-process when the **Include agent context** option in the **Response** section is enabled.

To surface this data, you can add a script task after the AI agent execution that copies the values into process variables as follows:

1. Add a [script task](https://docs.camunda.io/docs/next/components/modeler/bpmn/script-tasks/script-tasks).
1. Configure its **Properties**:
   - Set **Name** to `Gather metrics` under the **General** section.
   - Select **FEEL expression** as **Implementation**.
   - Under **Script**:
     - Set **Result variable** to `tokenUsage`.
     - Set **FEEL expression** to `agent.context.metrics.tokenUsage`.
   - Under **Output mapping**, add two process variables:
     - `inputTokenUsage` with **Variable assignment value**: `agent.context.metrics.tokenUsage.inputTokenCount`.
     - `outputTokenUsage` with **Variable assignment value**: `agent.context.metrics.tokenUsage.outputTokenCount`.

You should see something similar to the following:

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/analyze-ai-agents
