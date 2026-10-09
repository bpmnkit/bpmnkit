# Add long-term memory to your AI agents — Retrieve from the vector database — Pass retrieved context to the agent

Once the retrieval task completes, include its results in the AI Agent's user message. There are two approaches:

#### Concatenate as text

Build the user message by appending the retrieved text to the original query:

```feel
userQuery + "

Use the following context to inform your answer:
" + " ".join(retrievalResult.searchResult)
```

This works well when the retrieved content is short and you want the agent to treat it as inline context.

#### Attach as documents

If the Vector Database connector returns structured document objects, you can add them to the user message's document list. This keeps the user query and the supporting documents separate, which can help the LLM distinguish between the question and the reference material.

Refer to the [AI Agent connector documentation](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent) for details on how to structure the message input with documents.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
