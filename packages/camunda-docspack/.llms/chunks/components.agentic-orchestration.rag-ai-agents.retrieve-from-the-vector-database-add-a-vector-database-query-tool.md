# Add long-term memory to your AI agents — Retrieve from the vector database — Add a vector database query tool

To let an agent query a vector database, add a **Vector Database connector task** with no incoming sequence flows inside the AI Agent's [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses).

**Note**
Tasks with no incoming flows are treated as available [tools](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions) by the AI Agent connector.

Configure the task as follows:

1. Give the task a clear **Name** and write a descriptive **Element documentation** to help the LLM understand when to use this tool. The element documentation is passed to the LLM as the [tool description](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-definitions).
2. Set **Operation** to **Retrieve document**.
3. Set **Search query** using the [`fromAi()`](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#ai-generated-parameters-via-fromai) function so the LLM generates the query dynamically at runtime:

```feel
fromAi(toolCall.query, "The query you're making to the vector database.")
```

4. Set **Max results** to control the maximum number of documents returned. For example, set it to five.
5. Configure the [**Embedding model**](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#embedding-models) with your provider credentials.
6. Configure the [**Vector store**](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#vector-stores) with your database connection details and **index name**. The index name identifies the collection of documents the agent searches. You can use different indexes for different knowledge domains.
7. In the **Output mapping** section, set the output **Result variable** to `toolCallResult`.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
