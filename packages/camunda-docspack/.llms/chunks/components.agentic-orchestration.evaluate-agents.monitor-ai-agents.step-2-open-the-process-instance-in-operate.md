# Monitor your AI agents with Operate — Step 2: Open the process instance in Operate

1. [Open Operate](https://docs.camunda.io/docs/next/components/operate/userguide/basic-operate-navigation#open-operate).
2. Locate the process instance created by your prompt. See [view a deployed process](https://docs.camunda.io/docs/next/components/operate/userguide/basic-operate-navigation#view-a-deployed-process) for more details.
3. Open your process instance view by clicking on its process instance key.

At this point, you should see the process progressing through your model:

Operate highlights the agent element's current [state](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-states-and-metrics#agent-states). For example, `Thinking` while the agent reasons, or `Tool calling` while it calls the **Jokes API** tool. A simple prompt like this one moves through its loop quickly, so the agent instance may already show `Idle` or `Completed` by the time you look.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/monitor-ai-agents
