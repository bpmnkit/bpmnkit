# Amazon Simple Queue Service connector — Amazon SQS connector response

The **Amazon SQS connector** returns the SQS message identifier of a newly created message.
The response contains a `messageId` variable.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. For example:

```
= {
  "createdMessageID": response.messageId
}
```


## Appendix & FAQ

### What are the message attributes and how can I set them?

Amazon SQS lets you include structured metadata (such as timestamps, geospatial data, signatures, and identifiers) with messages using message attributes.
The **Amazon SQS connector** allows you to include non-binary message attributes in the section **Input message data**. The message attribute value must be composed to be compliant with Amazon SQS [message attribute data format](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-message-metadata.html#sqs-message-attributes).

Example of a valid message attribute as a FEEL value:

```
= {
  "timestamp":{
    "StringValue":today(),
    "DataType":"String"
  },
  "messageSubmittedBy":{
    "StringValue":"user12345",
    "DataType":"String"
  }
}
```

### How do I store AWS IAM Secrets for my SQS connector?

Store your AWS IAM credentials as secrets to avoid exposing sensitive information. Follow our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

### AWS authentication types

There are two options to authenticate the connector with AWS:

- Choose **Credentials** in the **Authentication** dropdown if you have a valid pair of access and secret keys provided by your AWS account administrator. This option is applicable for both SaaS and Self-Managed users.
- Choose **Default Credentials Chain (Hybrid/Self-Managed only)** in the **Authentication** dropdown if your system is configured as an implicit authentication mechanism, such as role-based authentication, credentials supplied via environment variables, or files on target host. This option is applicable only for Self-Managed or hybrid distribution. This approach uses the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html) to resolve required credentials.

The **Amazon SQS Inbound connector** is an inbound connector that allows you to start or continue
a BPMN process triggered by [Amazon Simple Queue Service (SQS)](https://aws.amazon.com/sqs/).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
