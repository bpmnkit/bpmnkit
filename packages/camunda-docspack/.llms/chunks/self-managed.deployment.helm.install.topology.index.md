# Install the Camunda 8.10 deployment topology

Install Camunda 8.10 Self-Managed as separate Hub, Orchestration Cluster, and Optimize Helm releases.

**Note: Minimum chart versions**
This page needs Helm chart 15.0.0 or later for 8.10 releases. For the minimum chart version per Camunda version, see [release roles](#release-roles).

Install Camunda 8.10 Self-Managed as separate Helm releases: one Hub release, one release per Orchestration Cluster, and one Optimize release per Physical Tenant.

This is the baseline topology for a new 8.10 production deployment. Each release declares its role through `global.topology.mode`, so the management plane and each Orchestration Cluster have independent lifecycles. For the architecture behind this model and its constraints, see [deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#deployment-topology).

The Hub release can be shared across environments. If you're adding an Orchestration Cluster to an existing Hub, update that Hub's cluster inventory and follow the Orchestration Cluster installation steps.

A single `combined` release remains supported and remains the chart default. Use it for evaluation, proofs of concept, and 8.9 compatibility. See [quick developer install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).

Camunda recommends Helm CLI v4 and supports it for the full release cycles of Camunda 8.9 and 8.10. Camunda supports Helm CLI v3 (3.10 or later) until February 10, 2027, when upstream support ends. After February 10, 2027, Camunda no longer supports Helm CLI v3. Customers who continue to use Helm CLI v3 after that date do so at their own risk.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
