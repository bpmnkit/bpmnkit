# Configuration — Logging — Document attachment

When `judge.attach-documents` is enabled, CPT scans the serialized variable JSON for [Camunda document](https://docs.camunda.io/docs/next/components/document-handling/getting-started) references, downloads their content, and passes it to the judge alongside the text prompt as structured content blocks. This lets the judge evaluate document content, such as generated PDFs, images, or text files.

Document attachment is disabled by default. Enable it globally:

```yaml
camunda:
  process-test:
    judge:
      attach-documents: true
```

```properties
judge.attachDocuments=true
```

You can also enable it per assertion using `withJudgeConfig`:

```java
assertThat(processInstance)
    .withJudgeConfig(config -> config.withAttachDocuments(true))
    .hasVariableSatisfiesJudge("report", "Contains an executive summary with at least three key findings.");
```

#### Content type handling

How the document is passed to the judge depends on its MIME content type:

| Content type                                                                                                                                            | Passed to judge as                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `image/*`                                                                                                                                               | Inline image block                                                      |
| `application/pdf`                                                                                                                                       | PDF file block                                                          |
| `text/*`, `application/json`, `application/xml`, `application/yaml`, `application/x-yaml`, or types with a structured suffix (`+json`, `+xml`, `+yaml`) | Inline text block (UTF-8)                                               |
| All other types                                                                                                                                         | Placeholder text only; content is not inspectable. A warning is logged. |

#### Behavior

- Built-in LangChain4j providers implement `MultimodalChatModelAdapter`. Custom `ChatModelAdapter` implementations must implement `MultimodalChatModelAdapter` to receive documents. Otherwise, document attachment does not take effect and the judge evaluates only the raw variable JSON.
- Documents with the same document ID and store ID are deduplicated and downloaded only once.
- If a document fails to download, the assertion fails with an `IllegalStateException`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
