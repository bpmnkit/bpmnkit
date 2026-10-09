# Amazon Bedrock Code Interpreter connector

Execute Python code in a secure AWS Bedrock AgentCore sandbox from your BPMN process.

With the **Amazon Bedrock Code Interpreter** outbound connector, you can execute Python code in a secure [Amazon Bedrock AgentCore Code Interpreter](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/code-interpreter-tool.html) sandbox from your BPMN process.


## Prerequisites

To use the **Amazon Bedrock Code Interpreter connector**, you need the following:

- An AWS account with an access key and secret key, or a configured default credentials chain.
- IAM permissions to execute the following actions on the `bedrock-agentcore` service:
  - `StartCodeInterpreterSession`
  - `InvokeCodeInterpreter`
  - `StopCodeInterpreterSession`
- The AgentCore Code Interpreter service must be available in your selected AWS region.

Learn more about the AgentCore Code Interpreter in the [official documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/code-interpreter-tool.html).

**Note**
Use secrets to store credentials and avoid exposing sensitive information directly from the process. Refer to [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-codeinterpreter
