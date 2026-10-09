# Add long-term memory to your AI agents — How it works

The [Vector Database connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db) supports two operations that together implement long-term memory:

- **Retrieve document**: Performs a semantic similarity search and returns the most relevant results from a vector index. Use this to let the agent query its knowledge base.
- **Embed document**: Converts text into a vector embedding and stores it in the vector index. Use this to add new knowledge to the agent's memory.

The LLM is responsible for generating natural language queries when retrieving, and for deciding what content is worth storing. The actual vector operations (encoding, indexing, and searching) are handled by the connector and the underlying vector store.

To configure either operation, you need:

- A supported [vector store](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#vector-stores) and connection credentials.
- A supported [embedding model](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#embedding-models) and its provider credentials.
- An index name that identifies the collection to read from or write to.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
