# Use cases — Two paths for document handling

When a document flows through a process, it follows one of two paths. Understanding which path you need makes it easier to choose the right connector configuration.

### Path 1: Document Store (opaque pass-through)

The document is a blob that moves through the process. You don't need to read or manipulate its content. You just route it. The process never "looks inside" the file.

Typical examples:

- A webhook receives a PDF, and you upload it to Amazon S3.
- You download an image from Google Cloud Storage and send it via email.

On this path, the document is held in the [Camunda document store](https://docs.camunda.io/docs/next/components/document-handling/getting-started) and passed between systems as a reference.

### Path 2: Inline (data the process works with)

The content _is_ actual process data, and it is not stored in the document store. It flows as regular process variables, such as strings or JSON objects, that happen to be written to or read from an external system. You either:

- **Write it**: construct a `.json`, `.csv`, or `.txt` file from process variables and upload it to storage (for example, an error report built from process data). See [inline documents](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#inline-documents).
- **Read it**: download content from storage as JSON or text and use the values directly in FEEL expressions downstream. See [return formats](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats).

Path 2 does not involve the document store. It is best suited to smaller text or JSON files, since inline content is bounded by the process variable size limit.

---
Source: https://docs.camunda.io/docs/next/components/document-handling/overview
