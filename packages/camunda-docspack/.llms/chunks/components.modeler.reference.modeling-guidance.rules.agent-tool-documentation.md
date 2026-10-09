# Agent tool documentation

Reference for the `agent-tool-documentation` rule.

Tools within an [AI Agent sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) require a documentation entry, which the AI agent uses to select tools.

Missing documentation does not cause an outright failure, but an undocumented tool might degrade the AI agent's performance. To fix this, select the tool's entry element, open the **Documentation** section in the properties panel, and describe what the tool does and when the agent should use it.

The rule checks the tool's entry element, the activity with no incoming sequence flow. Activities reached through a sequence flow are part of the tool's internal flow and do not require their own documentation. Event sub-processes are also skipped because they are triggered by events rather than called by the agent:

![Two activities in a tool's sub-flow: the first has no incoming sequence flow and is the tool's entry element, while the second is reached by a sequence flow and is not](./img/agent-tool-documentation/entry-element.png)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-tool-documentation
