# Troubleshoot Physical Tenants — Storage problems — Index or schema not found for a specific tenant

Confirm the tenant's resolved storage location matches what exists in the backend:

- **RDBMS**: the schema or table prefix in the tenant's configuration exists and the tenant's credentials can reach it.
- **Elasticsearch or OpenSearch**: the tenant's `index-prefix` matches the indices actually present.
- **Document store**: the resolved provider, bucket or container, and path tuple points where you expect.

Startup validation catches two tenants resolving to the _same_ location, but it does not catch a tenant pointing at a location that does not exist yet.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
