# Inbound connector deduplication — How to choose a deduplication ID

A deduplication ID can contain alphanumeric characters, dashes, and underscores. We recommend using a descriptive ID that reflects the deduplication group’s purpose, for example, `payment-outcome-event-consumer`.


## Limitations of deduplication

While deduplication is a powerful tool that can optimize the execution of your BPMN process, it has some limitations. It is important to understand them to avoid unexpected behavior.

1. **Deduplication ID scope** – The deduplication ID is scoped to a single process definition across all its versions. You can’t deduplicate connectors across different process definitions.
2. **Connector type** – Connectors of different types can’t share the same deduplication ID (for example, a Webhook connector and a Message Queue connector).
3. **Connector properties** – Connectors that share the same deduplication ID must use the same business-logic properties. This means they must have the same **Webhook ID**, **Server URL**, **Authentication properties**, and so on, depending on the connector type.
4. **Activation condition** – Connectors with the same deduplication ID must have mutually exclusive activation conditions. If multiple connectors can evaluate to true for the same message, the connector runtime can’t determine which connector to trigger and returns an error.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication
