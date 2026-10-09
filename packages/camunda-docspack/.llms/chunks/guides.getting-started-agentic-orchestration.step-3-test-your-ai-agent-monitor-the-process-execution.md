# Build your first AI agent — Step 3: Test your AI agent — Monitor the process execution

Open [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) at http://localhost:8080/operate, and locate your process instance to watch the agent at work.

Select the AI agent element to view usage metrics, its full conversation history, available tools, and other details:

For a hands-on walkthrough of the agent instance details available in Operate, see [monitor your AI agents with Operate](https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/monitor-ai-agents).

When you run the AI agent process:

1. The AI agent receives your prompt and analyzes it together with the configured system prompt and tool descriptions.
1. The LLM determines which tools from the ad-hoc subprocess should be activated.
1. Camunda executes the selected BPMN activities.
1. Tasks can execute in parallel or sequentially, depending on the agent's decisions and process state.
1. Process variables are updated as each tool completes its execution.
1. The agent may iterate through multiple tool calls to handle complex requests.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
