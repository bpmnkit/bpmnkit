# Configure Physical Tenants across releases — Where each part of a tenant is configured

| Concern                                           | Release       | Configured with                                                          |
| ------------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| The tenant itself, its storage, and its exporters | Orchestration | `orchestration.extraConfiguration`, as `camunda.physical-tenants.<id>.*` |
| Per-tenant secret store overrides                 | Orchestration | `orchestration.secretStore.physicalTenants`                              |
| The tenant's Optimize client and resource server  | Hub           | `global.topology.clusters[].physicalTenants[]`                           |
| The tenant's Optimize workload                    | Optimize      | A release with `global.topology.mode: optimize`                          |

The tenant ID must be identical in all three places.

**Note**
The chart exposes no `orchestration.physicalTenants` values schema. A tenant's own configuration is application configuration, so it's set through `extraConfiguration` rather than typed chart values. The chart detects that tenants are declared only to enforce its own input constraints. See [Helm and application configuration responsibilities](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
