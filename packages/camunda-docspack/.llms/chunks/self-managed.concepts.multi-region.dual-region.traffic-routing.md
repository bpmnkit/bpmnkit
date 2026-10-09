# Dual-Region — Traffic routing

### Primary and secondary regions

In v2 API deployments (default in 8.9+), both regions serve user traffic simultaneously and there's no primary/secondary distinction at the UI layer. See [Active-active and active-passive modes](#active-active-and-active-passive-modes).

In v1 API deployments, one region is designated as primary and the other as secondary:

- **Primary region**: Serves user traffic (UI access, API calls).
- **Secondary region**: Operational but doesn't serve user traffic under normal conditions.

In both cases, both regions are operationally active with all components running and replicating data.

### Managing user traffic

With v2 APIs (default in 8.9+), distribute traffic across both regions using DNS, a load balancer, or network routing policies.

With v1 APIs, route all user traffic exclusively to the primary region. You're responsible for configuring and maintaining:

- DNS routing to the primary region
- Load balancer rules and health checks
- Traffic redirection to the secondary region during primary region failure, as part of the complete failover procedure

**Warning**
Redirecting traffic without following the full [operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops) can cause system inconsistencies and data issues.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
