# Kafka connector — Configure your Kafka Consumer connector — Activation condition

**Activation condition** is an optional FEEL expression field that allows for the fine-tuning of the connector activation. This condition filters if the process step triggers when a Kafka message is consumed.

For example, `=(value.itemId = "a4f6j2")` only triggers the start event or continues the catch event if the Kafka message has a matching itemId in the incoming message payload. Leave this field empty to trigger your process every time.

**Danger**
By default, this connector does not commit the offset if the message cannot be processed. This includes cases where the activation condition is not met.
This means that if there is a message in the topic that cannot be processed due to an activation condition mismatch, the Kafka subscription will be stopped.

Follow the steps below to configure this behavior.

To ignore messages that do not meet the activation condition and commit the offset, select the **Consume unmatched events** checkbox.

| **Consume unmatched events** checkbox | Activation condition | Outcome                                              |
| ------------------------------------- | -------------------- | ---------------------------------------------------- |
| Checked                               | Matched              | connector is triggered, offsets are commited         |
| Unchecked                             | Matched              | connector is triggered, offsets are commited         |
| Checked                               | Unmatched            | connector is not triggered, offsets are commited     |
| Unchecked                             | Unmatched            | connector is not triggered, offsets are not commited |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
