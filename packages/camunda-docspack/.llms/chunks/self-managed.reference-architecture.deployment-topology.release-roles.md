# Camunda 8.10 deployment topology — Release roles

`global.topology.mode` selects what a release deploys and what it must be told about the rest of the deployment.

**Caution: Minimum chart versions**
The deployment topology needs these minimum Helm chart versions:

| Camunda version | Chart line | Minimum chart version | Adds                                                                    |
| :-------------- | :--------- | :-------------------- | :---------------------------------------------------------------------- |
| 8.10            | 15.x       | 15.0.0                | The `hub`, `orchestration`, and `optimize` roles, and `physicalTenants` |
| 8.9             | 14.x       | 14.11.0               | The `orchestration` role                                                |
| 8.8             | 13.x       | 13.14.0               | The `orchestration` role                                                |
| 8.7             | 12.x       | 12.14.0               | The `orchestration` role, with `architecture: legacy` in the Hub record |

Older 8.7, 8.8, and 8.9 charts have no `global.topology` key. They silently ignore `global.topology.mode` and deploy a combined release, so check the chart version before you set the role.

| Role            | Chart versions                                                 | Deploys                                                                                                                                                                                                                               | Key requirements                                                                                                                                                                                                                                                                                                  |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hub`           | 8.10 (15.0.0+)                                                 | Camunda Hub and Management Identity                                                                                                                                                                                                   | `identity.enabled: true`, OIDC authentication, and it's the only release that declares `global.topology.clusters`                                                                                                                                                                                                 |
| `orchestration` | 8.10 (15.0.0+), 8.9 (14.11.0+), 8.8 (13.14.0+), 8.7 (12.14.0+) | 8.10 and 8.9: one Orchestration Cluster and Connectors. 8.8: the same, plus the chart's default bundled Elasticsearch. 8.7: Zeebe, Zeebe Gateway, Operate, Tasklist, Optimize, and Connectors, plus the default bundled Elasticsearch | `global.identity.auth.enabled: true`, `identity.enabled: false`, a reachable `global.identity.service.url`, and the workload enabled. Requirements differ by chart version, see [per-version requirements](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#requirements-by-chart-version) |
| `optimize`      | 8.10 (15.0.0+)                                                 | Optimize only                                                                                                                                                                                                                         | `optimize.enabled: true`, `global.noSecondaryStorage: false`, an enabled Elasticsearch or OpenSearch backend with a non-empty host, an OIDC issuer, a reachable Management Identity URL, and `optimize.contextPath` when the chart renders this release's routing                                                 |
| `combined`      | All; the implicit behavior of charts without `global.topology` | Every enabled component in one release                                                                                                                                                                                                | None beyond normal component configuration. This is the default                                                                                                                                                                                                                                                   |

Camunda Hub and its cluster inventory exist only in the 8.10 chart, so `hub` and `optimize` are 8.10-only roles. The 8.7, 8.8, and 8.9 charts support `combined` and `orchestration` only, from the minimum versions above. Earlier versions of those charts have no `global.topology` key: they always behave as `combined`, and setting `orchestration` on them has no effect and produces no error.

A chart 8.7 orchestration release still runs Optimize in-release, so it doesn't follow the one-Optimize-release-per-tenant model.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology
