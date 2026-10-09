# Document handling configuration in Docker Compose — Troubleshooting checksum issues

Some S3-compatible implementations cannot properly handle the checksum feature of the S3 client introduced with version 2.30.0. For more details, refer to [the AWS documentation](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/s3-checksums.html).

If checksum-related errors appear, disable automated checksum creation by setting these environment variables on your orchestration and connectors containers:

```
AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED
AWS_RESPONSE_CHECKSUM_VALIDATION=WHEN_REQUIRED
```

If you're still encountering issues with MD5 checksums required by your provider, enable legacy MD5 support by setting:

```
DOCUMENT_STORE_AWS_SUPPORT_LEGACY_MD5=true
```

AWS SDK credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) are resolved by the AWS SDK directly and are not part of `camunda.document.*`. Set them as environment variables as before.

| Credentials variable    | Required | Description                                                                          |
| ----------------------- | -------- | ------------------------------------------------------------------------------------ |
| `AWS_ACCESS_KEY_ID`     | Yes      | Access key ID used to interact with AWS S3 buckets.                                  |
| `AWS_SECRET_ACCESS_KEY` | Yes      | The AWS secret access key associated with `AWS_ACCESS_KEY_ID`, used to authenticate. |
| `AWS_REGION`            | Yes      | Region where the bucket is.                                                          |

By using **external cloud file bucket storage** with [**Google Cloud Platform (GCP)**](https://cloud.google.com/storage), documents can be stored in a secure and scalable way. Buckets are integrated per cluster to ensure proper isolation and environment-specific management.

```yaml
camunda:
  document:
    default-store-id: gcp1 # the instance ID defined below
    gcp:
      gcp1: # store instance ID — must match default-store-id
        bucket-name: my-gcp-bucket
        prefix: documents/ # optional
```

| Property                                | Required | Description                                                                                                                                                                 |
| --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.document.gcp.<id>.bucket-name` | Yes      | Name of the Google Cloud Storage bucket where documents are stored.                                                                                                         |
| `camunda.document.gcp.<id>.prefix`      | No       | Folder-like prefix within the GCS bucket. Defaults to `temp/` when unset. The value is used as written, with no separator appended, so a prefix isn't necessarily a folder. |
| `camunda.document.default-store-id`     | Yes      | Instance ID of the store to use as the default.                                                                                                                             |

Deprecated: legacy environment variable equivalents

```
DOCUMENT_STORE_GCP_CLASS=io.camunda.document.store.gcp.GcpDocumentStoreProvider
DOCUMENT_STORE_GCP_BUCKET=my-gcp-bucket
DOCUMENT_DEFAULT_STORE_ID=gcp
```

The GCP credential variable (`GOOGLE_APPLICATION_CREDENTIALS`) is resolved by the GCP SDK directly and is not part of `camunda.document.*`. Set it as an environment variable as before.

| Credentials variable             | Required | Description                                                                                                             |
| -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes      | Specifies the file path to a JSON key file that contains authentication credentials for a Google Cloud service account. |

By using **external cloud file bucket storage** with [**Azure Blob Storage**](https://azure.microsoft.com/en-us/products/storage/blobs), documents can be stored in a secure and scalable way.

Azure Blob Storage supports two authentication methods: connection string and DefaultAzureCredential (Managed Identity).

#### Prerequisites

- An Azure Storage account with a Blob container.
- For connection string authentication: The connection string from the Azure portal (**Settings > Access keys**).
- For Managed Identity/DefaultAzureCredential authentication: The `Storage Blob Data Contributor` RBAC role assigned on the storage account.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/docker
