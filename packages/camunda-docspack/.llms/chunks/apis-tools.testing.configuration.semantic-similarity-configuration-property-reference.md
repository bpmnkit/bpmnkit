# Configuration — Semantic similarity configuration — Property reference

All semantic similarity properties are nested under `camunda.process-test.similarity` in Spring configuration.
In Java properties files, use the `similarity.` prefix with camelCase keys. For example, `similarity.embedding-model.api-key` becomes `similarity.embeddingModel.apiKey`.

**Note**
Unless noted otherwise, properties in the provider tables are required.

#### Similarity settings

| Property                                   | Type      | Default | Description                                                                                                                  |
| ------------------------------------------ | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `similarity.threshold`                     | `double`  | `0.5`   | Cosine similarity threshold (0.0 to 1.0) for the assertion to pass.                                                          |
| `similarity.default-preprocessors-enabled` | `boolean` | `true`  | When `true`, applies the default text preprocessors (lowercase, Unicode NFC, and whitespace normalization) before embedding. |

The default threshold of 0.5 treats two strings as similar when their cosine similarity is at least 0.5. This is a practical default for AI-generated text, where wording and phrasing may vary between runs even when the meaning is the same.
Increase the threshold when your assertion needs stricter semantic agreement.

#### Embedding model settings

| Property                                | Required | Type       | Description                                                            |
| --------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------- |
| `similarity.embedding-model.provider`   | Yes      | `string`   | Set to `openai`.                                                       |
| `similarity.embedding-model.model`      | Yes      | `string`   | Model name (for example `text-embedding-3-small`).                     |
| `similarity.embedding-model.api-key`    | Yes      | `string`   | API key.                                                               |
| `similarity.embedding-model.dimensions` | No       | `integer`  | Number of output dimensions for models that support custom dimensions. |
| `similarity.embedding-model.timeout`    | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).              |

**Example:**

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "openai"
        model: "text-embedding-3-small"
        api-key: ${OPENAI_API_KEY}
```

It supports Bedrock long-term API keys or AWS IAM credentials. It falls back to the
[AWS default credentials provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html).

**Note**
The AWS principal must be authorized to perform [`bedrock:InvokeModel`](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html) on the configured embedding model ARN. The model must also be [enabled for access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) in the chosen region.

If you use Bedrock for both the judge chat model and the embedding model, each model requires a separate bedrock:InvokeModel grant; access to one does not imply access to the other.

| Property                                            | Required                       | Type       | Description                                                                                    |
| --------------------------------------------------- | ------------------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| `similarity.embedding-model.provider`               | Yes                            | `string`   | Set to `amazon-bedrock`.                                                                       |
| `similarity.embedding-model.model`                  | Yes                            | `string`   | Model name (for example `amazon.titan-embed-text-v2:0`).                                       |
| `similarity.embedding-model.region`                 | No                             | `string`   | AWS region (for example `eu-central-1`).                                                       |
| `similarity.embedding-model.api-key`                | No                             | `string`   | Bedrock long-term API key. Optional if using IAM credentials or the default credentials chain. |
| `similarity.embedding-model.credentials.access-key` | Conditionally, with secret key | `string`   | AWS IAM access key. Optional if using an API key or the default credentials chain.             |
| `similarity.embedding-model.credentials.secret-key` | Conditionally, with access key | `string`   | AWS IAM secret key. Optional if using an API key or the default credentials chain.             |
| `similarity.embedding-model.dimensions`             | No                             | `integer`  | Number of output dimensions for models that support custom dimensions.                         |
| `similarity.embedding-model.normalize`              | No                             | `boolean`  | Whether to normalize the output embeddings.                                                    |
| `similarity.embedding-model.timeout`                | No                             | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                                      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
