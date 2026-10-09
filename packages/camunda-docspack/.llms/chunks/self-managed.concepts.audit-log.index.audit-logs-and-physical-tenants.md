# Audit log — Audit logs and Physical Tenants

Audit records are stored in the secondary-storage location configured for the Physical Tenant where the operation occurred. Query a tenant's records through its tenant-scoped API path, for example `POST /physical-tenants/{physicalTenantId}/v2/audit-logs/search`. The unprefixed `POST /v2/audit-logs/search` endpoint queries the default Physical Tenant. See [search audit logs](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-audit-logs.api) for request filters and response fields.

The API's `tenantId` field and filter refer to a Logical Tenant within the selected Physical Tenant. They do not select a Physical Tenant. Physical Tenant scope comes from the request path. For details about tenant-scoped API routing, see [API routing for Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/audit-log/index
