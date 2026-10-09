# Design and architecture — Design agent orchestration workflows — Define your agent tools

In the AI agent model, each BPMN element inside an ad-hoc sub-process is a tool exposed to the LLM. The element's **ID** is used as the tool name, and its **Documentation** field is used as the tool description (falling back to the element's **Name** if **Documentation** is empty). The LLM uses this tool definition to decide which tool to call, in what order, and with which parameters.

Clear, behavior-oriented tool names and descriptions directly improve agent reliability. Vague or missing documentation increases the risk of incorrect tool selection, repeated calls, and hallucinated behavior.

For a how-to guide on adding tools, see [add tools to an AI agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture
