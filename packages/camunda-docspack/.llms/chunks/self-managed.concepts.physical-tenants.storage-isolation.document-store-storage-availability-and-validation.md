# Storage isolation — Document Store storage — Availability and validation

- **At startup**: Warning if bucket is missing or credentials are invalid; cluster continues
- **At runtime**: An error is returned when a tenant tries to create/retrieve a document if the store is unavailable
- **Validation**: The cluster fails to start if two Physical Tenants resolve to overlapping document store locations. See [Compare document store locations across tenants](#compare-document-store-locations-across-tenants)
- **Subpath structure**: Each tenant writes to the prefix you configure, such as `bucket-path` for AWS. Camunda doesn't insert the tenant ID into the path for you

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
