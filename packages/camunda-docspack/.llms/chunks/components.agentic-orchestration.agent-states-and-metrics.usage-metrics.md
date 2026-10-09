# States and usage metrics — Usage metrics

Track usage metrics for each agent instance to monitor cost and activity.

**Note: Usage metrics can be lost**
Camunda can only record usage metrics when it's informed about them by the worker or connector that made the call to the LLM. If that worker or connector fails before it can report the usage, for example, if it crashes or loses connectivity, those metrics are lost, even though the LLM provider already processed and billed for the call.

This can happen regardless of which agent implementation you use, including the [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent) and [external agents](https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent). For the authoritative token counts and costs, always refer to your LLM provider's own usage reporting rather than relying solely on Camunda's metrics.

### Token consumption

Camunda tracks the number of tokens consumed by the agent's model calls. Token consumption accumulates as the conversation grows: every loop iteration adds the previous tool results and the model's reasoning to the context that's sent with the next model call, so token usage tends to climb with each additional loop iteration.

Rising token consumption without a final response is a signal that the conversation is growing without converging on an outcome. Token usage is also a direct driver of the LLM provider cost for the agent's execution.

When using the [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent), see [context window size](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#memory) for how conversation length is capped independently of token count.

### Tool call count

Camunda counts the number of tool calls the agent instance has made across all loop iterations. A climbing tool call count generally reflects active work, but a count that climbs while the agent calls the same tool repeatedly with similar or identical inputs can indicate the agent is stuck rather than progressing.

### Model call duration

Camunda records the duration of each model call in the agent's conversation history. A model call that takes far longer than comparable ones is a sign the agent isn't progressing normally. This duration is surfaced per model call, not for tool results.

Tool execution duration is not part of the conversation history metrics. When a tool is a BPMN element, you can see how long its execution took from the usual element instance details in the details tab for that tool activation.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-states-and-metrics
