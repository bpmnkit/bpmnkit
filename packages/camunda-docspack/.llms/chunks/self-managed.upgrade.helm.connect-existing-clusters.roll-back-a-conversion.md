# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Roll back a conversion

Run `helm rollback` on the converted release to its previous revision. Broker volumes are unchanged, and the release's own Management Identity, Console, and Web Modeler, and its bundled Keycloak if it had one, return against their existing databases and volumes. Clients authenticate with the release's previous client IDs and provider again.

Then remove the cluster's record from the Hub release. Identity initialization is additive, so the clients, permissions, and roles the record created remain until you remove them.


## Next steps

- [Install an Orchestration Cluster release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release)
- [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#deployment-topology)

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
