# Detect off-rail agents — Respond to limit proximity warnings

Camunda tracks model calls against an agent’s configured limit, so you can see how close an agent instance is to reaching it. A proximity warning means the agent instance is nearing its limit and could reach it during a subsequent loop iteration.

Apply the following best practices when you see a proximity warning:

- **Investigate before the hard limit hits.** Use a proximity warning as a prompt to check the agent instance's other health indicators. An agent nearing its limit while making steady progress is different from one nearing its limit while stuck in a loop.
- **Handle the limit explicitly instead of letting it fail the process instance.** Catch the limit-reached error with an error boundary event and an [error expression](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#error-expression), and route it to a human reviewer instead of failing the process instance. See the [guardrail sandwich and human-in-the-loop escalation](https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture#design-agent-orchestration-workflows) design principles.
- **Size the limit to the task, not the default.** A **Maximum model calls** value that's frequently near-exhausted by agents completing their task normally is probably too low for that task's typical loop count. Raise it deliberately rather than repeatedly dismissing the warning.
- **Don't treat a higher limit as the fix for a stuck agent.** If an agent instance reaches its limit while stuck, for example, repeating the same tool call, raising the limit only lets it consume more tokens and tool calls before failing. Address the underlying cause, such as the tool's input, output, or description, instead.

With the AI Agent connector, you can configure this limit using the **Maximum model calls** field. For more details, see the **Limits** section in the [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#limits) or [AI Agent Task](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task#limits) connector documentation, depending on your Camunda AI agent implementation. Reaching this limit throws a `MAXIMUM_NUMBER_OF_MODEL_CALLS_REACHED` [error](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#error-handling), which creates an incident unless it's caught with an error boundary event.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/detect-off-rail-agents
