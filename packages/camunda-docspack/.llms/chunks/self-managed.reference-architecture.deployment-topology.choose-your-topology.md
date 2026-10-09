# Camunda 8.10 deployment topology — Choose your topology

| Your situation                                            | Use                                                                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluating Camunda, or developing locally                 | A `combined` release. See [quick developer install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install)                                                                     |
| A new production deployment, one cluster                  | A `hub` release plus one `orchestration` release. See [install the deployment topology](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index)                                |
| A new production deployment, several clusters or tenants  | The same, plus one `optimize` release per Physical Tenant. See [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants) |
| Analytics for a Physical Tenant in the split topology     | One `optimize` release per Physical Tenant. See [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release)                               |
| Upgrading an existing 8.9 deployment                      | Upgrade in place first, staying on `combined`. See [upgrade Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100)                                          |
| Moving an existing combined release to the split topology | See [move from a combined release to the split topology](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology)                                                              |

A `combined` release remains supported, and remains the default. It's the right choice for evaluation, proofs of concept, and 8.9 compatibility. For a new production deployment, the split topology is the baseline.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology
