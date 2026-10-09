# Configure Physical Tenants across releases — Prerequisites

- A [Hub release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release) and at least one [Orchestration Cluster release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release).
- OIDC authentication. Physical Tenants don't support Basic authentication.
- A pinned issuer on the orchestration release, set in `global.identity.auth.issuer` or `orchestration.security.authentication.oidc.issuer`. `publicIssuerUrl` and `issuerBackendUrl` don't satisfy this, because they're network routes rather than the `iss` claim. The Orchestration Cluster rejects a provider without `issuerUri` once tenants exist, and the chart fails the render rather than deploying a cluster that can't validate tokens. See [pin the issuer](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#pin-the-issuer).
- Elasticsearch or OpenSearch, if you want Optimize per tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
