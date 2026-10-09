# Handle documents with outbound connectors — Document sources — Camunda documents

A Camunda document is a reference to a file held in the [Camunda document store](https://docs.camunda.io/docs/next/components/document-handling/getting-started). This is the document store path (Path 1): the file is routed as an opaque blob.

Such references are produced for you by a [form Filepicker, inbound webhook, or the Orchestration Cluster REST API](https://docs.camunda.io/docs/next/components/document-handling/upload-document-to-bpmn-process), as the output of another connector, or as an [AI Agent tool call result](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-documents), then stored in a process variable. A reference has the following structure:

```json
{
  "camunda.document.type": "camunda",
  "storeId": "gcp",
  "documentId": "example-document-id",
  "contentHash": "fwkhkj34843rfhfwho3297ufdsj0df09",
  "metadata": {
    "contentType": "application/pdf",
    "size": 70266,
    "fileName": "file.pdf"
  }
}
```

You normally reference the variable directly rather than constructing this object by hand.

---
Source: https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system
