# Monitor your AI agents with Operate

Monitor and troubleshoot your AI agent process instances in real time using Operate

Monitor and troubleshoot your AI agent process instances in real time using Operate.


## About

In this guide, you will:

- Inspect an AI agent's real-time state and usage metrics from its process instance in Operate.
- Review the agent's decision trail: the conversation history grouped by loop iteration, including the tools it selected and the results it received.
- Understand how the agent's conversation memory is stored.

**Note**
Operate surfaces the agent's state, metrics, and conversation history directly, so you rarely need to inspect raw process variables. Some runtime artifacts, such as document storage contents, may still require additional configuration to view. See [agent context and memory](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#agent-context-and-memory) for how the underlying data is stored.

After completing this guide, you will be able to monitor, debug, and troubleshoot AI agent executions in Operate, including agents built with external frameworks such as LangGraph or CrewAI. See [connect an external agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent) for how those agents report the same data.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/monitor-ai-agents
