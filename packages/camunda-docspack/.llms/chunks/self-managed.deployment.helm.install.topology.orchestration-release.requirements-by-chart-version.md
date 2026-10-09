# Install an Orchestration Cluster release — Requirements by chart version

An orchestration release can deploy from the 8.7, 8.8, 8.9, or 8.10 chart against an 8.10 Hub. The role is the same; the values it requires differ, because the older charts predate the unified Orchestration Cluster and still bundle management plane dependencies.

Chart versions earlier than the minimum versions in the following table ignore `global.topology.mode` and deploy a combined release. From the minimum versions, the `orchestration` role stops rendering Console and Web Modeler on the 8.7, 8.8, and 8.9 charts, even if `console.enabled` or `webModeler.enabled` is `true`. Every version requires `global.identity.auth.enabled: true`, `identity.enabled: false`, and a reachable `global.identity.service.url`. Beyond that:

| Chart (minimum version) | Workload to enable                                                       | Also required                                                                                                                           |
| :---------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| 8.10 (15.0.0)           | `orchestration.enabled: true`                                            | Nothing further                                                                                                                         |
| 8.9 (14.11.0)           | `orchestration.enabled: true`                                            | `identityPostgresql.enabled: false`, `webModelerPostgresql.enabled: false`, `identityKeycloak.enabled: false`                           |
| 8.8 (13.14.0)           | `orchestration.enabled: true`                                            | `identityPostgresql.enabled: false`, `webModelerPostgresql.enabled: false`, `identityKeycloak.enabled: false`                           |
| 8.7 (12.14.0)           | `zeebe.enabled: true`, `operate.enabled: true`, `tasklist.enabled: true` | `identityKeycloak.enabled: false`, `identityPostgresql.enabled: false`, `postgresql.enabled: false`, `executionIdentity.enabled: false` |

These are the oldest chart versions that support the `orchestration` role. Before you convert an existing release, upgrade it to the latest chart version and the latest Camunda patch version.

The management plane databases belong to the Hub release. The 8.7, 8.8, and 8.9 charts therefore reject them here. If you leave them enabled, the release deploys a second Management Identity or Hub database beside the one the Hub release already owns.

The 8.8 and 8.9 charts reject `identityKeycloak.enabled: true` because Management Identity is off in this role, and they don't run Keycloak without it.

These keys default to `false`, except `identityKeycloak.enabled` on the 8.7 chart, which defaults to `true`. The check matters when you convert an existing combined release, whose values file may already enable them. See [connect existing clusters to Hub](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters).

A chart 8.7 release also needs `architecture: legacy` in its Hub cluster record, so the inventory addresses its split Zeebe, Zeebe Gateway, Operate, and Tasklist services. See [describe a chart 8.7 cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#describe-a-chart-87-cluster).

The examples on this page use the 8.10 chart.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
