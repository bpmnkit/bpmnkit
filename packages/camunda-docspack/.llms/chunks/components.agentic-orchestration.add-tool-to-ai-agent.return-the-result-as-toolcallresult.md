# Add tools to an AI agent — Return the result as `toolCallResult`

After the tool executes, its output must be returned in a [process variable](https://docs.camunda.io/docs/next/reference/glossary#process-variable) named `toolCallResult` so the AI Agent connector can pass it back to the LLM.

At runtime, each tool call produces one `toolCallResult`. The ad-hoc sub-process's multi-instance output collection aggregates these into `toolCallResults`, which the AI Agent connector reads to build the LLM's response.

**Note**
While modeling, you'll receive [guidance](https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-tool-output-key) that flags tools that do not set a result or set it under the wrong variable name.
When modeling in Camunda Hub, you can also [autofill the `toolCallResult` output](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#autofill-a-toolcallresult-output).

How you set `toolCallResult` depends on the BPMN element type that implements your tool. For example, a connector task exposes a dedicated [result expression](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#result-expression) field, a regular task uses [output mappings](https://docs.camunda.io/docs/next/components/concepts/variables#output-mappings), and a script task uses a dedicated result variable. Use the approach that matches your tool's element type:

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
