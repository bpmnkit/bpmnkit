# Intrinsic functions — Available functions — `createLink`

The `createLink` function accepts a document and an optional TTL (time-to-live) value. It creates a temporary pre-signed link to the document in the Camunda document storage. The link is returned as a string.

- Pre-signed links can only be created for documents that are stored in cloud storage (for example, AWS S3 or Google Cloud Storage), but not local or in-memory storage.
- The optional TTL parameter must be a valid [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) string.
- If not provided, the default TTL is 1 hour.

```json
{
  "camunda.function.type": "createLink",
  "params": [ myDocument, "PT1H" ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/intrinsic-functions
