# Test your AI agents with CPT

Test your AI agent processes in Camunda 8 with Camunda Process Test (CPT).

Test your AI agent processes in Camunda 8 with [Camunda Process Test (CPT)](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started).


## About

AI agent processes are non-deterministic: the [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) inside an [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) decides at runtime which tools to invoke and in what order, and its free-text output varies across runs.

In this guide, you will build integration tests that keep the AI agent and LLM interaction real while mocking external tool executions, using the following CPT features:

- [Conditional behavior](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#conditional-behavior): Reacts to whichever tasks the agent activates, instead of blocking on a single hard-coded execution order. This addresses non-deterministic control flow.
- [Judge](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariablesatisfiesjudge) and [semantic similarity assertions](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariablesimilarto): Verify AI-generated output.

After completing this guide, you will be able to test your AI agents using CPT.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
