# Install Camunda with Helm

Install Camunda 8 Self-Managed on Kubernetes using Helm charts for development, evaluation, or production environments.

Install Camunda 8 Self-Managed on Kubernetes using Helm charts. Two decisions shape the installation: the topology you deploy, and the secondary storage backend you use.


## Choose your topology

A Camunda 8.10 deployment is one or more Helm releases, and each release declares its role with `global.topology.mode`. For the release roles and the reasoning behind them, see [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology).

| Use case                                        | Topology                                                   | Installation guide                                                              |
| ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Testing, evaluation, local development          | One `combined` release                                     | [Quick install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install)                                             |
| New production deployment, one cluster          | One `hub` release, one `orchestration` release             | [Install the deployment topology](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index)                          |
| New production deployment, tenants or analytics | The same, plus one `optimize` release per Physical Tenant  | [Configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants)    |
| Several Orchestration Clusters, one Hub         | One `hub` release, one `orchestration` release per cluster | [Install an Orchestration Cluster release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release) |
| Analytics for a tenant of the split topology    | One `optimize` release per Physical Tenant                 | [Install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release)                   |
| Existing single-release production deployment   | One `combined` release                                     | [Install for production](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index)                                 |

For a new production deployment, the split topology is the baseline. A `combined` release remains supported, remains the chart default, and is the right choice for evaluation, proofs of concept, and 8.9 compatibility.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/index
