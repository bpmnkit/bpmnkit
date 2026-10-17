# Install the Camunda Hub release — The cluster record

Each entry in `global.topology.clusters` is the single source for both Management Identity presets and Camunda Hub inventory, so client IDs, audiences, roles, and endpoints can't drift apart.

Each record declares a stable unique `id`, the enabled workload components with their client and audience identifiers, the context paths, and the namespace and release name used to derive service endpoints.

Each component in a cluster record needs its own client ID, and the `orchestration` and `optimize` components also need an audience. Regardless of the identity provider, every client ID and audience must be unique: the chart rejects a value that another component, another record, or one of the Hub release's own clients already uses. The chart defaults, such as `orchestration` and `orchestration-api`, can belong to one record at most. Give the other records their own, for example `orchestration-<id>`, `optimize-<id>`, and `connectors-<id>`. With Keycloak, clients with the same ID in one realm would also be one client, so the clusters would overwrite each other's redirect URLs.

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
