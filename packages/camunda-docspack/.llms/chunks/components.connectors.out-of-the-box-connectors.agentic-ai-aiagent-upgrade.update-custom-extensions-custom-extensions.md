# Upgrade AI Agent element templates — Update custom extensions {#custom-extensions}

If you extend the AI Agent connector in a Self-Managed or hybrid deployment, for example with a custom conversation store or chat model, the Java APIs also changed in Camunda 8.10. See the [breaking changes for custom extensions](https://github.com/camunda/connectors/blob/main/connectors/agentic-ai/docs/breaking-changes.md).


## Model provider configuration mapping

Model provider configuration changed the most in this redesign, since providers and backends are now decoupled (see [choose a provider and backend](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#choose-a-provider-and-backend)).
The sections below cover only the fields that changed, comparing legacy and new template fields. Any fields not mentioned carry over unchanged under the same field label.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
