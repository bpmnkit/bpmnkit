# Configuration reference — Required and optional properties per tenant

Each configured tenant under `camunda.physical-tenants.<tenant-key>` must assign at least one cluster-defined identity provider through `security.authentication.providers.assigned`. All other tenant-level properties are optional overrides of the root-level defaults.

Identity providers are defined at the cluster level, then assigned per tenant. Physical Tenants do not define tenant-local provider objects.

For the full list of available properties, see the [Orchestration Cluster configuration properties](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties) reference.


## Cluster-wide defaults and per-tenant overrides

Use root-level `camunda.*` for shared defaults across all tenants.

Use `camunda.physical-tenants.<tenant-key>.*` only for tenant-specific differences.

Some properties are cluster-scoped and cannot be overridden per tenant. Per-tenant override behavior is indicated in the [Orchestration Cluster configuration properties](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties) reference.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference
