# AI Agent connector — Concepts — System prompt, user prompt, and tool descriptions

Reliable agent behavior depends on three inputs working together:

- **System prompt**: Defines the agent's role, boundaries, priorities, and success criteria.
- **User prompt**: Carries the current request and immediate context.
- **Tool/task descriptions**: Define which actions are available in the ad-hoc sub-process and how each should be used.

At runtime, the connector passes this combined context to the LLM. The model then selects which tools to call (if any), along with parameters.

#### How task descriptions are used for tools

When using an ad-hoc sub-process, each activity can be exposed as a tool. For best results, document each tool with:

- A clear task name that describes intent.
- A behavior-oriented description that includes when to use it, when not to use it, and the expected outcome.

This makes tool selection more predictable and reduces repeated or incorrect calls.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
