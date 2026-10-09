# Document handling configuration in Camunda 8 Run — Storage options — S3-compatible object stores

To use an S3-compatible object store (MinIO, Cloudian, Garage, etc.), set `endpoint` on the store instance, in addition to the standard properties above. The bucket must already exist on the backend — Camunda does not create it.

**Example (local MinIO):**

```yaml
camunda:
  document:
    default-store-id: aws1
    aws:
      aws1:
        bucket-name: camunda-docs
        endpoint: http://localhost:9000
```

For Garage, add `chunked-encoding-enabled: false` to the same block.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/camunda-8-run
