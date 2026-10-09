# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Connect several existing Orchestration Clusters — Grant access to each newly connected Orchestration Cluster

Existing clients that need to call a newly connected Orchestration Cluster, such as job workers and API clients, need two things: a token the cluster accepts, and access to the cluster's resources.

**A token the cluster accepts.** The cluster accepts tokens whose audience is its own audience. On Camunda 8.8 and 8.9 releases (charts 13.x and 14.x), it also accepts its client ID and every entry in `backwardsCompatibleAudiences`. See [keep existing clients working](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology#keep-existing-clients-working). It rejects other tokens with `401 Unauthorized`:

| Identity provider                            | How a client gets the cluster's audience                                                                                                                                                                                                |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keycloak administered by Management Identity | Adding the record adds the cluster's permissions to the shared canonical roles, or to its per-cluster roles. Clients with directly assigned permissions don't receive them: grant them the cluster's permissions in Management Identity |
| External OIDC provider                       | Grant the client access to the cluster's API in the provider                                                                                                                                                                            |

**Access to the cluster's resources.** Where access is decided depends on the Camunda version of the Orchestration Cluster release:

| Camunda version (chart) | Where to grant access                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8.8, 8.9 (13.x, 14.x)   | In the cluster's own Admin. Authorizations are on by default, so a client with the right audience still can't read or change resources until it has roles or authorizations in that cluster. Until then, its searches return no results, and its commands fail with `403 Forbidden`, for example `Insufficient permissions to perform operation 'CREATE_PROCESS_INSTANCE'`. Assign them in Admin, or with `orchestration.security.initialization` in the release's values |
| 8.7 (12.x)              | In Management Identity. Operate and Tasklist read the client's permissions from it                                                                                                                                                                                                                                                                                                                                                                                        |

Assign the record's per-cluster roles to users and groups if you use them. See [role assignment across clusters](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#role-assignment-across-clusters).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
