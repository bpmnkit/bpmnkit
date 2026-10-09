# Handle documents with outbound connectors — Document sources — Inline documents

An inline document embeds content directly in a process variable, with no document store upload required. This is the inline path (Path 2, write side): useful when you want to generate a document on-the-fly from process data, such as an error report, and pass it immediately to a connector.

To create an inline document, set a process variable to the following structure:

```json
{
  "camunda.document.type": "inline",
  "content": "Invoice #1234 — Amount due: $99.00",
  "name": "invoice.txt",
  "contentType": "text/plain"
}
```

You can also construct this with a FEEL expression to build the content dynamically from other process variables:

```feel
= {
  "camunda.document.type": "inline",
  "content": "Invoice #" + invoiceId + " — Amount due: $" + string(amount),
  "name": "invoice-" + invoiceId + ".txt"
}
```

The `content` field is polymorphic: a string is stored as its UTF-8 bytes, while a map, list, number, or boolean is serialized to JSON. This lets you build structured files directly from process variables:

```feel
= {
  "camunda.document.type": "inline",
  "content": {"orderId": orderId, "status": "failed", "errors": errorList},
  "name": "error.json",
  "contentType": "application/json"
}
```

| Field                   | Required | Description                                                                                                                                                                                        |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.document.type` | Yes      | Must be `"inline"`.                                                                                                                                                                                |
| `content`               | Yes      | The document content. A string is stored as UTF-8 bytes; a map, list, number, or boolean is serialized to JSON.                                                                                    |
| `name`                  | No       | The filename. Drives content type inference when `contentType` is not set. If omitted, a UUID is generated automatically.                                                                          |
| `contentType`           | No       | The MIME type of the content. If omitted, the type is inferred from the file extension of `name`. If the extension is unrecognized or no name is provided, defaults to `application/octet-stream`. |

**Note**
Inline documents are held in process variables, so their size is bounded by the [Zeebe variable size limit](https://docs.camunda.io/docs/next/components/concepts/variables) (approximately 4 MB). For larger files, use the Camunda document store path instead.

There is no base64 field for binary content. To inline binary data, encode it with FEEL's built-in [`to base64` function](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-string#to-base64value).

---
Source: https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system
