# Amazon Simple Notification Service connector — Security considerations

### Access control

The field **Allow to receive messages from topic(s)** and related **Topic ARN(s)** allows you to control which Amazon SNS topics can trigger a BPMN process.
You can also achieve the same outcome by specifying **Condition** in the **Activation** section. For example, given **Topic ARN(s)** equals `arn:aws:sns:eu-central-1:1234567890:SNSWebhook`,
is the same as **Condition** equals `=(request.body.TopicArn = "arn:aws:sns:eu-central-1:1234567890:SNSWebhook")`.

### Integrity

Each Amazon SNS message is digitally signed with an AWS private key. The body of a message contains a digital signature of
the entire content. The **Amazon Simple Notification Service (SNS) Inbound connector** verifies every message against
the Amazon SNS public certificate to ensure the message is of known origin and has not been tampered with.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sns
