# Document handling configuration in Docker Compose

Learn more about storage configuration options for Docker Compose setups.

**Note**
None of the storage options below with Docker Compose are suitable for production.

Document Store configuration uses the unified `camunda.document.*` Spring property model. The sections below show the new configuration format. If you're migrating from legacy `DOCUMENT_*` environment variables, see [property mapping reference](#property-mapping-reference).

For Docker Compose, add the `camunda.document.*` properties to the Orchestration Cluster application file that is already mounted by the distribution:

- For the lightweight configuration, edit the selected file under `configuration/`.
- For the full configuration, edit `.orchestration/application.yaml`.

For example, set `camunda.document.default-store-id` in that file to specify the active store. You do not need to mount a second application file.

If no storage configuration is provided, the default document storage is **in-memory**. Documents are lost when the application is stopped.

**Warning: Deprecated: `DOCUMENT_*` and `DOCUMENT_STORE_*` environment variables**

The legacy `DOCUMENT_*` and `DOCUMENT_STORE_*` environment variables (for example, `DOCUMENT_STORE_AWS_BUCKET`, `DOCUMENT_DEFAULT_STORE_ID`) are deprecated. They continue to work for at least one release cycle via a backward compatibility bridge, but will be removed in a future release. When both the unified `camunda.document.*` properties and the legacy environment variables are set, `camunda.document.*` takes precedence.

In the [Docker Compose distribution](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), Zeebe and Tasklist run in the consolidated `orchestration` service and share one application configuration. Configure the document store once for that service. In-memory documents are still lost when the service restarts; use persistent or external storage when documents must survive restarts.

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

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/docker
