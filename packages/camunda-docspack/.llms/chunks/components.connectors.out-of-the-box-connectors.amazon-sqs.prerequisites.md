# Amazon Simple Queue Service connector — Prerequisites

Before using the Amazon SQS inbound connector, ensure you have the following:

1. An active SQS Queue in your AWS account.
2. IAM credentials with the necessary permissions to receive messages from the SQS Queue. Use secrets to store your AWS IAM credentials securely. Refer to the [secrets documentation](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) for more details.


## Create an SQS inbound connector task

To receive messages from Amazon SQS in your process, follow these steps:

1. Start building your BPMN diagram. You can use the **Amazon SNS Inbound connector** with either **Start Event** or **Intermediate Catch Event** building blocks.
2. Select the appropriate element and change its template to an SQS inbound connector.
3. Fill in all the required properties for the connector, such as the AWS region, SQS Queue URL, and the visibility timeout.
4. Complete your BPMN diagram by adding other necessary elements and connectors.
5. Deploy the diagram to activate the SQS Inbound connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
