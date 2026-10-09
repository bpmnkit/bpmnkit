# Troubleshoot Physical Tenants — API routing problems

### Requests reach the wrong tenant

A request without a tenant prefix routes to the `default` Physical Tenant. If calls you expect to reach `tenanta` are returning `default` tenant data, the tenant segment is missing from the path or the gRPC header.

Check the following:

- REST calls use the `/physical-tenants/{id}/v2/...` form. The tenant segment comes **before** `/v2/`.
- gRPC calls send the `Camunda-Physical-Tenant` metadata header.
- If you use the Java client, `physicalTenantId` is set on the client. A single client instance targets exactly one tenant.
- If your REST address already contains a `/physical-tenants/{id}` segment, for example behind a reverse proxy, `prefixPhysicalTenantPath(false)` is set so the client does not insert the segment twice.

For client-side configuration, see [Physical Tenants in the Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/physical-tenants).

### Interpret the status code

| Status                    | Meaning                                                                                                                      |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized`        | The tenant exists, but credentials are missing or invalid, or the token was issued by a provider the tenant does not assign. |
| `403 Forbidden`           | The caller authenticated but lacks authorization within that tenant.                                                         |
| `404 Not Found`           | The tenant is not configured in the cluster, or has been removed from configuration and is disabled.                         |
| `503 Service Unavailable` | The tenant exists but its secondary storage is degraded. Retry after the interval in `Retry-After`.                          |

A `404` for a tenant path is not an authorization failure. The tenant does not exist in the cluster configuration, so authentication was never attempted. A tenant that was removed from configuration is disabled and also returns `404`, with its data retained.

**Note**
When no Physical Tenant is explicitly configured, requests to `/physical-tenants/default/...` can return `404` even though the implicit default tenant is addressable at the unprefixed path. Configure the default tenant explicitly if you need the prefixed form to resolve.

### Existing integrations after upgrading

Unprefixed paths continue to work in 8.10 and route to the default Physical Tenant. When Physical Tenants are configured, `/operate` and `/physical-tenants/default/operate` address the same application, and the same holds for Tasklist. Upgrading a single-tenant cluster does not require client changes.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
