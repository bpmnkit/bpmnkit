# Kafka connector — Configure your Kafka Consumer connector — Deduplication

The **Deduplication** section allows you to configure the connector deduplication parameters.

**Connector deduplication** is a mechanism in the connector Runtime that determines how many Kafka subscriptions are created if there are multiple occurrences of the **Kafka Consumer connector** in the BPMN diagram. This is not to be confused with **message deduplication**.

By default, the connector runtime deduplicates connectors based on properties, so that elements with the same subscription properties only result in one subscription.

**Info**
To learn more about deduplication, see [deduplication](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication).

To customize the deduplication behavior, select the **Manual mode** checkbox, and configure the custom deduplication ID.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
