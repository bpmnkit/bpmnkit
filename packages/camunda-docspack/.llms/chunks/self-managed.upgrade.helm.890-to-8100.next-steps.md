# Upgrade Camunda 8.9 to 8.10 using Helm — Next steps

This upgrade keeps your deployment in the chart's default `combined` topology: one Helm release running every enabled component. Nothing in the upgrade changes your release layout.

For a new production deployment, Camunda 8.10's baseline topology is instead one Hub release plus one release per Orchestration Cluster, with one Optimize release per Physical Tenant. See [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology).

Adopting that topology on an existing deployment is a separate operation with its own data, storage, and rollback planning. Complete this version upgrade first, then see [move from a combined release to the split topology](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
