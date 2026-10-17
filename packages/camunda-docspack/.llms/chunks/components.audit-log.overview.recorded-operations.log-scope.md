# Recorded operations — Log scope

`ADMIN` and `BATCH` operations are not scoped to a particular tenant. Instead, they're applied at a global scope because Identity-related operations don't belong to an individual tenant and batch operations may include items from multiple tenants.

Keep this in mind when you filter by tenant ID with the [search audit logs API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-audit-logs.api) or the [Operate user interface](https://docs.camunda.io/docs/next/components/operate/userguide/audit-operations). As these operations aren't scoped to a tenant, selecting a particular tenant ID will filter out these operations.

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview/recorded-operations
