# Configuration — Logging — Property reference (2)

Supports Bedrock long-term API keys or AWS IAM credentials. Falls back to the
[AWS default credentials provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html).

**Note**
The AWS principal must be authorized to perform [`bedrock:InvokeModel`](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html) on the configured model ARN. The model must also be [enabled for access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) in the chosen region.

If you use Bedrock for both the judge chat model and the embedding model, each model requires a separate `bedrock:InvokeModel` grant; access to one does not imply access to the other.

| Property                                  | Required                       | Type       | Description                                                                                    |
| ----------------------------------------- | ------------------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| `judge.chat-model.provider`               | Yes                            | `string`   | Set to `amazon-bedrock`.                                                                       |
| `judge.chat-model.model`                  | Yes                            | `string`   | Model name (for example `eu.anthropic.claude-haiku-4-5-20251001-v1:0`).                        |
| `judge.chat-model.region`                 | No                             | `string`   | AWS region (for example `eu-central-1`).                                                       |
| `judge.chat-model.api-key`                | No                             | `string`   | Bedrock long-term API key. Optional if using IAM credentials or the default credentials chain. |
| `judge.chat-model.credentials.access-key` | Conditionally, with secret key | `string`   | AWS IAM access key. Optional if using an API key or the default credentials chain.             |
| `judge.chat-model.credentials.secret-key` | Conditionally, with access key | `string`   | AWS IAM secret key. Optional if using an API key or the default credentials chain.             |
| `judge.chat-model.timeout`                | No                             | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                                      |
| `judge.chat-model.temperature`            | No                             | `double`   | Temperature for response randomness (0.0 to 2.0).                                              |

**Example:**

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "amazon-bedrock"
        model: "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
        region: "eu-central-1"
        credentials:
          access-key: ${AWS_BEDROCK_ACCESS_KEY}
          secret-key: ${AWS_BEDROCK_SECRET_KEY}
```

Supports API key authentication. Falls back to
[`DefaultAzureCredential`](https://learn.microsoft.com/en-us/java/api/com.azure.identity.defaultazurecredential).

| Property                       | Required | Type       | Description                                                                                                                |
| ------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `judge.chat-model.provider`    | Yes      | `string`   | Set to `azure-openai`.                                                                                                     |
| `judge.chat-model.model`       | Yes      | `string`   | Azure [deployment name](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource#deploy-a-model). |
| `judge.chat-model.endpoint`    | Yes      | `string`   | Azure OpenAI resource URL (for example `https://my-resource.openai.azure.com/`).                                           |
| `judge.chat-model.api-key`     | No       | `string`   | API key. Optional; if omitted, falls back to `DefaultAzureCredential`.                                                     |
| `judge.chat-model.timeout`     | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                                                                  |
| `judge.chat-model.temperature` | No       | `double`   | Temperature for response randomness (0.0 to 2.0).                                                                          |

**Example:**

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "azure-openai"
        model: "my-gpt4o-deployment"
        endpoint: "https://my-resource.openai.azure.com/"
        api-key: ${AZURE_OPENAI_API_KEY}
```

For local models (such as [Ollama](https://ollama.com/)) or any third-party API that implements the
[OpenAI chat completions format](https://platform.openai.com/docs/api-reference/chat).

| Property                       | Required | Type       | Description                                                              |
| ------------------------------ | -------- | ---------- | ------------------------------------------------------------------------ |
| `judge.chat-model.provider`    | Yes      | `string`   | Set to `openai-compatible`.                                              |
| `judge.chat-model.model`       | Yes      | `string`   | Model name (for example `llama3`).                                       |
| `judge.chat-model.base-url`    | Yes      | `string`   | Base URL for the API endpoint (for example `http://localhost:11434/v1`). |
| `judge.chat-model.api-key`     | No       | `string`   | API key. Optional for local providers.                                   |
| `judge.chat-model.headers.*`   | No       | `map`      | Custom HTTP headers.                                                     |
| `judge.chat-model.timeout`     | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                |
| `judge.chat-model.temperature` | No       | `double`   | Temperature for response randomness (0.0 to 2.0).                        |

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
