# Troubleshoot Physical Tenants — Storage problems

### Index or schema not found for a specific tenant

Confirm the tenant's resolved storage location matches what exists in the backend:

- **RDBMS**: the schema or table prefix in the tenant's configuration exists and the tenant's credentials can reach it.
- **Elasticsearch or OpenSearch**: the tenant's `index-prefix` matches the indices actually present.
- **Document store**: the resolved provider, bucket or container, and path tuple points where you expect.

Startup validation catches two tenants resolving to the _same_ location, but it does not catch a tenant pointing at a location that does not exist yet.

### Overlapping index prefixes

Startup validation only rejects prefixes that are exactly identical. Prefixes where one is the leading substring of another, such as `eu` and `eu-west`, pass validation but cause `eu*` wildcard queries to match both tenants' indices. Use full tenant IDs as prefixes.

### Verify isolation

To confirm two tenants are genuinely isolated:

- Inspect the backend directly and confirm each tenant's schema, index prefix, or document path contains only that tenant's data.
- Call the same search endpoint under two different tenant prefixes and confirm the result sets do not overlap.
- Confirm no single API call returns data from more than one tenant. Every request targets exactly one Physical Tenant, so cross-tenant results indicate a shared storage location rather than a query problem.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
