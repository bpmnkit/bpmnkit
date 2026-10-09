# Monitor your AI agents with Operate — Step 4: Review the conversation history

The conversation history is the agent's decision trail, grouped by [loop iteration](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#conversation-history-and-loop-iterations). Operate labels each group simply as `iteration`, for example `1. iteration`.

By default, entries are sorted by **Latest first**. You can select **Oldest first** to read the history chronologically:

- **Latest first**: Quickly understand the current situation, typically when resolving a problem.
- **Oldest first**: Trace how the agent reached its current state, typically when building an agent for the first time.

For this example, the first iteration shows:

- The user prompt, "Tell me a joke."
- The assistant message where the agent selects the **Jokes API** tool, along with its reasoning.

**Tip**
Hover over a message's token count or duration badge to see a breakdown of its usage metrics.

Operate shows **Thinking** and the formatted text only when the model returns reasoning content. To display readable model reasoning where supported, [migrate to the 8.10 AI Agent element template](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade).

### Dive deeper into messages and tool calls

Every entry in the conversation history can be expanded for a closer look. Select the expand icon on a user or assistant message, or on a tool call, to open a larger view:

A user or assistant message may contain formatted text, so expanding it opens a **Preview** of its rendered Markdown by default. Switch to **Source** to view the raw Markdown instead.

Expanding a tool call shows the tool's description, along with the full input and output exchanged with it:

**Note**
Use the copy icon in any of these expanded views to copy its content.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/monitor-ai-agents
