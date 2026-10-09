# Agent definitions and instances — Agent definitions — Reuse an agent across processes

To reuse the same agent across multiple process definitions, use a [call activity](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities/call-activities). Place the agent in one process definition and call it from the [parent process instances](https://docs.camunda.io/docs/next/reference/glossary#parent-process-instance). This produces a single agent definition for the reused agent, so its metrics aggregate into one registry entry.

Duplicating the same BPMN element directly across several process definitions creates a separate agent definition for each copy, with no cross-definition aggregation.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
