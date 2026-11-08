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

[Purging](https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge) removes the data of one tenant when you pass `physicalTenant={physicalTenantId}`, and the data of every tenant when you omit it. Removing a tenant from configuration disables it without deleting persisted data. These are separate operations.

A Physical Tenant's enabled state follows its configuration directly:

- **Present in configuration:** The tenant is enabled.
- **Removed from configuration:** The tenant is disabled. The cluster stops processing requests for that tenant, and the API returns `404 Not Found` for requests scoped to it. No data is deleted.
- **Re-added to configuration:** The tenant is re-enabled with its existing data. Nothing needs to be re-created.

Each of these transitions takes effect through the same rolling restart used for any other configuration change.

### Logically remove a disabled tenant

A disabled tenant still appears in the persisted cluster topology, which blocks operations that require every tenant to be accounted for, such as multi-region failover.

The Cluster API logically removes a tenant that you have already removed from configuration with `DELETE /actuator/cluster/physical-tenants/{physicalTenantId}`. It drops the tenant from the cluster topology and **deletes no data**. This is not a delete API, and it is not a way to reclaim storage.

To delete a tenant's data, take these steps in order:

1. Purge the tenant with `POST /actuator/cluster/purge?physicalTenant={physicalTenantId}`. Always include the `physicalTenant` parameter. Without it, the purge removes the data of every Physical Tenant. See [data purge](https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge).
1. Wait until the purge completes. The purge is asynchronous: poll `GET /actuator/cluster` until `lastChange.id` reaches the `changeId` the purge returned, as shown in [data purge](https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge). The cluster rejects another configuration change while one is in progress.
1. Remove the tenant from configuration and apply the change with a rolling restart.
1. Logically remove the tenant with the endpoint above.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle
