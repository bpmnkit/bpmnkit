# Amazon Bedrock Knowledge Base connector

Perform semantic search over documents indexed in an Amazon Bedrock Knowledge Base from your BPMN process.

With the **Amazon Bedrock Knowledge Base** outbound connector, you can perform semantic search over documents indexed in an [Amazon Bedrock Knowledge Base](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html) from your BPMN process.


## Prerequisites

To use the **Amazon Bedrock Knowledge Base connector**, you need the following:

- An AWS account with an access key and secret key, or a configured default credentials chain.
- A [Bedrock Knowledge Base](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-create.html) created and configured with at least one data source.
- IAM permissions to execute the [`Retrieve`](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_Retrieve.html) action on the knowledge base.

Learn more about Amazon Bedrock Knowledge Bases in the [official documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html).

**Note**
Use secrets to store credentials and avoid exposing sensitive information directly from the process. Refer to [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-knowledgebase
