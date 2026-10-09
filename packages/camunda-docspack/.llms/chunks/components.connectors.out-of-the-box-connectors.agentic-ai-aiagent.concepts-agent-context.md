# AI Agent connector — Concepts — Agent context

An important concept to understand is the use of the **Agent context** process variable to store information required for allowing re-entry to the AI Agent connector task with the same context as before.

Depending on which implementation type is used, the Agent context must be configured differently in the model:

- [**AI Agent Sub-process**](#ai-agent-sub-process): The agent context is kept within the sub-process scope. This means you only need to configure the agent context when the agent should pick up an existing conversation, for example to model a [human-in-the-loop (HITL)](https://docs.camunda.io/docs/next/reference/glossary#human-in-the-loop-hitl) follow-up as in the [quickstart example](https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration). In this case, you must align the configured agent context variable with the used result variable/expression so that the context update is correctly passed to the next execution of the AI Agent connector task.

- [**AI Agent Task**](#ai-agent-task): You must align the agent context input variable and the response variable/expression so the context update is correctly passed to the next execution of the AI Agent connector task.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
