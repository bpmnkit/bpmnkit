# Configuration — Semantic similarity configuration — Custom EmbeddingModelAdapter

You can provide your own `EmbeddingModelAdapter` implementation without depending on the `camunda-process-test-langchain4j`
module.

An `EmbeddingModelAdapter` is a functional interface that takes a string and returns a vector of floating-point numbers representing the text's semantic embedding.

If you have a single `EmbeddingModelAdapter` bean and no `provider` property is set, CPT auto-detects and uses it:

```java

@TestConfiguration
class SimilarityTestConfig {

    @Bean
    EmbeddingModelAdapter embeddingModelAdapter() {
        return text -> myEmbeddingClient.embed(text);
    }
}
```

When you have multiple beans, set `provider` to the bean name you want to use. In Spring, the bean name defaults to
the method name:

```java

@TestConfiguration
class SimilarityTestConfig {

    @Bean
    EmbeddingModelAdapter openAiEmbeddingAdapter() { /* ... */ }

    @Bean
    EmbeddingModelAdapter ollamaEmbeddingAdapter() { /* ... */ }
}
```

```yaml
camunda:
  process-test:
    similarity:
      embedding-model:
        provider: "ollamaEmbeddingAdapter" # matches the bean method name
```

**Note: Resolution order**
When using `@CamundaSpringProcessTest`, CPT resolves the embedding adapter in the following order:

1. If a single `EmbeddingModelAdapter` bean exists and no `provider` property is configured, that bean is used automatically.
2. If the `provider` property is configured and a bean with a matching name exists, that bean is selected.
3. If no matching bean is found, CPT falls back to the built-in LangChain4j implementations, provided that `camunda-process-test-langchain4j` is on the classpath.
4. If a `provider` is configured but no matching implementation can be resolved at all, CPT throws an exception.

Alternatively, you can configure semantic similarity programmatically. Set the configuration globally
using `CamundaAssert.setSemanticSimilarityConfig()`:

```java
CamundaAssert.setSemanticSimilarityConfig(
        SemanticSimilarityConfig.of(text -> myEmbeddingClient.embed(text), 0.8));
```

Implement `EmbeddingModelAdapterProvider` and register it through `META-INF/services`:

```java
public class MyCustomEmbeddingProvider implements EmbeddingModelAdapterProvider {

    @Override
    public String getProviderName() {
        return "my-provider";
    }

    @Override
    public EmbeddingModelAdapter create(ProviderConfig config) {
        String endpoint = config.getCustomProperties().get("endpoint");
        return text -> callEndpoint(endpoint, text);
    }
}
```

Register the provider in `META-INF/services/io.camunda.process.test.api.similarity.EmbeddingModelAdapterProvider`:

```
com.example.MyCustomEmbeddingProvider
```

Alternatively, you can configure semantic similarity programmatically. Set the configuration globally
using `CamundaAssert.setSemanticSimilarityConfig()`:

```java
CamundaAssert.setSemanticSimilarityConfig(
        SemanticSimilarityConfig.of(text -> myEmbeddingClient.embed(text), 0.8));
```

Or register the JUnit extension manually with a semantic similarity configuration:

```java

@RegisterExtension
CamundaProcessTestExtension extension = new CamundaProcessTestExtension()
        .withSemanticSimilarityConfig(
                SemanticSimilarityConfig.of(text -> myEmbeddingClient.embed(text), 0.8));
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
