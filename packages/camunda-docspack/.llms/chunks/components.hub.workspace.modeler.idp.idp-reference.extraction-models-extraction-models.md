# IDP reference — Extraction models {#extraction-models}

You can choose from the following supported LLM extraction models during [data extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#extract-fields). The available models depend on the cloud provider you configure for your document extraction template.

### AWS extraction models

The following models are available when you use the AWS provider with Amazon Bedrock:

| Extraction model     | Model provider                             | Documentation                                                                                           |
| :------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| Claude Sonnet 4      | [Anthropic](https://www.anthropic.com/)    | [Anthropic's Claude in Amazon Bedrock](https://aws.amazon.com/bedrock/claude/)                          |
| Claude 3.5 Sonnet    | [Anthropic](https://www.anthropic.com/)    | [Anthropic's Claude in Amazon Bedrock](https://aws.amazon.com/bedrock/claude/)                          |
| Claude 3 Sonnet      | [Anthropic](https://www.anthropic.com/)    | [Anthropic's Claude in Amazon Bedrock](https://aws.amazon.com/bedrock/claude/)                          |
| Claude 3 Haiku       | [Anthropic](https://www.anthropic.com/)    | [Anthropic's Claude in Amazon Bedrock](https://aws.amazon.com/bedrock/claude/)                          |
| Llama 3 70B Instruct | [Meta](https://www.meta.com/gb/)           | [Meta's Llama in Amazon Bedrock](https://aws.amazon.com/bedrock/llama/)                                 |
| Llama 3 8B Instruct  | [Meta](https://www.meta.com/gb/)           | [Meta's Llama in Amazon Bedrock](https://aws.amazon.com/bedrock/llama/)                                 |
| Titan Text Premier   | [Amazon AWS](https://docs.aws.amazon.com/) | [Amazon Titan Text models](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-text-models.html) |

**Note**

Amazon Bedrock LLM extraction models are only available in specific regions.

- You must ensure your selected environment's cluster region supports the LLM extraction model you want to use. For example, if you are using the `eu-central-1` region, you cannot use Claude 3 Haiku as it is only available in US regions.
- If you have chosen a model not supported in your region, you will receive a 403 "You don't have access to the model with the specified model ID" exception error.
- Some newer models (including Claude Sonnet 4) require cross-region inference profiles and are automatically handled by IDP. When you select these models, IDP infers the appropriate regional prefix (`us.`, `eu.`, `apac.`, or `us-gov.`) from your configured AWS region and adds it to enable access across supported regions within your geographic area.

For current regional support information, refer to [supported foundation models in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html). For more details about cross-region inference, see [inference profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html).

### Azure, GCP, and OpenAI Compatible extraction models

When using Azure, GCP, or an OpenAI Compatible provider, the available extraction models depend on the models deployed and accessible through your provider configuration:

- **Azure**: Models available through your [Azure AI Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/) deployment, including Azure OpenAI models if configured. See [Azure connector secrets](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration#azure-secrets).
- **GCP**: Models available through your [Google Cloud Vertex AI](https://cloud.google.com/vertex-ai/docs) deployment. See [GCP connector secrets](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration#gcp-secrets).
- **OpenAI Compatible**: Any model accessible through your OpenAI Compatible API endpoint. The **Extraction model** field accepts custom model IDs, allowing you to specify the exact model to use. See [OpenAI Compatible connector secrets](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration#openai-compatible-secrets).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference
