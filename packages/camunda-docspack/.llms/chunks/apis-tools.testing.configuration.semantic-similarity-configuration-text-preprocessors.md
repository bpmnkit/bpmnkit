# Configuration — Semantic similarity configuration — Text preprocessors

By default, CPT applies a set of text preprocessors to both the actual and expected values before computing embeddings.
This improves stability of similarity scores by reducing noise from formatting differences. The default preprocessors are:

- **Lowercase normalization**: converts text to lowercase.
- **Unicode normalization**: applies Unicode NFC normalization.
- **Whitespace normalization**: collapses repeated whitespace and trims leading/trailing whitespace.

To disable the default preprocessors, set `similarity.default-preprocessors-enabled` to `false`:

```yaml
camunda:
  process-test:
    similarity:
      default-preprocessors-enabled: false
```

```properties
similarity.defaultPreprocessorsEnabled=false
```

You can also configure preprocessors programmatically using `SemanticSimilarityConfig`:

```java
SemanticSimilarityConfig.of(myEmbeddingAdapter, 0.7)
    .withoutPreprocessors();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
