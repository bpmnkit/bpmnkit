# Kafka connector — Make your Kafka Producer connector for publishing messages executable

To make your **Kafka Producer connector** for publishing messages executable, complete the following sections.

### Authentication

(Optional) Set the relevant credentials in the **Authentication** section. For example, `{{secrets.MY_KAFKA_USERNAME}}`.

### Schema

In the **Kafka** section:

1. Select the schema strategy for your messages.
   - Select **No schema**, **Inline schema** for Avro serialization.
   - Select **Schema registry** if you have a Confluent Schema Registry.
2. Set the URL of the bootstrap server(s). If more than one server is required, use comma-separated values.
3. Set the topic name.
4. (Optional) Set producer configuration values in the **Headers** field. Only `UTF-8` strings are supported as header values.
5. (Optional) Set producer configuration values in the **Additional properties** field.

**Info**

The [appendix](#appendix-and-faq) provides more information about:

- [Kafka secure authentication](#what-mechanism-is-used-to-authenticate-against-kafka).
- [Inline schema](#inline-schema) and [Schema registry](#schema-registry).
- [Pre-configured producer configuration values](#what-are-default-kafka-producer-client-properties) for this connector.

Additionally, to learn more about supported producer configurations, see the [official Kafka documentation](https://kafka.apache.org/41/configuration/producer-configs/).

### Message

In the **Message** section, set the **Key** and the **Value** that will be sent to Kafka topic.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
