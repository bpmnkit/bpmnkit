# Document handling configuration in Helm — Using the unified configuration format — AWS S3

```yaml
global:
  documentStore:
    activeStoreId: "aws1" # must match the store instance ID in extraConfiguration
    type:
      aws:
        enabled: false # disable legacy env var generation
        existingSecret: "aws-credentials"
        accessKeyIdKey: "awsAccessKeyId"
        secretAccessKeyKey: "awsSecretAccessKey"

orchestration:
  extraConfiguration:
    - file: aws-documentstore.yaml
      content: |
        camunda:
          document:
            aws:
              aws1: # store instance ID — must match activeStoreId
                bucket-name: my-bucket
                bucket-path: documents/ # optional
                bucket-ttl: 30 # optional, days

connectors:
  extraConfiguration:
    - file: aws-documentstore.yaml
      content: |
        camunda:
          document:
            aws:
              aws1: # store instance ID — must match activeStoreId
                bucket-name: my-bucket
```

#### S3-compatible object storage

Camunda's AWS S3 store can also target self-hosted S3-compatible object stores such as [MinIO](https://min.io/), [Cloudian](https://cloudian.com/), or [Garage](https://garagehq.deuxfleurs.fr/). Set these additional properties on the store instance in `extraConfiguration`:

| Property                                             | Description                                                                                                                                                                                                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.document.aws.<id>.endpoint`                 | URL of the S3-compatible server. Setting this switches the store into S3-compatible mode. Example: `http://minio.minio.svc.cluster.local:9000`.                                                                                                                            |
| `camunda.document.aws.<id>.force-path-style`         | Forces path-style bucket addressing on the S3 client. Most S3-compatible servers (MinIO, Garage) require this. Automatically enabled when `endpoint` is set, so explicit configuration is rarely needed.                                                                   |
| `camunda.document.aws.<id>.chunked-encoding-enabled` | Controls AWS chunked transfer encoding. Some S3-compatible backends (notably Garage) do not implement the `aws-chunked` streaming-signed upload mode and require this to be `false`. When unset, the SDK default (`true`) is used, which is correct for MinIO and similar. |

Credentials are configured the same way as AWS S3, via `existingSecret`/`accessKeyIdKey`/`secretAccessKeyKey` under `global.documentStore.type.aws`. The bucket must exist on the backend before Camunda starts — the chart does not create it.

##### Example: in-cluster MinIO

```yaml
global:
  documentStore:
    activeStoreId: "aws1"
    type:
      aws:
        enabled: false
        existingSecret: "minio-credentials"
        accessKeyIdKey: "access-key-id"
        secretAccessKeyKey: "secret-access-key"

orchestration:
  extraConfiguration:
    - file: aws-documentstore.yaml
      content: |
        camunda:
          document:
            aws:
              aws1:
                bucket-name: camunda-docs
                endpoint: http://minio.minio.svc.cluster.local:9000

connectors:
  extraConfiguration:
    - file: aws-documentstore.yaml
      content: |
        camunda:
          document:
            aws:
              aws1:
                bucket-name: camunda-docs
                endpoint: http://minio.minio.svc.cluster.local:9000
```

MinIO accepts the AWS SDK's default streaming-signed uploads, so `chunked-encoding-enabled` is not set. For Garage, add `chunked-encoding-enabled: false` to the same block.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm
