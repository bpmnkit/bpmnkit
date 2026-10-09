# Handle documents with outbound connectors

Learn how outbound connectors send and retrieve documents: choosing a document source (Camunda document, inline, or external) and a download return format.

Outbound connectors that support [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started) share a consistent experience for both directions:

- When a connector **consumes** a document (upload or send), you choose a **document source**: a Camunda document, inline content, or an external URL.
- When a connector **produces** a document (download or retrieve), you choose a **return format**: a document reference, text, or JSON.

This maps onto the [two paths for document handling](https://docs.camunda.io/docs/next/components/document-handling/overview#two-paths-for-document-handling): the document store path routes an opaque file, while the inline path lets the process build or read the content directly.

The [connector SDK](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk) provides document support in property/variable bindings.

**Note**
The unified document source and return format described on this page are available from Camunda **8.10** onward and apply to newly created element templates. Processes built on earlier template versions continue to work unchanged.

---
Source: https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system
