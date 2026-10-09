# Amazon Simple Notification Service connector

Publish messages to Amazon Simple Notification Service (SNS) from your BPMN process.

The **Amazon Simple Notification Service (SNS)** connector is an outbound connector that allows you to connect your BPMN service with [Amazon Simple Notification Service (SNS)](https://aws.amazon.com/sns/) to send messages.


## Prerequisites

To use the **Amazon SNS connector**, you need to have an SNS Topic, IAM key, and secret pair with the `sns:Publish` policy relative to your SNS.

**Note**
Use secrets to avoid exposing your AWS IAM credentials as plain text. Refer to our [appendix entry](#how-do-i-store-aws-iam-secrets-for-my-sns-connector) and the [SNS Developer Guide](https://docs.aws.amazon.com/sns/latest/dg/sns-using-identity-based-policies.html#sns-policy-keys) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sns
