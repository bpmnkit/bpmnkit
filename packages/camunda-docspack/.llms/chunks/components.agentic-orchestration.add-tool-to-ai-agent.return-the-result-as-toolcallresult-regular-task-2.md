# Add tools to an AI agent — Return the result as `toolCallResult` — regular-task

A regular task, such as a user task, can add fields one at a time. Use the [`context put()`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-context#context-putcontext-key-value) FEEL function to add a single key to the existing `toolCallResult` context without replacing it.

Write the call as the **Variable assignment value** of a mapping whose **Process variable name** is `toolCallResult`:

| Variable assignment value                                      | Process variable name |
| :------------------------------------------------------------- | :-------------------- |
| `=context put(toolCallResult, "status", response.body.status)` | `toolCallResult`      |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
