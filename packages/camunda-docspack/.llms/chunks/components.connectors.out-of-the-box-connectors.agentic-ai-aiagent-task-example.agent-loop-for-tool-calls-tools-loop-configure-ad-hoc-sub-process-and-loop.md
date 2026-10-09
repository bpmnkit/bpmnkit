# Example AI Agent Task connector integration — Agent loop for tool calls {#tools-loop} — Configure ad-hoc sub-process and loop

1. The ad-hoc sub-process is marked as a [parallel multi-instance](https://docs.camunda.io/docs/next/components/modeler/bpmn/multi-instance/multi-instance). This allows the process to execute the tools in parallel, and wait for all tool calls to complete before continuing with the process.

1. A descriptive ID is configured for the ad-hoc sub-process. This can then be configured in the **Ad-hoc sub-process ID** field in the AI Agent connector [tools](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task#tools) section.

1. The ad-hoc sub-process is marked as a tool container. Open the **Extension properties** section in the properties panel and add a property named `io.camunda.agenticai.toolContainer` with the value `true`. This enables the Modeler's agent tool configuration features, such as linting and autofill, for the tools in the sub-process. See [declare a sub-process as agentic](https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-fromai-contract#declare-a-sub-process-as-agentic).

1. A loop is modeled into the sub-process and back to the AI Agent connector.
   - The `no` flow of the `Contains tool calls?` gateway is marked as the default flow.

   - The `yes` flow condition is configured to activate when the AI Agent response contains a list of tool calls. For example, if the suggested default values for the [result variable/expression](#result-variableexpression) are used, this condition could be configured as follows:

     ```feel
     not(agent.toolCalls = null) and count(agent.toolCalls) > 0
     ```

     The process execution routes through the ad-hoc sub-process if the LLM response requests one or more tools to be called.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task-example
