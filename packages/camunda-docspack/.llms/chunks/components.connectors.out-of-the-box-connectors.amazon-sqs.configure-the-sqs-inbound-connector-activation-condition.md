# Amazon Simple Queue Service connector — Configure the SQS inbound connector — Activation condition

**Activation condition** is an optional FEEL expression field that allows for fine-tuning of the connector activation.
For example, if an external message has the body `{"messageId": 1, "body": "Hi team", "messageAttributes":{"key":{"stringValue":"value"}}...}`, the **Activation Condition** value might look like `=(messageAttributes.key.stringValue="value")`. Leave this field empty to receive all messages every time.

By default, messages with unmatched activation conditions are not deleted from the queue. They become available for consumers again after the visibility timeout expires. You can set up a dead-letter queue where messages are forwarded after a certain number of delivery attempts.

You can also configure the Amazon SQS inbound connector to delete messages from the queue if they don't match the activation condition. In this case, the message will not end up in the dead-letter queue.
To delete messages that don't match the activation condition, check the **Consume unmatched events** box.

| **Consume unmatched events** box | Activation condition | Outcome                                                                                          |
| -------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| Checked                          | Matched              | Message is removed from the queue                                                                |
| Unchecked                        | Matched              | Message is removed from the queue                                                                |
| Checked                          | Unmatched            | Message is removed from the queue                                                                |
| Unchecked                        | Unmatched            | Message is not removed from the queue and will be redelivered or placed in the dead-letter queue |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
