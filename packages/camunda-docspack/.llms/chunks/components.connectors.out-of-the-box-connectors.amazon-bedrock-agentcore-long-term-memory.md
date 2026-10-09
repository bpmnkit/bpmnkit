# Amazon Bedrock AgentCore Long-Term Memory connector

Retrieve persistent knowledge from AWS Bedrock AgentCore Long-Term Memory in your BPMN process.

With the **Amazon Bedrock AgentCore Long-Term Memory** outbound connector, you can retrieve persistent knowledge, such as facts, preferences, and summaries, from [AWS Bedrock AgentCore Long-Term Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/long-term-memory-long-term.html) in your BPMN process.


## Prerequisites

To use the **Amazon Bedrock AgentCore Long-Term Memory connector**, you need the following:

- An AWS account with an access key and secret key, or a configured default credentials chain.
- An [AgentCore Memory resource](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/long-term-memory-create.html) created in your AWS account.
- IAM permissions to execute the `RetrieveMemoryRecords` and `ListMemoryRecords` actions.

Learn more about Amazon Bedrock AgentCore Long-Term Memory in the [official documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/long-term-memory-long-term.html).

**Note**
Use secrets to store credentials and avoid exposing sensitive information directly from the process. Refer to [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-agentcore-long-term-memory
