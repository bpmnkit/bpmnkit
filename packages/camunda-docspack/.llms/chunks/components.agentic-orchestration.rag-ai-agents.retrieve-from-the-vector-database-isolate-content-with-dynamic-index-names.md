# Add long-term memory to your AI agents — Retrieve from the vector database — Isolate content with dynamic index names

When multiple agents, tenants, or conversations share the same vector database, you can isolate their content by using **dynamic index names**. Instead of hardcoding a single index, construct the index name at runtime using process variables. For example, by appending a tenant ID or conversation ID:

```feel
"knowledge-base-" + tenantId
```

This ensures each scope reads and writes only its own documents, without requiring metadata-based filtering at query time.

Because indexes are created on demand when documents are first embedded, a retrieval task may run before any documents have been stored for a given scope. This may result in an `index_not_found` error.
See how to [handle missing or empty results](#handle-missing-or-empty-results).

#### Handle missing or empty results

To prevent process failures when no results are retrieved, you can set an error handler to inform the agent as follows.

1. In the **Error handling** section, set the **Error expression** to handle these scenarios. For example:

```
if contains(error.message, "index_not_found") then bpmnError("index_not_found", "The index does not exist") else null
```

2. Add an [**error boundary event**](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities/call-activities#boundary-events) to the Vector Database connector:
3. In the boundary event's **Output mapping** section, add an output variable as follows:

- Set **Process variable name** to `toolCallResult`.
- Set **Variable assignment value** to:
  ```
  {
    "searchResult": "Nothing was found"
  }
  ```

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
