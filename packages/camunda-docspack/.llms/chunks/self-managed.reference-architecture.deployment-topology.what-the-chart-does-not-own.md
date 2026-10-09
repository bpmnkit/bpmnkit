# Camunda 8.10 deployment topology — What the chart does not own

The chart deploys workloads and wires them to the endpoints you give it. Everything below is yours to provide, and every URL you configure must be reachable from the release that uses it.

| Concern                                                        | Owner                                      |
| -------------------------------------------------------------- | ------------------------------------------ |
| OIDC provider, its clients, and its pinned issuer              | You                                        |
| Cross-namespace and cross-cluster DNS, routing, and TLS trust  | You                                        |
| NetworkPolicies and firewall rules                             | You                                        |
| Management Identity and Camunda Hub relational databases       | You                                        |
| Orchestration Cluster and Optimize secondary storage           | You                                        |
| Index retention and deletion, including after a Helm uninstall | You                                        |
| Kubernetes workloads, services, secrets wiring, and volumes    | The chart                                  |
| Management Identity presets and Camunda Hub cluster inventory  | The chart, from `global.topology.clusters` |

Camunda 8.10 bundles no Elasticsearch, PostgreSQL, or Keycloak subcharts. Provision these before you install. See [deploy required dependencies](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology
