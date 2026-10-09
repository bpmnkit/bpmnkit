# Test your AI agents with CPT — Step 5: Verify the agent output — Configure the embedding model

The embedding model does not need to match the AI agent's LLM or the judge model. Depending on your requirements, a lightweight model is often good enough for a good test result.

Add the embedding model configuration to your test configuration alongside the CPT settings from [Step 2](#step-2-configure-the-llm-provider-and-connectors):

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "amazon-bedrock"
        model: "amazon.titan-embed-text-v2:0"
        region: "eu-central-1"
        dimensions: 256
        credentials:
          access-key: ${AWS_LLM_BEDROCK_ACCESS_KEY}
          secret-key: ${AWS_LLM_BEDROCK_SECRET_KEY}
```

Use this provider for [Ollama](https://ollama.com/).

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "openai-compatible"
        model: "<your-model-id>"
        base-url: "http://localhost:11434/v1"
```

For the full property reference, see [semantic similarity configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#semantic-similarity-configuration).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
