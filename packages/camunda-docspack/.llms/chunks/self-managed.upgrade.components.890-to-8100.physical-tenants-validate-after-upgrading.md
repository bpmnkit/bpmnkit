# Upgrade Camunda components from 8.9 to 8.10 — Physical Tenants — Validate after upgrading

1. Confirm the cluster is operational with `GET /cluster/v2/status`.
2. Confirm the default tenant accepts work with `GET /physical-tenants/default/v2/topology`.
3. Run an existing unprefixed request, such as `GET /v2/topology`, and confirm it still succeeds.
4. Open Operate and Tasklist at their existing unprefixed URLs and confirm your data is present.

If a tenant-scoped request returns `404`, the tenant is not configured in the cluster. This is not an authorization failure. See [HTTP status codes](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing#http-status-codes).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
