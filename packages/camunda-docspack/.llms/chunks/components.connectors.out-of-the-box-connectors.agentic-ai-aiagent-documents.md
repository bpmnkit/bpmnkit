# AI Agent document support

How the AI Agent connector passes documents and images to the LLM.

The AI Agent connector can pass [Camunda documents](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/overview) to the LLM
from two sources:

- The [user prompt](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#user-prompt) **Documents** field.
- [Tool call results](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-call-responses) and event payloads from event sub-processes.

In both cases, supported documents are resolved and passed to the LLM as native content blocks so the model can
interpret them directly.


## Supported document types

Because file type support varies by LLM provider and model, you must test your document use case with the provider you are using.

| File type         | Supported | Description                                                                                                                                                                        |
| :---------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text              | Yes       | Text files (MIME types matching `text/*`, `application/xml`, `application/json`, or `application/yaml`) are passed as plain text content blocks.                                   |
| PDF               | Yes       | PDF files (MIME types matching `application/pdf`) are passed as base64 encoded content blocks.                                                                                     |
| Image             | Yes       | Image files (MIME types matching `image/jpeg`, `image/png`, `image/gif`, or `image/webp`) are passed as base64 encoded content blocks.                                             |
| Audio/video/other | No        | Audio and video files are not currently supported, and will result in an error if passed. All other unsupported file types not listed here will also result in an error if passed. |

**Info**
To learn more about storing, tracking, and managing documents in Camunda 8, see [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-documents
