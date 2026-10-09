# Camunda 8.10 deployment topology

Camunda 8.10 Self-Managed is deployed as a Hub plane and one or more execution planes, each installed as its own Helm release.

Camunda 8.10 Self-Managed is deployed as a Hub plane and one or more execution planes, each installed as its own Helm release.

A single Helm chart still produces every component. What changed in 8.10 is that you choose the _role_ each release plays in the wider deployment, using `global.topology.mode`. One management release running Camunda Hub can serve many independently deployed Orchestration Clusters, and each cluster can host several [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants), each with its own Optimize release.

For the mechanics of installing this topology, see [install the deployment topology](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology
