# Helm chart dual-region operational procedure — Terminology

- **Surviving region**
  - A surviving region refers to a region within a dual-region setup that remains operational and unaffected by a failure or disaster that affects other regions.
- **Lost region**
  - A lost region is a region within a dual-region setup that becomes unavailable or unusable due to a failure or disaster.
- **Recreated region**
  - A recreated region is a region within a dual-region setup that was previously lost but has been restored or recreated to resume its operational state.
  - We assume this region does not contain Camunda 8 deployments or related persistent volumes. Ensure this is the case before executing the failover procedure.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
