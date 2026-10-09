# Add tools to an AI agent — Add an element inside the ad-hoc sub-process

1. Open your process in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index).
1. Click inside the ad-hoc sub-process to enter it.
1. Add a new task element. You can use any BPMN element as a tool, including service tasks, script tasks, user tasks, and sub-processes.
1. Apply the appropriate connector or task type. For example:
   - Use the [REST Outbound connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) to call an external API.
   - Use a [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) to route to a human reviewer.
   - Use a [script task](https://docs.camunda.io/docs/next/components/modeler/bpmn/script-tasks/script-tasks) to execute inline logic.
1. Make sure the element has **no incoming sequence flow**, as the AI Agent connector only resolves root-level elements as tools.

**Tip**
You can model a sub-flow inside the ad-hoc sub-process. Only the first element in the sub-flow (the root node) is exposed to the LLM as a tool; the rest of the flow executes automatically once the LLM selects it.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
