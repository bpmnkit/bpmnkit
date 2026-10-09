# Intrinsic functions — Available functions — `getText`

The `getText` function accepts a document and an optional encoding parameter. It extracts the text content from the document and returns it as a string.

- The optional encoding parameter specifies the character encoding to be used when extracting the text.
- If not provided, the default encoding is UTF-8.

```json
{
  "camunda.function.type": "getText",
  "params": [ myDocument, "UTF-8" ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/intrinsic-functions
