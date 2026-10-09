# Provisioning and lifecycle — Out of scope

The following capabilities are out of scope:

- Dynamic tenant creation without restart
- Tenant deletion
- Runtime tenant updates


## Upgrade behavior from 8.9

For single-tenant 8.9 clusters upgrading to 8.10:

- Existing root-level configuration becomes the `default` Physical Tenant behavior.
- No explicit migration step is required for this default mapping.


## Operational guidance

Before applying provisioning changes:

- Validate tenant IDs and property paths.
- Validate identity provider assignments.
- Validate storage isolation settings per tenant.
- Plan and execute a rolling restart window.

After rollout:

- Verify tenant-scoped APIs route to expected tenant context.
- Verify storage isolation and startup health.
- Verify authentication behavior for assigned providers.

**Note: Related pages**

- [Configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference)
- [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index)
- [Backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle
