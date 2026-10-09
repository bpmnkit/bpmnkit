# Amazon S3 connector

Interact with Amazon S3 services from your BPMN process.

The **Amazon S3 connector** is an outbound connector that allows you to interact
with [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/S3/) from your BPMN process.


## Prerequisites

To use the **Amazon S3 connector**, you will need an AWS account with an access key and secret key.

The key will need the following permissions:

- `GetObject`
- `DeleteObject`
- `PutObject`

Learn more about Amazon S3 in the [Amazon Simple Storage Service Documentation](https://docs.aws.amazon.com/s3/).

**Note**
Use secrets to store credentials and avoid exposing sensitive information from the process.
See [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-s3
