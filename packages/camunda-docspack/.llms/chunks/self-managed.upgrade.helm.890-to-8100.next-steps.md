# Upgrade Camunda 8.9 to 8.10 using Helm — Next steps

This upgrade keeps your deployment in the chart's default `combined` topology. In this topology, one Helm release runs every enabled component. The upgrade doesn't change your release layout.

For a new production deployment, the baseline topology of Camunda 8.10 is different. It has one Hub release and one release for each Orchestration Cluster. It also has one Optimize release for each Physical Tenant. See [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#deployment-topology).

To move an existing deployment to that topology, you do a separate operation. This operation needs its own data, storage, and rollback planning. First, complete this version upgrade. Then, see [move from a combined release to the split topology](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
