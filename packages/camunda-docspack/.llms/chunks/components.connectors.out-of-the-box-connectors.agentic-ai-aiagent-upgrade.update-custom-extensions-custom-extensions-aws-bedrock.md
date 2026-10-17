# Upgrade AI Agent element templates — Update custom extensions {#custom-extensions} — AWS Bedrock

The legacy **AWS Bedrock Converse** provider was also commonly used to run **Anthropic Claude** models. In the new template, decide which provider matches your use case:

- **Running Claude models**: Migrate to the new template's **Anthropic** provider and **AWS Bedrock Mantle** backend. This keeps access to Anthropic-specific configuration, such as reasoning and prompt caching. See the [Anthropic provider](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#anthropic) above.
- **Running any other model family** (Amazon Nova, Meta Llama, Mistral, and so on): Migrate to the new template's **AWS Bedrock Converse** provider. It directly replaces the legacy provider.

#### Migrating to Anthropic + AWS Bedrock Mantle

**Authentication**, **Timeout**, **Maximum tokens**, **Temperature**, and **top P** carry over unchanged.

| Legacy field | New template field |
| :----------- | :----------------- |
| Region       | AWS region         |
| Endpoint     | Custom endpoint    |

**Important**
**Custom endpoint** expects the full Bedrock Mantle base URL, including the `/anthropic` path segment (for example, `https://your-vpce-host/anthropic`). This is a different shape than the Bedrock Runtime endpoint you may have configured in the legacy template.

**Model** carries over under the same field label. The new template uses Anthropic's model ID scheme, not the AWS Bedrock model ID format from the legacy template. Check the model ID against the [Claude models overview](https://docs.anthropic.com/en/docs/about-claude/models/all-models).

Bedrock Mantle requires a different IAM permission policy than Bedrock Runtime. Do not reuse the legacy Bedrock Runtime policy unchanged. Update the policy for the new endpoint before you migrate. Otherwise, the first model call returns an authentication or permission error.

#### Migrating to AWS Bedrock Converse

**Authentication**, **Timeout**, **Model**, **Maximum tokens**, **Temperature**, and **top P** carry over unchanged.

| Legacy field | New template field |
| :----------- | :----------------- |
| Region       | AWS region         |
| Endpoint     | Custom endpoint    |

The new template additionally exposes **Enable prompt caching** on the AWS Bedrock Converse provider.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
