# LLM recommendations for agentic processes — Prompting recommendations — Define when and how the agent should seek user input

In your system or prompt instructions, make it clear when the AI should involve a human. For example, you could say, “If the user’s request is unclear or more information is needed, the assistant should ask a follow-up question via the customer communication tool.”

Decide which points in the process need user feedback, such as after showing an intermediate result or when the AI is unsure about a critical decision. Specify this in the prompt so the model knows it is acceptable or expected to ask for clarification.

The instructions should also guide the AI on using the human feedback tool. For example, “Before finalizing an answer, if confidence is low, call the `ask_human` tool to confirm the details.” Being explicit helps the agent make better decisions.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
