# Troubleshoot Physical Tenants — Storage problems — Verify isolation

To confirm two tenants are genuinely isolated:

- Inspect the backend directly and confirm each tenant's schema, index prefix, or document path contains only that tenant's data.
- Call the same search endpoint under two different tenant prefixes and confirm the result sets do not overlap.
- Confirm no single API call returns data from more than one tenant. Every request targets exactly one Physical Tenant, so cross-tenant results indicate a shared storage location rather than a query problem.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
