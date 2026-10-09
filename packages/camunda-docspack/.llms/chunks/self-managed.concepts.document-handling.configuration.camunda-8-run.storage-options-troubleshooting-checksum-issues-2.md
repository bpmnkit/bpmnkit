# Document handling configuration in Camunda 8 Run — Storage options — Troubleshooting checksum issues (2)

**Example (connection string):**

```yaml
camunda:
  document:
    default-store-id: az1 # the instance ID defined below
    azure:
      az1: # store instance ID — must match default-store-id
        container-name: my-container
        connection-string: "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...;EndpointSuffix=core.windows.net"
        container-path: documents/ # optional
```

**Example (DefaultAzureCredential/Managed Identity):**

```yaml
camunda:
  document:
    default-store-id: az1 # the instance ID defined below
    azure:
      az1: # store instance ID — must match default-store-id
        container-name: my-container
        endpoint: "https://myaccount.blob.core.windows.net"
        container-path: documents/ # optional
```

| Property                                        | Required    | Description                                                                                                                                     |
| ----------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.document.azure.<id>.container-name`    | Yes         | Name of the Azure Blob Storage container.                                                                                                       |
| `camunda.document.azure.<id>.connection-string` | Conditional | Azure Storage connection string. Required unless using DefaultAzureCredential.                                                                  |
| `camunda.document.azure.<id>.endpoint`          | Conditional | Storage account endpoint (for example, `https://myaccount.blob.core.windows.net`). Required when using DefaultAzureCredential/Managed Identity. |
| `camunda.document.azure.<id>.container-path`    | No          | Optional path/prefix within the container.                                                                                                      |
| `camunda.document.default-store-id`             | Yes         | Instance ID of the store to use as the default.                                                                                                 |

Deprecated: legacy environment variable equivalents

Connection string:

```
DOCUMENT_STORE_AZURE_CLASS=io.camunda.document.store.azure.AzureBlobDocumentStoreProvider
DOCUMENT_STORE_AZURE_CONTAINER=my-container
DOCUMENT_STORE_AZURE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...;EndpointSuffix=core.windows.net
DOCUMENT_DEFAULT_STORE_ID=azure
```

DefaultAzureCredential/Managed Identity:

```
DOCUMENT_STORE_AZURE_CLASS=io.camunda.document.store.azure.AzureBlobDocumentStoreProvider
DOCUMENT_STORE_AZURE_CONTAINER=my-container
DOCUMENT_STORE_AZURE_ENDPOINT=https://myaccount.blob.core.windows.net
DOCUMENT_DEFAULT_STORE_ID=azure
```

**In-memory** storage can be used to store documents during the application's runtime. When the application is stopped, documents are lost.

In-memory storage is not suitable for production use, as pods and memory are not shared across components. Files stored in memory are not persisted and will be lost on application restart.

In-memory is the default when no storage configuration is provided. To use in-memory explicitly when other stores are also configured:

```yaml
camunda:
  document:
    default-store-id: inmemory1 # the instance ID defined below
    in-memory:
      inmemory1: {} # store instance ID — must match default-store-id
```

| Property                            | Required | Description                                                                 |
| ----------------------------------- | -------- | --------------------------------------------------------------------------- |
| `camunda.document.in-memory.<id>`   | Yes      | Declares an in-memory store instance. The value is an empty mapping (`{}`). |
| `camunda.document.default-store-id` | Yes      | Instance ID of the store to use as the default.                             |

Deprecated: legacy environment variable equivalents

```
DOCUMENT_STORE_INMEMORY_CLASS=io.camunda.document.store.inmemory.InMemoryDocumentStoreProvider
DOCUMENT_DEFAULT_STORE_ID=inmemory
```

**Local storage** can be configured for a cluster to store documents in a local folder. It can be used only for local development with [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run).

Local storage is not suitable for production use, as pods and file paths are not shared across components. This prevents components like Tasklist and Zeebe from accessing the same data. Files are stored locally, and their retention must be managed manually.

```yaml
camunda:
  document:
    default-store-id: local1 # the instance ID defined below
    local:
      local1: # store instance ID — must match default-store-id
        path: /usr/local/camunda/documents
```

| Property                            | Required | Description                                                                                                                                                    |
| ----------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.document.local.<id>.path`  | Yes      | Path to the directory where uploaded files are stored. Use `/usr/local/camunda/documents` — it is pre-created with the right permissions for the process user. |
| `camunda.document.default-store-id` | Yes      | Instance ID of the store to use as the default.                                                                                                                |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/camunda-8-run
