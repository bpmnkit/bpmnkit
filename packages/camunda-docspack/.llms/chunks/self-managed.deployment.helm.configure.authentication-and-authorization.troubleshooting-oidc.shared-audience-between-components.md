# Troubleshoot OIDC authentication — Shared audience between components

**Observed behavior:** A token issued for one Camunda component is also accepted by another component that should not recognize it.

**Why this happens:** Both components are configured to accept the same audience. This can be required when Connectors calls the Orchestration Cluster or when Camunda Hub forwards a user's token to the cluster with `BEARER_TOKEN` authentication. In other cases, a shared audience can allow unintended cross-component access.

**How to fix:**

1. Compare the audience configured for each component against [Assign a unique audience to each component](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#assign-a-unique-audience-to-each-component).
2. Check whether the shared audience supports one of the documented integrations. If it doesn't, give each component a distinct resource audience, and configure your provider to issue it.
3. Redeploy Camunda.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
