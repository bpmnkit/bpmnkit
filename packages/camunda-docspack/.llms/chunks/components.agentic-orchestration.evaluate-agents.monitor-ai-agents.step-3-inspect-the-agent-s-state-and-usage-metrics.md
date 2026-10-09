# Monitor your AI agents with Operate — Step 3: Inspect the agent's state and usage metrics

Select the agent element on the diagram. Operate shows the [data available](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#data-available-in-operate) for its agent instance, including:

- Its agent instance key, displayed above the status.
- Its current state, model, and system prompt.
- The tools resolved for it.
- Its usage metrics: token consumption, tool call count, and model call count against the configured limit.

**Note**
If multiple agent instances are active at the same element, use the dropdown next to the agent instance key to switch between them. Alternatively, select the relevant element instance in **Instance History**, as each element instance has only one agent instance.

For guidance on reading these signals to catch a stuck or looping agent, see [detect off-rail agents](https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/detect-off-rail-agents).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/monitor-ai-agents
