# Kafka connector — Configure your Kafka Consumer connector — Modify an existing inbound Kafka connector

Editing the **Consumer Group ID** or **Offsets** properties on an already deployed inbound Kafka connector element can cause unexpected behavior. Delete the element and create a new one instead of editing these properties in place.

- **Consumer Group ID**: If you clear this field on an existing element, the connector generates a new ID from its internal deduplication key instead of reusing the previous one. Kafka then treats the connector as a new consumer group, which can cause it to replay already processed messages.
- **Offsets**: If the number of offsets you provide does not match the topic's actual partition count, activation fails with an error.

This is one example of a general pattern for inbound connectors. See [modify an existing inbound connector element](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle#modify-an-existing-inbound-connector-element) for more details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
