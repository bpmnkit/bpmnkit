# Amazon Simple Queue Service connector

Send messages to Amazon Simple Queue Service (SQS) from your BPMN process.

The **Amazon SQS connector** is an outbound connector that allows you to connect your BPMN service with [Amazon Simple Queue Service (SQS)](https://aws.amazon.com/sqs/) to send messages.


## Prerequisites

To use the **Amazon SQS connector**, you need to have an SQS Queue, IAM key, and secret pair with the `sqs:SendMessage` policy relative to your SQS.

**Note**

Use secrets to avoid exposing your AWS IAM credentials as plain text. Refer to an [appendix entry](#how-do-i-store-aws-iam-secrets-for-my-sqs-connector) and the [SQS Developer Guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-examples-of-iam-policies.html) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
