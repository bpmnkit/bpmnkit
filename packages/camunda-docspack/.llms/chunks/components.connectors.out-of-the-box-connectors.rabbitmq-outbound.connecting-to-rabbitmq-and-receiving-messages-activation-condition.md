# RabbitMQ connector — Connecting to RabbitMQ and receiving messages — Activation condition

**Activation condition** is an optional FEEL expression field that allows for fine-tuning of the connector activation.
For example, given a RabbitMQ message contains the payload `{"role": "USER", "action": "LOGIN""}`, the **Activation Condition** value might look like `=(message.body.role="USER")`.
This way, the connector is triggered only if the message body contains the `role` field with the value `USER`. Leave this field empty to trigger your connector for every incoming message.

By default, messages with unmatched activation conditions are rejected without re-queuing. You can set up a dead-letter queue in RabbitMQ to handle these messages. Learn more about dead-letter queues in the [RabbitMQ documentation](https://www.rabbitmq.com/dlx.html).

You can also configure the RabbitMQ inbound connector to acknowledge messages that don't match the activation condition. In this case, the message will not end up in the dead-letter queue, but will be acknowledged and removed from the queue.
To acknowledge messages that don't match the activation condition, check the **Consume unmatched events** checkbox.

| **Consume unmatched events** checkbox | Activation condition | Outcome                                            |
| ------------------------------------- | -------------------- | -------------------------------------------------- |
| Checked                               | Matched              | Message is acknowledged and removed from the queue |
| Unchecked                             | Matched              | Message is acknowledged and removed from the queue |
| Checked                               | Unmatched            | Message is acknowledged and removed from the queue |
| Unchecked                             | Unmatched            | Message is rejected and re-queued                  |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
