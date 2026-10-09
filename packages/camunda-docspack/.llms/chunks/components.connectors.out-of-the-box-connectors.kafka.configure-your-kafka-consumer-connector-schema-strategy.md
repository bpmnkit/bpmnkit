# Kafka connector — Configure your Kafka Consumer connector — Schema strategy

#### No schema

Select **No schema** to send messages without a schema. This option is suitable for simple messages that don’t require a schema.

#### Inline schema

Select **Inline schema** to send messages with an **Avro schema**.

- This option is appropriate for messages that require a schema but are not (or do not need to be) registered in a schema registry.
- Enter the Avro schema that defines the message structure into the **Schema** field in the **Message** section.

#### Schema registry

Select **Schema registry** to send messages using a schema registered in a schema registry.

- This option is appropriate for messages that require a schema and are registered in a [schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html).
- You must provide:
  - The **schema registry URL** in the **Kafka** section.
  - The **schema** itself (defining the message structure) in the **Message** section.
  - The **credentials** for the schema registry, if required. See the [Schema Registry documentation](https://docs.confluent.io/platform/current/schema-registry/sr-client-configs.html#basic-auth-credentials-source) for more details.

**Info**

Currently, the Kafka connector supports only the [Confluent Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html). Other schema registry implementations are not supported at this time.

Schema configuration is required only for the outbound connector. It is not required when using Inbound Connectors.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
