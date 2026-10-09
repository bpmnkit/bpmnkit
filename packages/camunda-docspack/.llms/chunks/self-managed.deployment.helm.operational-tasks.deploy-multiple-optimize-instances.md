# Deploy multiple Optimize instances with Helm

Deploy two Optimize instances against one Camunda 8.10 orchestration cluster by using two Helm releases.

Use two Helm releases to run two independent Optimize instances against one Camunda 8.10 orchestration cluster.

The platform release runs the full Camunda deployment and the first Optimize instance. The second release runs only Optimize and connects to the platform topology's shared services.

**Warning: Temporary deployment pattern**
Use this pattern as a stopgap when separate Optimize dashboards, configuration, client credentials, or index lifecycles are required over the **same** orchestration data. Native Optimize multi-tenancy is the long-term solution and is expected to replace this pattern.

This pattern doesn't provide per-team authorization or process-data isolation. Both Optimize instances import the same orchestration data, and both use the `optimize-api` audience and `Optimize` role.

If you need genuine data isolation per team, use [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants) with one Optimize release per tenant instead. See [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants).

Set `global.topology.mode: optimize` on the Optimize-only release rather than disabling each other component by hand. The role gates off every non-Optimize component and validates that the release has the storage, Identity URL, and context path an Optimize-only release needs. See [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
