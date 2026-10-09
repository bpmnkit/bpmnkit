# Amazon Bedrock AgentCore Runtime connector

Invoke external agents deployed on AWS Bedrock AgentCore Runtime from your BPMN process.

With the **Amazon Bedrock AgentCore Runtime** outbound connector, you can invoke external agents deployed on [Amazon Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html) from your BPMN process.

Use this connector to delegate complex reasoning tasks to specialized AI agents hosted on AWS, such as fraud detection, risk analysis, or document processing agents built with frameworks like Strands, LangGraph, or CrewAI.


## Prerequisites

To use the **Amazon Bedrock AgentCore Runtime connector**, you need the following:

- An AWS account with an access key and secret key, or a configured default credentials chain.
- An agent deployed to [AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-getting-started.html) in an `ACTIVE` state.
- IAM permissions to execute the `InvokeAgentRuntime` action on the agent's ARN.

Learn more about AgentCore Runtime in the [official documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html).

**Note**
Use secrets to store credentials and avoid exposing sensitive information directly from the process. Refer to [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-agentcore-runtime
