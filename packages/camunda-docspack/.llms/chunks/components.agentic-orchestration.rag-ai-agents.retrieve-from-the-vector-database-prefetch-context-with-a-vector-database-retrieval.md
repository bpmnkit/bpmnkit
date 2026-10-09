# Add long-term memory to your AI agents — Retrieve from the vector database — Prefetch context with a vector database retrieval

Instead of letting the agent decide when to query the vector database via a tool, you can retrieve relevant context **before** the agent runs. This ensures the agent always has access to relevant knowledge from the first interaction, without requiring a tool call.

This pattern is useful when:

- The user's query is predictable enough to retrieve meaningful context upfront.
- You want to reduce the number of tool calls and agent reasoning steps.
- The agent should ground its first response in domain-specific knowledge without deciding whether to search.

#### Configure the retrieval task

1. Add a **Vector Database connector task** in your process, sequenced before the AI Agent connector task.
2. Set **Operation** to **Retrieve document**.
3. Set **Search query** to the user's input. For example, if the user query is stored in a process variable:

```feel
userQuery
```

4. Set **Max results** to control the maximum number of documents returned. For example, set it to five.
5. Configure the [**Embedding model**](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#embedding-models) with your provider credentials.
6. Configure the [**Vector store**](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#vector-stores) with your database connection details and **index name**. The index name identifies the collection of documents the agent searches. You can use different indexes for different knowledge domains.
7. In the **Output mapping** section, set the output **Result variable**. For example, `retrievalResult`.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
