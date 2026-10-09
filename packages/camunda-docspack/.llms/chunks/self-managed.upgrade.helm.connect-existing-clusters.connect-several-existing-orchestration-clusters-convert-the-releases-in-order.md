# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Connect several existing Orchestration Clusters — Convert the releases in order

1. Make sure every Orchestration Cluster release can use the shared identity provider. If an Orchestration Cluster release moves to a new provider, register its clients there.
2. Create the Hub release. See [install the Hub release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release).
3. Convert the non-production Orchestration Cluster releases first, one at a time. Confirm each one before you start the next.
4. Convert the production Orchestration Cluster releases last, each in its own maintenance window.
5. After every Orchestration Cluster release is converted, remove clients and roles that no release uses. Identity initialization is additive, so it doesn't remove them for you.

Each Orchestration Cluster release keeps its own chart version. When you upgrade a converted Orchestration Cluster release later, update its Hub cluster record in the same change window: set `version`, and when you upgrade a Camunda 8.7 release (chart 12.x) to 8.8 (chart 13.x), remove `architecture: legacy` and the split service names. The upgraded release also moves from `global.identity.auth.zeebe`, `.operate`, and `.tasklist` to `orchestration.security.authentication.oidc.*`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
