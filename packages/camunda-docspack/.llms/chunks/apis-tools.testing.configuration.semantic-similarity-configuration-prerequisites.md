# Configuration — Semantic similarity configuration — Prerequisites

CPT provides an optional [LangChain4j](https://docs.langchain4j.dev/) integration module that ships with preconfigured support for major embedding model providers, such as OpenAI, Azure OpenAI, Amazon Bedrock, and OpenAI-compatible APIs.

**Note**
LangChain4j requires Java 17+.

Camunda Process Test Spring includes the LangChain4j providers as a transitive dependency. No additional
dependency or configuration is needed.

Add the `camunda-process-test-langchain4j` dependency to your project:

```xml
<dependency>
    <groupId>io.camunda</groupId>
    <artifactId>camunda-process-test-langchain4j</artifactId>
    <scope>test</scope>
</dependency>
```

**Important**
You can provide your own embedding integration through a custom `EmbeddingModelAdapter`. In that case, this dependency is not required. See [custom EmbeddingModelAdapter](#custom-embeddingmodeladapter) for more details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
