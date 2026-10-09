# Provisioning and lifecycle

Learn how to provision and manage Physical Tenants, including restart behavior and out-of-scope operations.


## Provisioning model

Physical Tenants are provisioned through static application configuration.

- Add or change tenant configuration in application config.
- Apply the change with a rolling restart.
- Validate startup status for every affected component.

Dynamic runtime tenant creation and runtime tenant updates are not available.


## Add a new Physical Tenant

To add a tenant:

1. Add a new `camunda.physical-tenants.<tenant-key>` section in configuration.
2. Define the tenant-specific initialization and required assignments.
3. Ensure required storage and identity configuration is valid.
4. Apply the change through a rolling restart.

You can add multiple new Physical Tenants in the same configuration change and rolling restart. You do not need to add them one at a time.

### Rolling restart expectations

Existing Physical Tenants keep running during a rolling restart to add a new tenant. Any interference they experience is the normal interference of a rolling restart itself, not something caused specifically by the new tenant's addition.

During a rolling restart for tenant provisioning:

- Existing tenants continue processing requests throughout the restart, subject to your normal rollout strategy.
- New tenant availability starts after updated components are running and ready.
- Startup validation failures block readiness for affected components.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle
