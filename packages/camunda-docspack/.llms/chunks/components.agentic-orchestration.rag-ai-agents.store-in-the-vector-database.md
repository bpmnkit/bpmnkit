# Add long-term memory to your AI agents — Store in the vector database

You can store knowledge in the vector database in two ways:

- **Batch import**: Documents are embedded and stored before the agent starts processing, typically as part of a data preparation process. Use a Vector Database connector task in a separate BPMN process or script.
- **Runtime ingestion**: New knowledge is added to the vector database as the agent encounters it. For example, when a human provides an answer that did not previously exist in the database.

**Note**
Re-embedding the same document is **not idempotent**: if you store it again without deleting the existing chunks first, you’ll create **duplicate chunks** in the vector database.

For both approaches, add a **Vector Database connector task** and configure it as follows:

1. Set **Operation** to **Embed document**.
1. Set **Document source** to **Plain text**.
1. Provide the text to embed. This can be a process variable, a form output, or any string value.
1. Configure the same [**Embedding model**](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#embedding-models) and [**Vector store**](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db#vector-stores) settings used by the retrieval method so both operations target the same index.

**Important**
Make sure the embedding model configuration, including vector dimensions, matches your retrieval setup.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
