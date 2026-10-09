# Document handling configuration — Physical Tenant isolation

When running Physical Tenants, each tenant must be assigned a distinct document store location. Camunda validates uniqueness at startup and fails if two tenants resolve to the same `provider, bucket/container, path` tuple.

For the per-tenant configuration model, including the root catalog, `assigned` restriction, field-level overrides, and startup collision examples, see [document store isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference#document-store-isolation).


## Storage policies

- **Maximum upload size for one or multiple files**: 10 MB
- **File expiration time/time-to-live (TTL) policy**: With Self-Managed, users may define their own lifecycle policies. A custom expiration date can be specified via metadata for each document. The [document upload API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api) allows this. You can only set a custom expiration date earlier than the bucket's TTL; requesting a later date results in it being capped to the bucket's TTL. For forms, this defaults to the cluster configuration as there is no set custom TTL for forms.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/index
