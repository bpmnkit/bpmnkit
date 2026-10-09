# Configure Physical Tenants across releases

Map Physical Tenants across the Hub, Orchestration Cluster, and Optimize releases, isolate their index prefixes, and operate tenant lifecycle changes in order.

A Physical Tenant spans three releases: it's declared in an Orchestration Cluster release, mapped in the Hub release, and served by its own Optimize release.

**Note: Minimum chart versions**
This page needs Helm chart 15.0.0 or later for 8.10 releases. For the minimum chart version per Camunda version, see [release roles](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index#release-roles).

This page covers the release-level work. For what a Physical Tenant is, how its isolation model works, and the full application configuration reference, see [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants) and the [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference).

This procedure applies to fresh Camunda 8.10 topology deployments. To convert an existing combined release first, see [move from a combined release to the split topology](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
