# Glossary — E — External agent

The non-native [AI agent](#ai-agent) type. Tool orchestration runs in an external runtime, such as LangGraph, Amazon Bedrock, or custom code, instead of Camunda's engine, where the loop itself lives outside Camunda.

Camunda orchestrates when and how the agent acts within the broader process, and observes its execution through the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api), even though it does not execute the agent's reasoning loop itself. The process record, governance, and audit trail for that participation live in Camunda.

**Note**
This is different from a [Camunda AI agent](#camunda-ai-agent), which is Camunda's native AI agent type.

---
Source: https://docs.camunda.io/docs/next/reference/glossary
