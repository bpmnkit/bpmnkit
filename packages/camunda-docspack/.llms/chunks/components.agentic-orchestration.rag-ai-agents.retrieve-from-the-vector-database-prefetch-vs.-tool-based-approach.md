# Add long-term memory to your AI agents — Retrieve from the vector database — Prefetch vs. tool-based approach

| Consideration      | Prefetch                                             | Tool-based retrieval                                       |
| ------------------ | ---------------------------------------------------- | ---------------------------------------------------------- |
| **Agent autonomy** | Agent does not choose when to search                 | Agent decides if and when to search                        |
| **Latency**        | Retrieval runs once before the agent starts          | Retrieval adds a tool-call round trip                      |
| **Query control**  | Uses the raw user query directly                     | LLM reformulates the query dynamically                     |
| **Relevance**      | Best when the user query maps well to stored content | Best when the agent needs to refine or decompose the query |

**Tip**
You can combine both patterns: prefetch broad context to prime the agent, and still expose a retrieval tool for follow-up searches the agent initiates on its own.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
