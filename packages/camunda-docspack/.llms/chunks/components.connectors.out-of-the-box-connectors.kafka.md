# Kafka connector

The Kafka Producer connector allows you to connect your BPMN service with Kafka. Learn how to create a Kafka Producer connector and make it executable.


## Reuse a Kafka connection

Use a **Kafka Connection** credential to share broker and authentication settings between Kafka producer and Kafka consumer connectors.

Reusable credentials require Camunda 8.10 or later and a Kafka element template with the optional **Connection credential** chooser in the **Connection** section. Select the same credential on producer tasks and consumer events, or leave **Connection credential** empty to keep configuring brokers and authentication inline in the **Connection** section.

A Kafka Connection credential stores these required fields:

| Field              | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| `bootstrapServers` | Bootstrap server addresses, separated by commas when you use more than one server. |
| `username`         | Kafka username. For a secret reference, use `camunda.secrets.MY_KAFKA_USERNAME`.   |
| `password`         | Kafka password. For a secret reference, use `camunda.secrets.MY_KAFKA_PASSWORD`.   |

Create referenced secrets before using the credential. Inside a credential, use `camunda.secrets.NAME`, not the legacy `{{secrets.NAME}}` syntax. Legacy secret references remain supported in inline connector fields.

Selecting a credential binds the whole object to `kafkaConnectionConfiguration` using `=camunda.vars.env.<name>`, where `<name>` is the credential's cluster variable name. The credential supplies authentication using `SASL_SSL` with the `PLAIN` mechanism. Keep custom authentication configured inline.

The selected credential replaces inline broker and authentication settings. An invalid credential fails execution or consumer activation; the connector doesn't fall back to inline values. Topic, consumer group, offsets, schema settings, and message configuration remain local to each task or event.

**Warning**
**Additional properties** still overrides the final connection and security properties, including `bootstrap.servers`. Selecting a credential doesn't restrict the destination or prevent these overrides.

### Test a Kafka connection

**Test connection** performs a read-only Kafka metadata probe to check connectivity and authentication, using the connector runtime's trust configuration. It uses bounded timeouts and reports a failure if the connection can't be established.

The result applies only to the stored credential, not to **Additional properties** overrides configured on a task or event.

The test doesn't publish or consume messages, join a consumer group, or change offsets. Success doesn't verify topic, consumer group, publishing, or consumption permissions.

Updating a credential follows the existing consumer activation and reload lifecycle. Don't rely on credential edits automatically rotating the connection of an already-running consumer.

The **Kafka Producer connector** is an outbound connector that allows you to connect your BPMN service with [Apache Kafka](https://kafka.apache.org/) to produce messages.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
