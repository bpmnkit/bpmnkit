# AI Agent model providers — Supported providers — AWS Bedrock Converse

Select this provider to use a model provided by the [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) service through the generic [Converse](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html) API.

**Tip**
This is the right choice for non-Anthropic model families available on Bedrock. For example, Amazon Nova, Meta Llama, or Mistral models. If you're running **Anthropic Claude** models on Bedrock, use the [Anthropic provider](#anthropic)'s AWS Bedrock Mantle backend to access Anthropic-specific configuration.

| Field               | Required | Description                                                                                                                                                                                                                                                                                      |
| :------------------ | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AWS region**      | Yes      | The AWS region. For example, `eu-west-1`.                                                                                                                                                                                                                                                        |
| **Custom endpoint** | No       | Custom API endpoint for VPC/PrivateLink configurations or other non-standard deployments. Overrides the default Bedrock Runtime endpoint for the region.                                                                                                                                         |
| **Authentication**  | Yes      | Select the authentication method used to authenticate with AWS: **Credentials** (access key/secret key), **API key**, or **Default Credentials Chain** (Hybrid/Self-Managed only). See [Amazon Bedrock connector authentication](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock#authentication) for details on each method. |

Model availability depends on the region and model. See [supported foundation models in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html) and [access to Amazon Bedrock foundation models](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access-modify.html).

#### AWS Bedrock Converse model and parameters

| Field                     | Required | Description                                                                                                                                                   |
| :------------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Model**                 | Yes      | The model ID to use. See [inference profile support](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html).                   |
| **Enable prompt caching** | No       | Enables Bedrock's automatic prompt caching. See the [prompt caching documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html). |
| **Maximum tokens**        | No       | The maximum number of tokens per request to generate before stopping. Leave unset to use the model default.                                                   |
| **Temperature**           | No       | Primary response-variation control. Lower values favor likely tokens more strongly; higher values increase variation. Supported ranges vary by model.         |
| **top P**                 | No       | Advanced nucleus-sampling control from 0 to 1. Limits selection to likely tokens whose cumulative probability reaches this value.                             |
| **Timeout**               | No       | Maximum time to wait for a model API call. See [model call timeout](#model-call-timeout).                                                                     |

Bedrock Converse doesn't support a **Reasoning**/**Effort** configuration or a **top K** parameter.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
