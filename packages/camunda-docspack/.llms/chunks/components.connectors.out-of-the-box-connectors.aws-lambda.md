# AWS Lambda connector

Invoke AWS Lambda functions with an outbound connector.

The **AWS Lambda connector** is an outbound connector that allows you to connect your BPMN service with Amazon Web Service's [AWS Lambda Service](https://aws.amazon.com/lambda/) to invoke [AWS Lambda functions](https://aws.amazon.com/lambda/).


## Prerequisites

To use an **AWS Lambda connector**, you need to have an [AWS Lambda Function](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html), IAM key, and secret pair with permissions for execute function. Refer to the [AWS Lambda developer guide](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html) to learn more.

**Note**
Use secrets to avoid exposing your AWS IAM credentials as plain text. Refer to [managing secrets](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/aws-lambda
