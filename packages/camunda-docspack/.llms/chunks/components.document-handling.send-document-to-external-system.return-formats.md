# Handle documents with outbound connectors — Return formats

Connectors that download or retrieve a document let you choose how the content is returned, instead of guessing from the content type. A **return format** dropdown offers three options:

| Return format          | What you get                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document reference** | The content is uploaded to the [Camunda document store](https://docs.camunda.io/docs/next/components/document-handling/getting-started) and a reference is returned (Path 1). |
| **As text**            | The bytes are decoded to a string and returned in the response (Path 2, read side). An optional **encoding** sub-field defaults to UTF-8.       |
| **As JSON**            | The bytes are parsed as JSON and returned as a structured value you can use directly in FEEL (Path 2, read side).                               |

**Note**
**As text** and **As JSON** return the content directly in a process variable, so they are subject to a size guard (approximately 1.5 MiB). A larger object fails the job with a controlled incident rather than exhausting runtime memory. Use **Document reference** for large files.

The **As JSON** option fails the job when the content is not valid JSON. Use **As text** for non-JSON content.

The exact response variable differs per connector (for example, S3 returns `element`, Google Cloud Storage returns `content`, and the REST connector returns `body`). See each connector's page for its response structure.

---
Source: https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system
