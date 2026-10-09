# Document handling configuration in Docker Compose — Property mapping reference

Use this table to migrate from legacy `DOCUMENT_*` environment variables to the unified `camunda.document.*` properties.

### Root-level

| Legacy environment variable | Unified property                    |
| --------------------------- | ----------------------------------- |
| `DOCUMENT_DEFAULT_STORE_ID` | `camunda.document.default-store-id` |
| `DOCUMENT_THREAD_POOL_SIZE` | `camunda.document.thread-pool-size` |

### AWS S3

| Legacy environment variable                             | Unified property                                     |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `DOCUMENT_STORE_<id>_CLASS=...AwsDocumentStoreProvider` | Implicit — use the `aws` namespace                   |
| `DOCUMENT_STORE_<id>_BUCKET`                            | `camunda.document.aws.<id>.bucket-name`              |
| `DOCUMENT_STORE_<id>_BUCKET_PATH`                       | `camunda.document.aws.<id>.bucket-path`              |
| `DOCUMENT_STORE_<id>_BUCKET_TTL`                        | `camunda.document.aws.<id>.bucket-ttl`               |
| `DOCUMENT_STORE_<id>_ENDPOINT`                          | `camunda.document.aws.<id>.endpoint`                 |
| `DOCUMENT_STORE_<id>_FORCE_PATH_STYLE`                  | `camunda.document.aws.<id>.force-path-style`         |
| `DOCUMENT_STORE_<id>_CHUNKED_ENCODING_ENABLED`          | `camunda.document.aws.<id>.chunked-encoding-enabled` |

### GCP

| Legacy environment variable                             | Unified property                        |
| ------------------------------------------------------- | --------------------------------------- |
| `DOCUMENT_STORE_<id>_CLASS=...GcpDocumentStoreProvider` | Implicit — use the `gcp` namespace      |
| `DOCUMENT_STORE_<id>_BUCKET`                            | `camunda.document.gcp.<id>.bucket-name` |
| `DOCUMENT_STORE_<id>_PREFIX`                            | `camunda.document.gcp.<id>.prefix`      |

### Azure Blob

| Legacy environment variable                                   | Unified property                                |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `DOCUMENT_STORE_<id>_CLASS=...AzureBlobDocumentStoreProvider` | Implicit — use the `azure` namespace            |
| `DOCUMENT_STORE_<id>_CONTAINER`                               | `camunda.document.azure.<id>.container-name`    |
| `DOCUMENT_STORE_<id>_CONTAINER_PATH`                          | `camunda.document.azure.<id>.container-path`    |
| `DOCUMENT_STORE_<id>_CONNECTION_STRING`                       | `camunda.document.azure.<id>.connection-string` |
| `DOCUMENT_STORE_<id>_ENDPOINT`                                | `camunda.document.azure.<id>.endpoint`          |

### Local storage

| Legacy environment variable                                      | Unified property                     |
| ---------------------------------------------------------------- | ------------------------------------ |
| `DOCUMENT_STORE_<id>_CLASS=...LocalStorageDocumentStoreProvider` | Implicit — use the `local` namespace |
| `DOCUMENT_STORE_<id>_PATH`                                       | `camunda.document.local.<id>.path`   |

### In-memory

| Legacy environment variable                                  | Unified property                         |
| ------------------------------------------------------------ | ---------------------------------------- |
| `DOCUMENT_STORE_<id>_CLASS=...InMemoryDocumentStoreProvider` | Implicit — use the `in-memory` namespace |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/docker
