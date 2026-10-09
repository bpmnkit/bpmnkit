# Handle documents with outbound connectors — Document sources — External documents

An external document points to a file available for download from an unprotected URL. Any connector can consume it directly, without first uploading it to the document store (Path 1: the file is routed, not inspected).

To use an external document, set a process variable to the following structure:

```json
{
  "camunda.document.type": "external",
  "url": "https://www.example.com/file.pdf",
  "name": "my-test-file.pdf"
}
```

| Field                   | Required | Description                                                                                                                                                   |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.document.type` | Yes      | Must be `"external"`.                                                                                                                                         |
| `url`                   | Yes      | The URL the file is downloaded from.                                                                                                                          |
| `name`                  | No       | The filename. If omitted, the name is taken from the `content-type` and `content-disposition` HTTP response headers, with a random UUID used as the fallback. |

---
Source: https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system
