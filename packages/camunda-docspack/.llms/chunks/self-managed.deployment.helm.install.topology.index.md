# Install the Camunda 8.10 deployment topology

Install Camunda 8.10 Self-Managed as separate Hub, Orchestration Cluster, and Optimize Helm releases.

**Note: Minimum chart versions**
This page needs Helm chart 15.0.0 or later for 8.10 releases. For the minimum chart version per Camunda version, see [release roles](https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology#release-roles).

Install Camunda 8.10 Self-Managed as separate Helm releases: one Hub release, one release per Orchestration Cluster, and one Optimize release per Physical Tenant.

This is the baseline topology for a new 8.10 production deployment. Each release declares its role through `global.topology.mode`, so the Hub plane and each execution plane have independent lifecycles. For the reasoning, the release-role reference, and the limits of this model, see [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology).

A single `combined` release remains supported and remains the chart default. Use it for evaluation and proofs of concept. See [quick developer install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).

Camunda recommends Helm CLI v4 and supports it for the full release cycles of Camunda 8.9 and 8.10. Camunda supports Helm CLI v3 (3.10 or later) until February 10, 2027, when upstream support ends. After February 10, 2027, Camunda no longer supports Helm CLI v3. Customers who continue to use Helm CLI v3 after that date do so at their own risk.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
