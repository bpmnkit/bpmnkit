# Agent fromAi() contract

Reference for the `agent-fromai-contract` rule.

The [`fromAi()`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-ai-agent) FEEL function declares a tool's LLM-supplied inputs within an [AI Agent sub-process](https://docs.camunda.io/docs/next/components/agentic-orchestration/agentic-orchestration-overview). A malformed call resolves to nothing at runtime without producing an error, so malformed calls are reported as errors. A call without a description is valid and is not reported.


## (guideline) Contract breaks

The rule reports the following problems:

- **Key is not a FEEL path**: The first argument must be a path expression, such as `toolCall.url`, rather than a string literal, number, `null`, bracket notation, or conditional expression.
- **Key does not start with `toolCall.`**: The connector populates only fields in the `toolCall` context.
- **Key is nested**: The connector uses only the last path segment as the parameter name. Use a single name, such as `toolCall.filter`.
- **Key is declared twice in one tool**: Duplicate keys collide because a tool's `fromAi()` calls are combined into a single input schema.
- **Wrong function-name casing**: The function name is case-sensitive. Use `fromAi`.
- **Description is not a string literal**: The description must be a quoted string, for example, `fromAi(toolCall.url, "The URL to fetch.")`.
- **`fromAi()` is in the wrong place**: The function is valid only in an input mapping on the tool's entry element. This is the activity with no incoming sequence flow. Anywhere else, it resolves to `null`:

![Two activities in a tool's sub-flow: the first has no incoming sequence flow and is the tool's entry element, while the second is reached by a sequence flow and is not](./img/agent-fromai-contract/entry-element.png)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-fromai-contract
