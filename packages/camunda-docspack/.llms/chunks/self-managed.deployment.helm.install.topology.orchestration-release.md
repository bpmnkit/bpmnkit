# Install an Orchestration Cluster release

Install an execution plane: a Helm release with global.topology.mode set to orchestration, running one Orchestration Cluster and Connectors.

An orchestration release is an execution plane. It runs one Orchestration Cluster and Connectors, and connects to the Management Identity service in the Hub release.

Install it after the [Hub release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release) is healthy. You can install any number of orchestration releases against one Hub.


## What an orchestration release deploys

`global.topology.mode: orchestration` deploys the Orchestration Cluster and Connectors, and never renders Management Identity or Camunda Hub, even if a converted values file still enables them.

Optimize is different. If `optimize.enabled: true` is set, the release still runs Optimize, and the chart then also renders the exporter Optimize reads. In the split topology, set `optimize.enabled: false` here and run Optimize as its [own release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release).

An orchestration release is self-contained. Its existing component values remain authoritative for its enabled state, authentication, storage, scaling, and Kubernetes configuration. `global.topology.mode` selects the release role; it doesn't duplicate component configuration, and the release never declares sibling clusters.

| Requirement                               | Reason                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `orchestration.enabled: true`             | This is the workload the release exists to run                            |
| `global.identity.auth.enabled: true`      | Enables OIDC authentication for the orchestration workloads               |
| `identity.enabled: false`                 | Management Identity runs only in the Hub release                          |
| A non-empty `global.identity.service.url` | This release runs no Identity of its own, so it must be told where one is |

The chart fails the render with a `[camunda][error]` message if any of these is missing.

The component client IDs, audiences, redirect URLs, and secrets must match the clients declared in the matching Hub cluster record. A mismatch authenticates against a client Hub doesn't know about.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
