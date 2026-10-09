# Kafka connector — Schema strategies

**Caution**
Use Schema strategies with caution, as this is an [alpha feature](https://docs.camunda.io/docs/next/components/early-access/alpha/alpha-features). Functionality may not be comprehensive and could change.

This connector supports different schema strategies, offering a compact, fast, and binary data exchange format for Kafka messages.

When using a schema strategy, each message is serialized according to a specific schema written in JSON format. This schema defines the Kafka message structure, ensuring the data conforms to a predefined format, and enables schema evolution strategies.

**Info**

To learn more about Schema strategies, refer to the official documentation:

- [Inline Avro serialization](https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/serdes-avro.html) and [official Apache Avro documentation](https://avro.apache.org/docs/).
- [Confluent Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html) (Avro, and JSON schemas).

### No schema

Select **No schema** to send messages without a schema. This option is suitable for simple messages that do not require a schema.

### Inline schema

Select **Inline schema** to send messages with an **Avro schema**.

- This option is suitable for messages that require a schema and that are not (or do not need to be) registered in a schema registry.
- Enter the Avro schema that defines the message structure into the **Schema** field that appears in the **Message** section.

### Schema registry

Select **Schema registry** to send messages with a schema registered in a schema registry.

- This option is suitable for messages that require a schema and that are registered in a [schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html).
- You must provide:
  - The **schema registry URL** in the **Kafka** section.
  - The **schema** itself (that defines the message structure) in the **Message** section.
  - The **credentials** for the schema registry (if required). Refer to the [Schema Registry documentation](https://docs.confluent.io/platform/current/schema-registry/sr-client-configs.html#basic-auth-credentials-source) for more information.

**Info**

Currently, the Kafka connector supports only [Confluent Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html). Other schema registry implementations are not supported at this time.

### Example Avro schema and data

The following is an example Avro schema and data:

#### Avro schema:

```json
{
  "doc": "Sample schema to help you get started.",
  "fields": [
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "age",
      "type": "int"
    },
    {
      "name": "emails",
      "type": {
        "items": "string",
        "type": "array"
      }
    }
  ],
  "name": "sampleRecord",
  "namespace": "com.mycorp.mynamespace",
  "type": "record"
}
```

#### Kafka message

- **Key**: `employee1`
- **Value**:

  ```json
  {
    "name": "John Doe",
    "age": 29,
    "emails": ["johndoe@example.com"]
  }
  ```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
