# Agent definitions and instances — Agent instances — Data available in Operate

Operate surfaces agent instance data so you can monitor an agent as part of its process instance. See [monitor your AI agents with Operate](https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/monitor-ai-agents) for a hands-on guide to inspecting this data.

The following data is available for an agent instance in Operate:

| Data                 | Description                                                                                                                                                                                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent instance key   | The unique identifier of the agent instance. Use it to look up or interact with the agent through the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api).                                                                                                   |
| Agent state          | The current execution state of the agent, such as initializing, tool discovery, thinking, tool calling, or idle. The state is also highlighted on the BPMN diagram. See [states](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-states-and-metrics#agent-states) for what each state means and what triggers a transition. |
| Usage metrics        | Token consumption, tool call count, and model call count. Model calls are shown against the configured limit, so you can see how close the agent is to its limit. See [usage metrics](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-states-and-metrics#usage-metrics) for details.                                        |
| Model                | The LLM the agent is running against.                                                                                                                                                                                                                                                                                  |
| System prompt        | The system prompt the agent was configured with.                                                                                                                                                                                                                                                                       |
| Tool definitions     | The [tools](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions) available to the agent, resolved from the agent's ad-hoc sub-process.                                                                                                                                             |
| Conversation history | The decision trail of the agent execution: initial configuration, user prompts, assistant messages, the tools the agent selected with its reasoning, and tool calls with their inputs and results.                                                                                                                     |

#### Conversation history and loop iterations

The conversation history captures the full reasoning chain of an agent execution, grouped by loop iteration. A [loop iteration](https://docs.camunda.io/docs/next/reference/glossary#loop-iteration) is one pass through the [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop): the model reasons over the current messages, optionally calls tools, and receives the tool results that become the input for the next loop iteration.

Grouping the history by loop iteration makes it easier to reference a specific point in an agent's execution. Rather than describing a moment in time, you can refer to a specific loop iteration, for example "on loop iteration five the agent called this tool."

Operate labels each entry in the conversation history simply as `iteration` (for example, `5. iteration`) as shorthand for loop iteration.

#### Model reasoning in conversation history

Operate displays readable model reasoning as a static **Thinking** entry before the assistant’s response. It recognizes non-empty text in the assistant history marked with `camunda.agenticai.content.type: reasoning`.

To display readable model reasoning where supported, [migrate to the AI Agent element templates introduced in Camunda 8.10](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade). If you do not see **Thinking**, confirm that your [model provider](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers) returns readable reasoning. Opaque or redacted reasoning is not displayed.

#### Visibility for external agents

Agents built with external frameworks get the same visibility in Operate as Camunda AI agents. An external agent reports its system prompt, available tools, tool calls, and conversation history through the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api), and Operate displays that data alongside the process instance.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
