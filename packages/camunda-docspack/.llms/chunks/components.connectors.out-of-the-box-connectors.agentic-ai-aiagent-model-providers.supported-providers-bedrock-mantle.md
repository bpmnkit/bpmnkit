# AI Agent model providers — Supported providers — bedrock-mantle

Run Anthropic Claude models hosted on Amazon Bedrock while keeping access to Anthropic-specific configuration (reasoning/extended thinking, prompt caching) that the generic [AWS Bedrock Converse](#aws-bedrock-converse) provider doesn't expose.

| Field               | Required | Description                                                                                                                                                                                                                                                                                                          |
| :------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AWS region**      | Yes      | The AWS region. For example, `eu-west-1`.                                                                                                                                                                                                                                                                            |
| **Custom endpoint** | No       | Custom API endpoint for VPC/PrivateLink configurations or other non-standard deployments. Must be the full Bedrock Mantle base URL, including the `/anthropic` path segment (for example, `https://your-vpce-host/anthropic`). It replaces the default `https://bedrock-mantle.<region>.api.aws/anthropic` verbatim. |
| **Authentication**  | Yes      | Select the authentication method used to authenticate with AWS: **Credentials** (access key/secret key), **API key**, or **Default Credentials Chain** (Hybrid/Self-Managed only). See [Amazon Bedrock connector authentication](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock#authentication) for details on each method.                     |

Bedrock Mantle supports a different set of models than Bedrock Runtime, and model availability also varies by AWS Region. Before selecting a model, check [Amazon Bedrock endpoint availability](https://docs.aws.amazon.com/bedrock/latest/userguide/models-endpoint-availability.html) and the linked model details for current endpoint and regional support.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
