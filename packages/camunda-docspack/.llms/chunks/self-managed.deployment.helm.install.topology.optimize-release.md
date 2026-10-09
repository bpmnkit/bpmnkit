# Install an Optimize release

Install Optimize as its own Helm release with global.topology.mode set to optimize, one release per Physical Tenant.

An Optimize release deploys Optimize and no other Camunda component. Install one per Physical Tenant, including the default tenant.

**Note: Minimum chart versions**
This page needs Helm chart 15.0.0 or later for 8.10 releases. For the minimum chart version per Camunda version, see [release roles](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index#release-roles).

The `optimize` role requires the 8.10 chart. The 8.7, 8.8, and 8.9 charts support `combined` and `orchestration` only, so an older Orchestration Cluster runs Optimize inside its own release.

Install these releases after their [Orchestration Cluster release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release) is healthy.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release
