# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Convert an existing release — Step 1: Inventory the release

From the release's values file and the cluster, record:

- The release name, namespace, hostnames, and context paths.
- Every OIDC client ID, audience, and redirect URL, and the Secret that holds each client secret.
- The OIDC issuer the release validates tokens against.
- Which components the release runs, and which bundled subcharts are enabled.
- Every Elasticsearch or OpenSearch index prefix in use.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
