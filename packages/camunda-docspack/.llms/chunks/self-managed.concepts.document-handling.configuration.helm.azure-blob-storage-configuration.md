# Document handling configuration in Helm — Azure Blob Storage configuration

Azure Blob Storage uses a different configuration pattern than AWS and GCP. Only the connection string secret is managed via `values.yaml` under `global.documentStore.type.azure`. All other configuration (container name, class, endpoint, etc.) must be provided by the user via `orchestration.extraConfiguration` and `connectors.extraConfiguration`.

This follows the same [`extraConfiguration` pattern](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs) used by other application-level settings in the 8.9+ chart.

### Prerequisites

- An Azure Storage account with a Blob container.
- For connection string authentication: The connection string from the Azure portal (**Settings > Access keys**).
- For Managed Identity/DefaultAzureCredential authentication: The `Storage Blob Data Contributor` RBAC role assigned on the storage account.

### Authentication options

Azure Blob Storage supports two authentication methods:

1. **Connection string** — simplest setup. The connection string is injected as a secret via `global.documentStore.type.azure.connectionString.secret`.
2. **DefaultAzureCredential** (recommended for AKS): Uses Workload Identity or Managed Identity. Set the `endpoint` in `extraConfiguration` instead of providing a connection string. Requires the `Storage Blob Data Contributor` RBAC role on the storage account.

### Connection string authentication

This example uses a connection string stored in a Kubernetes secret.

```yaml
global:
  documentStore:
    activeStoreId: "az1" # must match the store instance ID in extraConfiguration
    type:
      azure:
        connectionString:
          secret:
            existingSecret: "azure-storage-credentials"
            existingSecretKey: "connection-string"

orchestration:
  extraConfiguration:
    - file: azure-documentstore.yaml
      content: |
        camunda:
          document:
            azure:
              az1: # store instance ID — must match activeStoreId
                container-name: my-container

connectors:
  extraConfiguration:
    - file: azure-documentstore.yaml
      content: |
        camunda:
          document:
            azure:
              az1: # store instance ID — must match activeStoreId
                container-name: my-container
```

### Managed Identity/DefaultAzureCredential

When using AKS Workload Identity or Managed Identity, omit the connection string secret and set the `endpoint` instead:

```yaml
global:
  documentStore:
    activeStoreId: "az1" # must match the store instance ID in extraConfiguration
    # No connectionString secret needed — DefaultAzureCredential handles auth

orchestration:
  extraConfiguration:
    - file: azure-documentstore.yaml
      content: |
        camunda:
          document:
            azure:
              az1: # store instance ID — must match activeStoreId
                container-name: my-container
                endpoint: https://myaccount.blob.core.windows.net

connectors:
  extraConfiguration:
    - file: azure-documentstore.yaml
      content: |
        camunda:
          document:
            azure:
              az1: # store instance ID — must match activeStoreId
                container-name: my-container
                endpoint: https://myaccount.blob.core.windows.net
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm
