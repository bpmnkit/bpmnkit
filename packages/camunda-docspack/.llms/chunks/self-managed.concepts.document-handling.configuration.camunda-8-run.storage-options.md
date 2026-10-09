# Document handling configuration in Camunda 8 Run — Storage options

By using **external cloud file bucket storage** with [**AWS S3**](https://aws.amazon.com/s3/), documents can be stored in a secure and scalable way. Buckets are integrated per cluster to ensure proper isolation and environment-specific management.

```yaml
camunda:
  document:
    default-store-id: aws1 # the instance ID defined below
    aws:
      aws1: # store instance ID — must match default-store-id
        bucket-name: my-bucket
        bucket-path: documents/ # optional
        bucket-ttl: 30 # optional, days
```

| Property                                             | Required | Description                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.document.aws.<id>.bucket-name`              | Yes      | Name of the AWS S3 bucket where documents are stored.                                                                                                                                                                                                    |
| `camunda.document.aws.<id>.bucket-path`              | No       | Folder-like path within the S3 bucket. Defaults to `""`.                                                                                                                                                                                                 |
| `camunda.document.aws.<id>.bucket-ttl`               | No       | Time-to-live for documents in the bucket, in days.                                                                                                                                                                                                       |
| `camunda.document.aws.<id>.endpoint`                 | No       | Custom endpoint URL for an [S3-compatible object store](#s3-compatible-object-stores) such as MinIO, Cloudian, or Garage. When unset, the AWS SDK default endpoint is used.                                                                              |
| `camunda.document.aws.<id>.force-path-style`         | No       | Forces path-style addressing on the S3 client. Most S3-compatible backends require this. Automatically enabled when `endpoint` is set, so explicit configuration is rarely needed.                                                                       |
| `camunda.document.aws.<id>.chunked-encoding-enabled` | No       | Controls AWS chunked transfer encoding. Set to `false` for S3-compatible backends that do not support `aws-chunked` streaming-signed uploads (for example, Garage). When unset, the SDK default (`true`) is used, which is correct for AWS S3 and MinIO. |
| `camunda.document.default-store-id`                  | Yes      | Instance ID of the store to use as the default.                                                                                                                                                                                                          |
| `camunda.document.thread-pool-size`                  | No       | Number of threads in the document store thread pool.                                                                                                                                                                                                     |

Deprecated: legacy environment variable equivalents

```
DOCUMENT_STORE_AWS_CLASS=io.camunda.document.store.aws.AwsDocumentStoreProvider
DOCUMENT_STORE_AWS_BUCKET=my-bucket
DOCUMENT_STORE_AWS_BUCKET_PATH=documents/
DOCUMENT_STORE_AWS_BUCKET_TTL=30
DOCUMENT_DEFAULT_STORE_ID=aws
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/camunda-8-run
