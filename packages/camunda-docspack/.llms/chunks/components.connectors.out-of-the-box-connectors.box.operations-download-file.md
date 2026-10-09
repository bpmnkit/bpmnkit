# Box connector — Operations — Download File

Downloads a file item and returns its content in the [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats) you choose.

| Property      | Type   | Required | Example                                |
| ------------- | ------ | -------- | -------------------------------------- |
| File path     | String | Yes      | "/my-file.png"                         |
| Return format | Enum   | Yes      | Document reference / As text / As JSON |

Select a return format for the downloaded content:

- **Document reference**: a reference to a document created in the Camunda document store is returned in `document`.
- **As text**: the content is decoded to a string (with an optional encoding, default UTF-8) and returned in `content`.
- **As JSON**: the content is parsed as JSON and returned in `content`.

**Note**
**As text** and **As JSON** return the content directly in a process variable and are subject to a size guard (approximately 1.5 MiB); use **Document reference** for large files. **As JSON** fails the job when the content is not valid JSON.

For example, with **Document reference** you can reference the downloaded file using the example response expression:

```json
{ "download": document }
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/box
