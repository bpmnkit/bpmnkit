# AI agent tool definitions — Message catch events as tools

You can use an intermediate message catch event inside an ad-hoc sub-process as a tool. For example, to model a "wait for reply" step where the agent sends a message to an external system and waits for a response before continuing.

When using this pattern, each process instance opens a message subscription. If multiple instances run concurrently, and they all subscribe with the same message name and correlation key, Zeebe delivers the reply to one instance non-deterministically. The wrong instance may receive the reply, and there is no warning when this happens.

To avoid this, use a [unique correlation key per interaction](https://docs.camunda.io/docs/next/components/concepts/messages#request-reply-with-unique-correlation-key).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
