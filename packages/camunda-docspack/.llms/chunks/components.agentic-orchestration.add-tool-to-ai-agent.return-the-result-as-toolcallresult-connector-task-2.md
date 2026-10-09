# Add tools to an AI agent — Return the result as `toolCallResult` — connector-task

A connector task cannot add fields one at a time. A connector **Result Expression** has no access to process variables, so it cannot read the current value of `toolCallResult`.

Build the complete result in a single **Result expression** instead:

```feel
{
  toolCallResult: {
    status: response.status,
    body: response.body
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
