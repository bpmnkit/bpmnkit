# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Convert an existing release — Step 2: Add the cluster record to the Hub release

Add a record for the cluster to `global.topology.clusters` in the Hub release's values:

- Give the record a unique `id`.
- Give its components client IDs and audiences that no other record uses. The chart rejects a duplicate client ID or audience across records, for every identity provider. If several clusters share one client or app registration today, split it before you add their records. See [the cluster record](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#the-cluster-record).
- Set `version` to the Camunda version the release runs.
- For a chart 8.7 release, also set `architecture: legacy` and the names of the split services. See [describe a chart 8.7 cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#describe-a-chart-87-cluster).

How the clients are created depends on the identity provider:

| Identity provider                            | Clients                                                                                                                                                                                                                                                                                                                                              |
| :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keycloak administered by Management Identity | The Hub `helm upgrade` creates the record's clients. The record needs a secret for each component. You can reuse the release's existing client secrets: copy them into a Secret in the Hub namespace and reference it from the record                                                                                                                |
| External OIDC provider                       | Register the clients in the provider before the Hub `helm upgrade`, including client secrets, redirect URLs, and the audience each component's tokens carry, and then copy their identifiers into the record. See [provider setup outside the chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#provider-setup-outside-the-chart) |

Run `helm upgrade` on the Hub release.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
