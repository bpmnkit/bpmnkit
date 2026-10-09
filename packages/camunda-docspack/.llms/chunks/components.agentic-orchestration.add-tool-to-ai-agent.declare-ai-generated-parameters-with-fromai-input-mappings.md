# Add tools to an AI agent — Declare AI-generated parameters with `fromAi()` — input-mappings

Use this approach for an element without an element template, such as a plain service, script, or user task.

1. Select the tool element and open the **Input mapping** section in the properties panel.
1. Add a new entry and set its **Local variable name**. This is the name you use to reference the value elsewhere in the element, for example in a script task's FEEL expression.
1. Set the **Variable assignment value** to a `fromAi()` call, referencing the parameter as a field of the `toolCall` context.
1. Repeat for each value the LLM should supply.

For example, to let the LLM supply the URL a task should call:

| Local variable name | Variable assignment value                                                 |
| :------------------ | :------------------------------------------------------------------------ |
| `url`               | `=fromAi(toolCall.url, "The URL to fetch. Must be a valid HTTP(s) URL.")` |

Whichever approach you use, the following applies:

- The first argument must be a reference to a field of the `toolCall` context, such as `toolCall.url`. The AI Agent connector populates this context with the LLM-generated values.
- The parameter name the LLM sees is the last segment of that reference, `url` in the previous examples, not the **Local variable name** or the template field name.
- The AI Agent connector collects every `fromAi()` call in the element and combines them into one input schema for the tool.

See [AI-generated parameters via `fromAi`](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#ai-generated-parameters-via-fromai) for more details, including parameter types, optional parameters, and JSON Schema constraints.

**Note**
While modeling, you'll receive [guidance](https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-fromai-contract) that flags malformed `fromAi()` calls. When modeling in Camunda Hub, you can also [autofill a starter `fromAi()` call](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#autofill-a-fromai-input) into a blank input.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
