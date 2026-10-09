# Example AI Agent Task connector integration — Agent loop for tool calls {#tools-loop} — Configure multi-instance execution

The ad-hoc sub-process in this example is configured as a [parallel multi-instance](https://docs.camunda.io/docs/next/components/modeler/bpmn/multi-instance/multi-instance) sub-process (instead of sequential multi-instance).

This allows:

- Tools to be called **independently of each other**, each with its own set of input parameters. This also implies that the same tool can be called **multiple times with different parameters** within the same ad-hoc sub-process execution. For example, a _Lookup user_ tool could be called multiple times with different user IDs.

- The process to **wait until all requested tools have been executed** before passing the results back to the AI Agent/LLM. After all tools have been executed, results are passed back to the AI Agent connector.

#### Configure properties

The following properties for the ad-hoc sub-process must be configured. You can use the following suggested values as a starting point and change as required or if dealing with multiple agents within the same process.

- **Input collection**: Set this to the list of tool calls your AI Agent connector returns, for example `agent.toolCalls`.
- **Input element**: Contains the individual tool call, including LLM-generated input parameters based on the [tool definition](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-definitions). Must aways be set to `toolCall`.
- **Output collection**: Collects the results of all the requested tool calls. Suggested value: `toolCallResults`. Make sure you pass this value as [Tool Call Results](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task#tools) in the AI Agent configuration.
- **Output element**: Collects the individual tool call result as returned by an individual tool (see [Tool Call Responses](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-call-responses)). When changing this `toolCallResult` to a different value, make sure you also change your tools to write to the updated variable name.
  ```feel
  {
    id: toolCall._meta.id,
    name: toolCall._meta.name,
    content: toolCallResult
  }
  ```

As a final step, the element must be configured to activate the ad-hoc sub-process.

- When using a multi-instance configuration, this is always the single task ID of the tool being executed in the individual instance.
- Configure **Active elements collection** to contain the exact `[toolCall._meta.name]`.

For example, the completed ad-hoc sub-process configuration would look as follows:

![AI Agent ad-hoc sub-process multi-instance configuration](../img/ai-agent-ad-hoc-sub-process-multi-instance.png)

#### Configure an input mapping for the tool call result variable

To prevent interference between tool calls, create an [input mapping](https://docs.camunda.io/docs/next/components/concepts/variables#input-mappings) for the `toolCallResult` variable. This ensures the variable is created as a local variable within the ad-hoc sub-process.

1. In the **Inputs** section of the ad-hoc sub-process properties panel, add a new entry.
2. In the **Local variable name** field, enter `toolCallResult` (or use your custom variable name if you changed it earlier).
3. Leave the **Variable assignment value** field blank.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task-example
