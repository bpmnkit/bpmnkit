# Move from a combined release to the split topology — Keep the cluster in place — Step 1: Inventory what the combined release owns

From your current values file and cluster, record:

- Every index prefix in use. See [isolate every index prefix family](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants#isolate-every-index-prefix-family).
- Every OIDC client ID, audience, redirect URL, and role, and which secret holds each client secret.
- The Management Identity and Camunda Hub database connection details. The Hub release reuses these databases.
- The release name, namespace, and Orchestration Cluster context paths and hostnames.

Prepare `hub-values.yaml` now, so step 3 can follow step 2 without delay. Use `global.topology.mode: hub`, point Management Identity and Camunda Hub at the existing databases, and add a `global.topology.clusters` record whose component client IDs, audiences, redirect URLs, and secrets exactly match what the combined release already uses. Reusing the existing identifiers is what lets Hub adopt the running cluster instead of registering a second one. See [install the Hub release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
