# Kafka connector — Configure your Kafka Consumer connector — Kafka properties

In the **Kafka** section, you can configure the following properties:

- **Consumer Group ID**: Set the consumer group ID for this connector. Always provide an explicit, stable value that identifies the logical consumer group (for example, `my-app-order-processor`). If you leave this field empty, the connector auto-generates an ID from its internal deduplication key. That generated ID can change across connector upgrades, including from 8.8 to 8.9, causing Kafka to treat the connector as a new consumer group and potentially replay already processed messages.
- **Schema strategy**: Select the schema strategy for your messages.
  - Select **No schema**, **Inline schema** for Avro serialization.
  - Select **Schema registry** If you have a Confluent Schema Registry.
- **Bootstrap servers**: Set the URL of the bootstrap server(s). If more than one server is required, use comma-separated values.
- **Topic**: Set the topic name.
- **Additional properties**: Set consumer configuration values.
- **Offsets**: Set the offsets for the partition. The number of offsets specified should match the number of partitions on the current topic.
- **Auto offset reset**: Set the strategy to use when there is no initial offset in Kafka or if the specified offsets do not exist on the server.

**Info**

The [appendix](#appendix-and-faq-1) provides more information about [pre-configured consumer configuration values](#what-are-default-kafka-consumer-client-properties) for this connector.

Additionally, to learn more about supported consumer configurations, see the [official Kafka documentation](https://kafka.apache.org/41/configuration/consumer-configs/).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
