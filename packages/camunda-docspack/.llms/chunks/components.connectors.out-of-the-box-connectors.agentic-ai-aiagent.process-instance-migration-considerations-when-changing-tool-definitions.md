# AI Agent connector — Process instance migration — Considerations when changing tool definitions

**Info**
When you change an existing tool definition (such as updating a tool's description or adding/modifying `fromAi()` parameters), the AI Agent detects the change and updates its tool definitions on the next execution.

Because a migration can occur between an AI Agent execution and the actual tool call, tools may receive parameters based on the previous definition. Ensure your tool implementations handle this scenario gracefully.

- **Description changes**: Updates to tool or parameter descriptions take effect on the next AI Agent execution. The LLM uses the updated descriptions when deciding which tools to call.
- **Parameter changes**: Adding, removing, or modifying `fromAi()` parameters is supported. However, the tool implementation must handle potentially missing or changed parameters.

For example:

- A script task should implement a null-check to return an error message if a newly required parameter is missing from an in-flight tool call.
- When changing an input parameter from a numeric type to a complex type (such as an object), the implementation should handle cases where the parameter is still provided using the numeric type.

When a tool receives a parameter in a different format than expected, it can either handle the situation gracefully (for example, by using a default value or converting to a suitable format), or return an actionable error message that can instruct the LLM to provide the correct parameters.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
