# Add tools to an AI agent — Return the result as `toolCallResult` — regular-task

In the **Output mapping** section, add an output mapping with `toolCallResult` as the process variable name:

| Variable assignment value | Process variable name |
| :------------------------ | :-------------------- |
| `= response.body`         | `toolCallResult`      |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
