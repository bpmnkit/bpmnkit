# AI Agent document support — Documents in tool call results

[Tool call responses](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-call-responses) can contain document references nested anywhere within the result structure.

The agent extracts these documents from the tool call result and passes them to the LLM as native content blocks (plain text for text files, base64 encoded content for PDFs and images). This is the same mechanism used for user prompt documents.

In the conversation, the tool call result itself retains a lightweight document _reference_ (for example, the document ID and store, or an external URL). The resolved document content is delivered in a separate follow-up user message immediately after the tool result, allowing the model to correlate each reference with its content.

For example, a tool can return a document for the LLM to analyze:

- A [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) tool with the **Store response** option enabled downloads a PDF document.
- A user task tool with a [Filepicker](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-filepicker) form lets a person upload a document as part of a human-in-the-loop workflow.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-documents
