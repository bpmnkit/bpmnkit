# Intrinsic functions — Available functions — `getJson`

The `getJson` function accepts a document and an optional FEEL expression parameter. It extracts the text content from the JSON document and returns it as an object.

- The optional FEEL expression parameter specifies the part that will be extracted from the JSON document content.
- If not provided, the whole document is returned as a JSON object.

```json
{
  "camunda.function.type": "getJson",
  "params": [ myDocument, "field1.field2" ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/intrinsic-functions
