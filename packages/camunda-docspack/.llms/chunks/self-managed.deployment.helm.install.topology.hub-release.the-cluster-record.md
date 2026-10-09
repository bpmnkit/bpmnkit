# Install the Camunda Hub release — The cluster record

Each entry in `global.topology.clusters` is the single source for both Management Identity presets and Camunda Hub inventory, so client IDs, audiences, roles, and endpoints can't drift apart.

Each record declares a stable unique `id`, the enabled workload components with their client and audience identifiers, the context paths, and the namespace and release name used to derive service endpoints.

| Field                             | Purpose                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `id`                              | Stable unique identifier for the cluster. Changing it creates a new Hub inventory entry        |
| `name`                            | Display name in Camunda Hub                                                                    |
| `namespace`, `releaseName`        | Used to generate in-cluster service endpoints                                                  |
| `host`                            | Public hostname of the Orchestration Cluster                                                   |
| `version`                         | The Camunda version deployed by that release                                                   |
| `architecture`                    | `unified` (default) or `legacy`. Set `legacy` for a chart 8.7 cluster                          |
| `contextPaths`                    | Sub-paths each component is served on                                                          |
| `components.<component>`          | Enabled state, `clientId`, `audience`, `redirectUrl`, and `secret` for each workload component |
| `components.<component>.roleName` | A per-cluster role name, instead of the shared canonical role                                  |
| `physicalTenants`                 | One entry per Physical Tenant that runs its own Optimize release                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release
