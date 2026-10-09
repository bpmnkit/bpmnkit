# Ad-hoc Tools Schema Resolver connector

Resolve an input schema used in combination with LLMs for activities defined within an ad-hoc sub-process.

The **Ad-hoc Tools Schema connector** is an outbound connector that implements the tool resolution part of
the [**AI Agent connector**](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent).


## About this connector

Although its function is also embedded in the AI Agent connector, the Ad-hoc Tools Schema connector can be used independently in combination with other AI connectors.

This can be useful for:

- **Direct LLM interaction**: If you don't want to use the AI Agent connector but still want to resolve tools
  for an ad-hoc sub-process, use the `fromAi` function to define the input schema in combination with custom LLM
  integrations.
- **Debugging tool definitions**: If you want to test the tool resolution logic without having to set up a full AI Agent
  connector, you can use this connector to get the tool definitions and see how they are generated.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-ahsp-tools-schema-resolver
