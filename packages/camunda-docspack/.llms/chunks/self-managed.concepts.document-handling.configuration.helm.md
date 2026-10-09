# Document handling configuration in Helm

Learn more about storage configuration options for Helm setups.

This page covers two configuration approaches:

- **Legacy approach (deprecated)**: `global.documentStore.*` in `values.yaml` — generates `DOCUMENT_*` environment variables. Still works via a backward compatibility bridge but will be removed in a future release.
- **New approach (recommended)**: `extraConfiguration` with `camunda.document.*` Spring properties — the unified configuration model. See [using the unified configuration format](#using-the-unified-configuration-format).

**Warning: Deprecated: `DOCUMENT_*` and `DOCUMENT_STORE_*` environment variables**

The `global.documentStore.*` Helm values generate legacy `DOCUMENT_*` and `DOCUMENT_STORE_*` environment variables (for example, `DOCUMENT_STORE_AWS_BUCKET`, `DOCUMENT_DEFAULT_STORE_ID`). These are deprecated. They continue to work for at least one release cycle via a backward compatibility bridge, but will be removed in a future release. When both `camunda.document.*` properties and legacy environment variables are set, `camunda.document.*` takes precedence.

Helm offers external cloud file bucket storage options (recommended for production use when deploying with Helm) and in-memory storage (not suitable for production use):

- By using **external cloud file bucket storage options**, documents can be stored in a secure and scalable way. Buckets are integrated per cluster to ensure proper isolation and environment-specific management. The following file bucket storage options are supported:
  - [**Google Cloud Platform (GCP)**](https://cloud.google.com/storage)
  - [**AWS S3**](https://aws.amazon.com/s3/) — including [S3-compatible object stores](#s3-compatible-object-storage) such as MinIO, Cloudian, or Garage (configured through the AWS S3 store with a custom endpoint)
  - [**Azure Blob Storage**](https://azure.microsoft.com/en-us/products/storage/blobs)

- **In-memory** storage can be used to store documents during the application's runtime. When the application is stopped, documents are lost. In-memory storage is not suitable for production use, as pods and memory are not shared across components. Files stored in memory are not persisted and will be lost on application restart.

If no storage configuration is provided, the default document storage is in-memory. However, in-memory storage is not supported in production environments, so a configuration update is required. This is because memory is not shared between pods or components, preventing services like Tasklist and Zeebe from accessing the same data. Additionally, all uploaded files are lost when the application restarts.

To change the storage to **Google Cloud Platform**, **AWS S3**, or **Azure Blob Storage**, update the `values.yaml` file with the storage configuration parameters.

The following `values.yaml` example shows the legacy configuration format. It generates deprecated `DOCUMENT_*` environment variables that are bridged to `camunda.document.*` properties at runtime. This approach still works but is deprecated. To use the new unified format instead, see [using the unified configuration format](#using-the-unified-configuration-format).

The example below represents part of the [default Helm chart values](https://github.com/camunda/camunda-platform-helm/blob/main/charts/camunda-platform-8.7/values.yaml) and shows the fields you need to change to enable the storage type of your preference.

**Note**
Azure Blob Storage configuration differs from AWS and GCP. Only the connection string secret is managed in `values.yaml` under `global.documentStore.type.azure`. All other Azure configuration (container name, class, endpoint, etc.) must be provided via [`extraConfiguration`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs). See the [Azure Blob Storage configuration](#azure-blob-storage-configuration) section below for details.

```
# Global configuration for variables which can be accessed by all sub charts
global:
    ## Document Store Configuration
    documentStore:
        activeStoreId: "inmemory"
        type:
            aws:
                ## @param global.documentStore.type.aws.enabled Enable AWS document store configuration.
                enabled: false
                ## @extra global.documentStore.type.aws.irsa configuration for AWS IAM role authentication, supporting both IRSA (IAM Roles for Service Accounts) and EKS Pod Identity.
                irsa:
                  ## @param global.documentStore.type.aws.irsa.enabled if true, no static AWS credentials are injected into pods, so the AWS SDK resolves credentials through its default provider chain; this supports both IRSA and EKS Pod Identity. If false (default), credentials are required via existingSecret or accessKeyId/secretAccessKey configuration.
                  enabled: false
                ## @param global.documentStore.type.aws.storeId Custom prefix for AWS. Default will generate env vars containing 'storeId' such as DOCUMENT_STORE_AWS_CLASS.
                storeId: "AWS"
                ## @param global.documentStore.type.aws.region AWS region for the S3 bucket. (example: us-east-1)
                region: ""
                ## @param global.documentStore.type.aws.bucket Name of the AWS S3 bucket.
                bucket: "your-aws-bucket"
                ## @param global.documentStore.type.aws.bucketPath [string, nullable] (Optional) Path/prefix within the S3 bucket.
                bucketPath: ""
                ## @param global.documentStore.type.aws.bucketTtl [int, nullable] (Optional) Time-to-live for documents in the S3 bucket (number in days).
                bucketTtl: 0
                ## @param global.documentStore.type.aws.endpoint (Optional) Endpoint URL for an S3-compatible object store (for example, http://minio.minio.svc.cluster.local:9000). When unset, the AWS SDK default endpoint is used.
                endpoint: ""
                ## @param global.documentStore.type.aws.forcePathStyle [nullable] (Optional) Force path-style addressing on the S3 client. When unset, path-style is auto-enabled if an endpoint is configured, otherwise the SDK default is used.
                forcePathStyle:
                ## @param global.documentStore.type.aws.chunkedEncodingEnabled [nullable] (Optional) Enable AWS chunked transfer encoding. Set to false for S3-compatible backends that do not support it (for example, Garage). When unset, the SDK default (true) is used.
                chunkedEncodingEnabled:
                ## @param global.documentStore.type.aws.class Fully qualified class name for the AWS document store provider.
                class: "io.camunda.document.store.aws.AwsDocumentStoreProvider"
                ## @extra global.documentStore.type.aws.accessKeyId configuration to provide the AWS access key ID.
                accessKeyId:
                  ## @param global.documentStore.type.aws.accessKeyId.secret.existingSecret can be used to reference an existing Kubernetes Secret containing the access key ID.
                  ## @param global.documentStore.type.aws.accessKeyId.secret.existingSecretKey defines the key within the existing secret object.
                  secret:
                    existingSecret: ""
                    existingSecretKey: "access-key-id"
                ## @extra global.documentStore.type.aws.secretAccessKey configuration to provide the AWS secret access key.
                secretAccessKey:
                  ## @param global.documentStore.type.aws.secretAccessKey.secret.existingSecret can be used to reference an existing Kubernetes Secret containing the secret access key.
                  ## @param global.documentStore.type.aws.secretAccessKey.secret.existingSecretKey defines the key within the existing secret object.
                  secret:
                    existingSecret: ""
                    existingSecretKey: "secret-access-key"
            gcp:
                ## @param global.documentStore.type.gcp.enabled Enable GCP document store configuration.
                enabled: false
                ## @param global.documentStore.type.gcp.storeId Custom prefix for GCP. Default will generate env vars containing 'storeId' such as DOCUMENT_STORE_GCP_CLASS.
                storeId: "GCP"
                ## @param global.documentStore.type.gcp.bucket Name of the GCP bucket.
                bucket: "your-gcp-bucket"
                ## @param global.documentStore.type.gcp.class Fully qualified class name for the GCP document store provider.
                class: "io.camunda.document.store.gcp.GcpDocumentStoreProvider"
                ## @param global.documentStore.type.gcp.existingSecret Reference to an existing Kubernetes secret containing GCP credentials.
                existingSecret: "gcp-credentials"
                ## @param global.documentStore.type.gcp.credentialsKey Key in the GCP credentials secret that contains the service-account JSON.
                credentialsKey: "service-account.json"
                ## @param global.documentStore.type.gcp.mountPath Mount path for the GCP credentials secret.
                mountPath: "/var/secrets/gcp"
                ## @param global.documentStore.type.gcp.fileName The file name for the GCP credentials JSON.
                fileName: "service-account.json"
            inmemory:
                ## @param global.documentStore.type.inmemory.enabled Enable in-memory document store configuration.
                enabled: true
                ## @param global.documentStore.type.inmemory.storeId Custom prefix for in-memory. Default will generate env vars containing 'storeId' such as DOCUMENT_STORE_INMEMORY_CLASS.
                storeId: "INMEMORY"
                ## @param global.documentStore.type.inmemory.class Fully qualified class name for the in-memory document store provider.
                class: "io.camunda.document.store.inmemory.InMemoryDocumentStoreProvider"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm
