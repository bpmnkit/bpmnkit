# Install the Camunda 8.10 deployment topology — Install order

Install in dependency order, and confirm each release is healthy before starting the next.

1. Namespace-local Secret projections and TLS certificates.
2. The [Hub release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release).
3. One or more [Orchestration Cluster releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release).
4. One [Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release) per Physical Tenant, including the default tenant.

The Hub release comes first because it runs Management Identity and, for a Keycloak-administered deployment, creates the OIDC clients the other releases authenticate with.

The Hub release always deploys from the 8.10 chart. Each Orchestration Cluster release can deploy from the 8.7, 8.8, 8.9, or 8.10 chart, using its own chart and values, so clusters upgrade independently of the Hub. A chart 8.7 cluster runs split Zeebe, Operate, and Tasklist workloads, so its Hub cluster record must [set `architecture: legacy`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#describe-a-chart-87-cluster). A chart 8.7 release also still runs Optimize in-release, so it doesn't follow the one-Optimize-release-per-tenant model. See [requirements by chart version](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#requirements-by-chart-version).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
