# LLM recommendations for agentic processes — General recommendations for agentic processes — Sanitize tool outputs

Sanitizing ensures the agent doesn’t accidentally get confused or manipulated by malformed tool data, and also reduces the risk of prompt injections coming from external tool results:

- Always clean and validate the output from tools before the AI agent uses it in a prompt, by removing any irrelevant, sensitive, or potentially prompt-breaking content. This is important for both security and prompt clarity.
- For example, if a web search tool returns HTML or script tags, strip those out or convert them to plain text.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
