# Provisioning and lifecycle — Default tenant lifecycle

The default Physical Tenant is always present and immutable:

- You cannot delete the default tenant.
- You cannot rename the default tenant.
- You cannot disable the default tenant.

If tenant scope is omitted in compatibility paths, requests resolve to the default tenant.


## Disable, rename, and delete

- Disabling and re-enabling a Physical Tenant is supported through configuration. There is no dedicated API for this operation.
- Renaming a Physical Tenant is not supported.
- Deleting a Physical Tenant is not supported. No single API removes a tenant's configuration and its data together.

Purging removes data for a tenant or for every tenant when you scope it that way; removing a tenant from configuration disables it without deleting persisted data. These are separate operations.

A Physical Tenant's enabled state follows its configuration directly:

- **Present in configuration:** The tenant is enabled.
- **Removed from configuration:** The tenant is disabled. The cluster stops processing requests for that tenant, and the API returns `404 Not Found` for requests scoped to it. No data is deleted.
- **Re-added to configuration:** The tenant is re-enabled with its existing data. Nothing needs to be re-created.

Each of these transitions takes effect through the same rolling restart used for any other configuration change.

### Logically remove a disabled tenant

A disabled tenant still appears in the persisted cluster topology, which blocks operations that require every tenant to be accounted for, such as multi-region failover.

An actuator endpoint logically removes a tenant that you have already removed from configuration. It drops the tenant from the cluster topology and **deletes no data**. This is not a delete API, and it is not a way to reclaim storage. To remove a tenant's data, act on its schema, indices, or document store directly in the backend.

<!-- TODO: Add the exact actuator path and required permission for logical removal. Lena Schoenburg confirmed the behavior in Slack on (no delete API; endpoint deletes no data; exists so a disabled tenant does not block multi-region failover) but did not name the endpoint. -->

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle
