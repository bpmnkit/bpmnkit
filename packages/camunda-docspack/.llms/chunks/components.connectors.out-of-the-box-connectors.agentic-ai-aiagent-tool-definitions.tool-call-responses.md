# AI agent tool definitions — Tool call responses

To collect the output of the called tool and pass it back to the agent, the task within the ad-hoc sub-process needs to
set its output to a predefined variable name. For the **AI Agent Sub-process** implementation, this variable is predefined as
`toolCallResult`. For the **AI Agent Task** implementation, the variable depends on the configuration of the [multi-instance execution](#tools-loop),
but is also typically named `toolCallResult`.

Depending on the used task, setting the variable content can be achieved in multiple ways:

- A [result variable](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#result-variable) or
  a [result expression](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#result-expression) containing a `toolCallResult` key
- An [output mapping](https://docs.camunda.io/docs/next/components/concepts/variables#output-mappings) creating the `toolCallResult` variable or adding
  to a part of the `toolCallResult` variable (for example, an output mapping could be set to `toolCallResult.statusCode`)
- A [script task](https://docs.camunda.io/docs/next/components/modeler/bpmn/script-tasks/script-tasks) that sets the `toolCallResult` variable

If a tool consists of multiple elements (for example, a sequence of tasks with a gateway), `toolCallResult` can be set at
any point in the flow. The variable is [read from the tool's scope when the flow completes](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses#collect-output).

Tool call results can be either primitive values (for example, a string) or complex ones, such as
a [FEEL context](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions) that is serialized to a JSON
string before passing it to the LLM.

As most LLMs expect _some_ form of response to a tool call, the AI Agent will return a constant string indicating that the tool
was executed successfully without returning a result to the LLM if the `toolCallResult` variable is not set or empty after executing
the tool.

In the Camunda Hub modeler, you can [autofill the `toolCallResult` output](#autofill-a-toolcallresult-output).

### Document support

Tool call responses can contain [Camunda document references](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/overview)
nested anywhere within the result structure. The agent extracts these documents and passes them to the LLM as native
content blocks.

For supported file types and details on how documents are resolved, see [document support](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-documents).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
