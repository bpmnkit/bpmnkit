# Configure Physical Tenants across releases — Override the secret store per tenant

`orchestration.secretStore.physicalTenants` deep-overlays the root secret store for a named tenant. Tenant IDs here may contain letters, digits, underscores, and hyphens.

A tenant must use the same provider and the same `default` store ID as the root store it overrides. Exactly one default store applies per tenant.


## Operate releases in dependency order

Use these orders for both Helm and GitOps reconciliation.

| Operation                  | Order                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Install                    | Hub, each Orchestration Cluster, then its default and Physical Tenant Optimize releases                                           |
| Add a tenant               | Add its Hub record, add its Orchestration tenant and exporter, then install its Optimize release                                  |
| Disable or remove a tenant | Stop or uninstall its Optimize release, remove its Orchestration tenant and exporter, then disable or remove its Hub record       |
| Re-enable a tenant         | Restore its Hub record, restore its Orchestration tenant and exporter, then reinstall its Optimize release with the same prefixes |
| Upgrade                    | Hub first, then Orchestration Clusters, then their Optimize releases. Complete and verify each layer before continuing            |
| Uninstall the topology     | All Optimize releases, all Orchestration Cluster releases, then the Hub release                                                   |

Adding a Physical Tenant requires a rolling restart of the Orchestration Cluster. See [provisioning and lifecycle](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
