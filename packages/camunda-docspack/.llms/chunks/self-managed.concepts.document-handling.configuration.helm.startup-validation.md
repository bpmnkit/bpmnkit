# Document handling configuration in Helm — Startup validation

The application validates the Document Store configuration at startup and fails with a clear error message in the following cases:

- **Duplicate store IDs across namespaces**: Each store instance ID must be unique across all provider namespaces (`aws`, `gcp`, `azure`, `local`, `in-memory`).
- **Missing required fields**: Required properties (for example, `bucket-name` for AWS or `container-name` for Azure) must be set.
- **Unknown `default-store-id`**: The value of `camunda.document.default-store-id` (or `activeStoreId` in Helm values) must match a configured store instance ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm
