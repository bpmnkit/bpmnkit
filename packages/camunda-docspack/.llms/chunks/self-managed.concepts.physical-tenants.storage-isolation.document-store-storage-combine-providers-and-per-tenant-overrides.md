# Storage isolation — Document Store storage — Combine providers and per-tenant overrides

A tenant's `assigned` stores don't have to share a provider, and a global store can be combined with a tenant-specific one. Every store still has to satisfy the comparison rules for its own provider.

**Hybrid:** A global default store plus a tenant-specific store.

```yaml
camunda:
  document:
    aws:
      default-s3:
        bucket-name: "camunda-documents-default"
  physical-tenants:
    default:
      document:
        assigned: [default-s3]
        default-store-id: default-s3
        aws:
          default-s3:
            # Required. Without a path, this tenant owns the bucket root, which
            # encloses every other tenant's path in the same bucket.
            bucket-path: "default"
    tenanta:
      document:
        assigned: [default-s3, tenant-a-compliance]
        default-store-id: tenant-a-compliance
        aws:
          tenant-a-compliance:
            bucket-name: "camunda-documents-tenant-a-compliance"
          default-s3:
            bucket-path: "tenant-a"
```

**Mixed providers:** A shared GCP store for both tenants, plus an Azure store for one of them.

```yaml
camunda:
  document:
    gcp:
      default-gcs:
        bucket-name: "camunda-documents-default"
  physical-tenants:
    default:
      document:
        assigned: [default-gcs]
        default-store-id: default-gcs
        gcp:
          default-gcs:
            prefix: "default/"
    tenanta:
      document:
        assigned: [default-gcs, tenant-a-blob]
        default-store-id: tenant-a-blob
        gcp:
          default-gcs:
            prefix: "tenant-a/"
        azure:
          tenant-a-blob:
            container-name: "camunda-documents-tenant-a"
```

Overlap is only ever reported between two different tenants. One tenant may spread its documents across several stores whose prefixes overlap, because reaching its own documents isn't a leak.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
