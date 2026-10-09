# AI Agent connector — Concepts — Execution responsibility split

The decision and execution loop is shared between the LLM and Camunda:

- **LLM decides**: Which tool to call next, in what order, and with which parameters.
- **Camunda orchestrates**: Executes the selected BPMN activity, stores variables, applies retries and incident handling, and routes human tasks and events.

This means tools can be called in different orders, repeated, run in parallel, or skipped entirely, while execution remains constrained by the modeled process boundaries.

**Tip**
For a broader overview of how execution works in an AI agent and architectural guidance, see [Design and architecture](https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture#how-execution-works-in-an-ai-agent).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
