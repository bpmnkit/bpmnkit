# Configuration — Semantic similarity configuration — Property reference (3)

**Example:**

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "my-custom-provider"
        model: "my-model"
        custom-properties:
          endpoint: "https://my-embeddings.example.com/v1"
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
