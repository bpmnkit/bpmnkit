# Add long-term memory to your AI agents

Add long-term memory to your AI agents using RAG and the Vector Database connector.

Use Retrieval-Augmented Generation (RAG) with the [Vector Database connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db) to give your AI agents access to persistent, domain-specific knowledge that grows over time.


## When to use long-term memory

A standard AI agent operates within a fixed context window. This works well for many tasks, but becomes limiting when the agent needs access to large or frequently updated knowledge.

Long-term memory solves this by storing knowledge outside the agent in a vector database and retrieving only the most relevant fragments at runtime. Common use cases include:

- **Policy and procedure lookup**: The agent answers questions about internal rules or processes by retrieving the relevant document sections on demand.
- **Product and catalog search**: The agent finds product details, specifications, or pricing from a large catalog without loading it all into context.
- **Support knowledge base**: Answers to previously resolved questions are stored and surfaced automatically when similar questions arise in the future.
- **Compliance and audit**: The agent retrieves the exact policy text needed to justify or explain a decision, making its reasoning traceable.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
