# Design and architecture — Design agent orchestration workflows — How execution works in an AI agent

In Camunda agentic orchestration, decision-making and orchestration are intentionally split:

- **LLM responsibility**: Interprets the system prompt, current user prompt, and available tool descriptions. It decides which tool to call, in what order, and with which parameters.
- **Camunda responsibility**: Executes the selected BPMN elements, stores process state, applies retries and incident handling, and coordinates user tasks and other deterministic workflow logic.

Think of the ad-hoc sub-process as a governed toolbox:

- Each element can be selected by the LLM as a tool.
- Elements can be executed multiple times, in different orders, in parallel, or skipped.
- The LLM chooses a path from the allowed options, while Camunda enforces process boundaries and execution reliability.

This is a typical execution timeline:

1. A user submits a prompt.
1. The LLM evaluates the prompt together with the configured system prompt and available tool definitions.
1. The LLM chooses one or more tool calls.
1. Camunda activates and executes the corresponding BPMN elements.
1. Results are written to process variables and returned to the LLM context.
1. The loop repeats until the LLM returns a final response or the process routes to deterministic follow-up steps.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture
