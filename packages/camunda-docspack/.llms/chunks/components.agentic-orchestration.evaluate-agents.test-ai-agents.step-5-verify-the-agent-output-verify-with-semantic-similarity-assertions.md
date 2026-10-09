# Test your AI agents with CPT — Step 5: Verify the agent output — Verify with semantic similarity assertions

Use a semantic similarity assertion to verify the agent output.
Semantic similarity assertions are a deterministic, lower-cost alternative to [judge assertions](#step-5-verify-with-judge-assertions).

Instead of calling a judge LLM at assertion time, they convert both the actual variable value and the expected text to vector embeddings and compare them using cosine similarity.
They work best when you can express the expected result as a concrete sample string.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
