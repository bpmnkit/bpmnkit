# Configuration — Logging — Custom ChatModelAdapter

You can provide your own `ChatModelAdapter` implementation without depending on the `camunda-process-test-langchain4j`
module. A `ChatModelAdapter` is a functional interface that takes a prompt string and returns a response string.

If you have a single `ChatModelAdapter` bean and no `provider` property is set, CPT auto-detects and uses it:

```java

@TestConfiguration
class JudgeTestConfig {

    @Bean
    ChatModelAdapter chatModelAdapter() {
        return prompt -> myChatModelAdapter.generate(prompt);
    }
}
```

When you have multiple beans, set `provider` to the bean name you want to use. In Spring, the bean name defaults to
the method name:

```java

@TestConfiguration
class JudgeTestConfig {

    @Bean
    ChatModelAdapter openAiAdapter() { /* ... */ }

    @Bean
    ChatModelAdapter ollamaAdapter() { /* ... */ }
}
```

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "ollamaAdapter" # matches the bean method name
```

**Note: Resolution order**
When using `@CamundaSpringProcessTest`, CPT resolves the judge adapter in the following order:

1. If a single `ChatModelAdapter` bean exists and no `provider` property is configured, that bean is used automatically.
2. If the `provider` property is configured and a bean with a matching name exists, that bean is selected.
3. If no matching bean is found, CPT falls back to the built-in LangChain4j implementations, provided that `camunda-process-test-langchain4j` is on the classpath.
4. If a `provider` is configured but no matching implementation can be resolved at all, CPT throws an exception.

Alternatively, you can configure the judge programmatically. Set the configuration globally
using `CamundaAssert.setJudgeConfig()`:

```java
CamundaAssert.setJudgeConfig(
    JudgeConfig.of(prompt -> myChatModelAdapter.generate(prompt))
        .withThreshold(0.8));
```

Implement `ChatModelAdapterProvider` and register it through `META-INF/services`:

```java
public class MyCustomProvider implements ChatModelAdapterProvider {

    @Override
    public String getProviderName() {
        return "my-provider";
    }

    @Override
    public ChatModelAdapter create(ProviderConfig config) {
        String endpoint = config.getCustomProperties().get("endpoint");
        return prompt -> callEndpoint(endpoint, prompt);
    }
}
```

Register the provider in `META-INF/services/io.camunda.process.test.api.judge.ChatModelAdapterProvider`:

```
com.example.MyCustomProvider
```

Alternatively, you can configure the judge programmatically. Set the configuration globally
using `CamundaAssert.setJudgeConfig()`:

```java
CamundaAssert.setJudgeConfig(
    JudgeConfig.of(prompt -> myChatModelAdapter.generate(prompt))
        .withThreshold(0.8));
```

Or register the JUnit extension manually with a judge configuration:

```java

@RegisterExtension
CamundaProcessTestExtension extension = new CamundaProcessTestExtension()
    .withJudgeConfig(JudgeConfig.of(prompt -> myChatModelAdapter.generate(prompt))
        .withThreshold(0.8));
```

#### Multimodal support

To use [document attachment](#document-attachment) with a custom adapter, implement `MultimodalChatModelAdapter` instead of `ChatModelAdapter`. `MultimodalChatModelAdapter` extends `ChatModelAdapter` and adds a second `generate` overload that receives the resolved documents.

Each `ResolvedDocument` provides the binary content via `getContent()` and metadata via `getDocumentId()`, `getFileName()`, and `getContentType()`. Pass each document to the provider as a native structured content block (image block, file block, or text block depending on the content type). Prefix each block with a text content header containing the document metadata so the judge can correlate the block back to the document reference in `<actual_value>`:

```java
public class MyMultimodalAdapter implements MultimodalChatModelAdapter {

    @Override
    public String generate(String prompt) {
        return myClient.chat(prompt);
    }

    @Override
    public String generate(String prompt, List<ResolvedDocument> documents) {
        List<Object> parts = new ArrayList<>();
        parts.add(new TextPart(prompt));

        for (ResolvedDocument doc : documents) {
            // text header identifying this document block
            parts.add(new TextPart(
                "--- documentId=\"" + doc.getDocumentId()
                + "\" fileName=\"" + doc.getFileName()
                + "\" contentType=\"" + doc.getContentType() + "\" ---"));
            // binary content as a native structured block
            parts.add(new BinaryPart(doc.getContent(), doc.getContentType()));
        }

        return myClient.chat(parts);
    }
}
```

Replace `TextPart` and `BinaryPart` with the content-block types your provider's SDK defines. If document attachment is enabled but the adapter only implements `ChatModelAdapter`, document attachment does not take effect and the judge evaluates only the raw variable JSON.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
