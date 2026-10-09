# Physical Tenant isolation model — Document store details

Document stores are declared once in the root `camunda.document.*` catalog. Each Physical Tenant inherits the catalog and overrides only the fields it needs, typically the bucket path or prefix, to ensure its data is written to a distinct location.

Isolation is enforced by validating the resolved `provider, bucket/container, path` tuple at startup. If two tenants resolve to the same tuple, Camunda fails startup and names the conflicting tenants in the error.

For configuration examples covering shared buckets with per-tenant paths, dedicated buckets per tenant, and GCP prefix isolation, see [document store storage](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#document-store-storage).

For the storage backends used by tenant-scoped data, see [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) and [document handling configuration](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/index).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
