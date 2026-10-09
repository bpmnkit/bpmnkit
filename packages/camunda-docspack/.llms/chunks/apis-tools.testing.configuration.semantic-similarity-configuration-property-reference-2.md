# Configuration — Semantic similarity configuration — Property reference (2)

**Example:**

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "amazon-bedrock"
        model: "amazon.titan-embed-text-v2:0"
        region: "eu-central-1"
        credentials:
          access-key: ${AWS_BEDROCK_ACCESS_KEY}
          secret-key: ${AWS_BEDROCK_SECRET_KEY}
```

It supports API key authentication. It falls back to
[`DefaultAzureCredential`](https://learn.microsoft.com/en-us/java/api/com.azure.identity.defaultazurecredential).

| Property                                | Required | Type       | Description                                                                                                                |
| --------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `similarity.embedding-model.provider`   | Yes      | `string`   | Set to `azure-openai`.                                                                                                     |
| `similarity.embedding-model.model`      | Yes      | `string`   | Azure [deployment name](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource#deploy-a-model). |
| `similarity.embedding-model.endpoint`   | Yes      | `string`   | Azure OpenAI resource URL (for example `https://my-resource.openai.azure.com/`).                                           |
| `similarity.embedding-model.api-key`    | No       | `string`   | API key. Optional; if omitted, falls back to `DefaultAzureCredential`.                                                     |
| `similarity.embedding-model.dimensions` | No       | `integer`  | Number of output dimensions for models that support custom dimensions.                                                     |
| `similarity.embedding-model.timeout`    | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                                                                  |

**Example:**

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "azure-openai"
        model: "my-embedding-deployment"
        endpoint: "https://my-resource.openai.azure.com/"
        api-key: ${AZURE_OPENAI_API_KEY}
```

For local models, such as [Ollama](https://ollama.com/), or any third-party API that implements the
[OpenAI embeddings format](https://platform.openai.com/docs/api-reference/embeddings).

| Property                                | Required | Type       | Description                                                              |
| --------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------ |
| `similarity.embedding-model.provider`   | Yes      | `string`   | Set to `openai-compatible`.                                              |
| `similarity.embedding-model.model`      | Yes      | `string`   | Model name (for example `nomic-embed-text`).                             |
| `similarity.embedding-model.base-url`   | Yes      | `string`   | Base URL for the API endpoint (for example `http://localhost:11434/v1`). |
| `similarity.embedding-model.api-key`    | No       | `string`   | API key. Optional for local providers.                                   |
| `similarity.embedding-model.headers.*`  | No       | `map`      | Custom HTTP headers.                                                     |
| `similarity.embedding-model.dimensions` | No       | `integer`  | Number of output dimensions for models that support custom dimensions.   |
| `similarity.embedding-model.timeout`    | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                |

**Example (Ollama):**

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "openai-compatible"
        model: "nomic-embed-text"
        base-url: "http://localhost:11434/v1"
```

For providers not listed above, use a custom provider name and pass arbitrary properties. See
[custom EmbeddingModelAdapter](#custom-embeddingmodeladapter) for implementation details.

| Property                                         | Required | Type       | Description                                                                                   |
| ------------------------------------------------ | -------- | ---------- | --------------------------------------------------------------------------------------------- |
| `similarity.embedding-model.provider`            | Yes      | `string`   | Custom provider name matching your SPI implementation.                                        |
| `similarity.embedding-model.model`               | Yes      | `string`   | Model name.                                                                                   |
| `similarity.embedding-model.custom-properties.*` | No       | `map`      | Arbitrary key-value pairs passed to SPI providers via `ProviderConfig.getCustomProperties()`. |
| `similarity.embedding-model.timeout`             | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                                     |

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
