# Document handling configuration in Docker Compose — API client permission requirements

### AWS S3

The API client must have the following AWS Identity and Access Management (IAM) permissions:

| Permission        | Description                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `s3:DeleteObject` | This permission authorizes the API client to remove objects from the specified S3 bucket.                                                                                                                                       |
| `s3:GetObject`    | This permission is required to retrieve contents and metadata of objects from Amazon S3. The API client will utilize this permission to download or access the contents of the documents that have been uploaded to the bucket. |
| `s3:ListBucket`   | This permission allows the application to verify it has access to the specified S3 bucket. Lack of this permission does not prevent the application from starting, but it logs a warning on application start-up.               |
| `s3:PutObject`    | To upload documents to an Amazon S3 bucket, the API client must have this permission.                                                                                                                                           |

### GCP

The API client must have the following permissions:

| Permission                     | Description                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storage.buckets.get`          | This permission allows the application to verify it has access to the specified bucket. Lack of this permission does not prevent the application from starting, but it logs a warning on application start-up. |
| `storage.objects.get`          | This permission allows the API client to retrieve objects from Google Cloud Storage. It is vital for downloading or accessing the contents of stored objects.                                                  |
| `storage.objects.create`       | With this permission, the API client can upload new objects to a bucket. It is essential for adding new documents to the storage.                                                                              |
| `storage.objects.update`       | This permission enables the API client to update contents and metadata of existing objects within a bucket.                                                                                                    |
| `storage.objects.delete`       | This permission grants the API client the ability to delete objects from a bucket.                                                                                                                             |
| `iam.serviceAccounts.signBlob` | This permission allows the service account to sign data as part of the process to create secure, signed URLs for accessing uploaded documents.                                                                 |

### Azure Blob Storage

To use document handling with Azure Blob Storage, assign the `Storage Blob Data Contributor` RBAC role to the identity on the storage account. This role grants the following permissions:

| Permission                                                               | Description                      |
| ------------------------------------------------------------------------ | -------------------------------- |
| `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read`   | Read blob content and metadata.  |
| `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write`  | Create or update blobs.          |
| `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/delete` | Delete blobs from the container. |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/docker
