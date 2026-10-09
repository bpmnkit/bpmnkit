# AI Agent connector — Choose an implementation

The AI Agent connector is available in two variants, each with different capabilities, suited for different use cases, and available with a dedicated element template:

- [AI Agent Sub-process](#ai-agent-sub-process).
- [AI Agent Task](#ai-agent-task).

The right implementation depends on your use case.

| Use case                                                                                                      | Implementation              | Description                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agentic workflow with automatic tool calling (most use cases)                                                 | AI Agent Sub-process        | It handles tool resolution and the [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop) automatically. No explicit loop modeling is needed. You must include at least one activity/tool inside the sub-process. |
| Inference tasks that don't require tool calling                                                               | AI Agent Task without tools | A single, one-shot LLM call with no ad-hoc sub-process.                                                                                                                                                    |
| Intercepting tool calls, for example, to add a human approval step or run PII detection before tool execution | AI Agent Task with tools    | Tools are provided by an external ad-hoc sub-process that you model explicitly, giving you full control over the agent loop. This is the most complex configuration.                                       |

**Info**
The **recommended approach** for most use cases is to use the **AI Agent Sub-process** implementation due to the simplified configuration and support for event sub-processes.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
