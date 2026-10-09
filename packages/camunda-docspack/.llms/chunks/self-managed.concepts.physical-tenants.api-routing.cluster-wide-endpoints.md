# API routing for Physical Tenants — Cluster-wide endpoints

A cluster-wide endpoint applies to the whole cluster rather than a single Physical Tenant. Cluster-wide operations are exposed under a dedicated `/cluster/v2/...` path prefix. See [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) for the operations this prefix serves, their authentication requirements, and how to configure access.

The `/v2/status` endpoint is a special case; see [the exception below](#exception-v2status).

Most other endpoints are scoped to a Physical Tenant, even when they are not tenant-specific in nature. A plain `/v2/...` request targets the `default` tenant. For example:

- `/v2/topology` returns the topology for the targeted Physical Tenant (the `default` tenant when no tenant prefix is used), not a cluster-wide view. For the cluster-wide topology, use `/cluster/v2/topology`.
- `/v2/license` returns the license status and is available per Physical Tenant, including on the default path (`/v2/license`). It is not a separate cluster-wide endpoint.

### Exception: /v2/status

`/v2/status` is scoped to the default Physical Tenant. It is available unprefixed and at `/physical-tenants/default/v2/status`, and returns `404` for any other tenant ID. It is unauthenticated, so load balancers can probe it without credentials. For cluster-wide status, use `/cluster/v2/status`; for one tenant's partition health, use `/physical-tenants/{id}/v2/topology`.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing
