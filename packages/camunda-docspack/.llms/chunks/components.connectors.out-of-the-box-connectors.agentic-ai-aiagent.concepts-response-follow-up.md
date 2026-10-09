# AI Agent connector — Concepts — Response follow-up

Separately from the agent loop's own tool calling, the AI Agent connector's response can also be reviewed before the process continues: the process routes the agent's response to a task, such as a user task or another LLM acting as a judge, and can be modeled to loop back and re-enter the agent with a follow-up request. When that reviewing task is a person, this is an example of [human-in-the-loop (HITL)](https://docs.camunda.io/docs/next/reference/glossary#human-in-the-loop-hitl). This pattern is distinct from the agent loop itself, which is the LLM's internal tool-calling cycle rather than an external re-invocation of the process.

For a worked example, see [AI Agent Sub-process](#ai-agent-sub-process) or [AI Agent Task](#ai-agent-task) above.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
