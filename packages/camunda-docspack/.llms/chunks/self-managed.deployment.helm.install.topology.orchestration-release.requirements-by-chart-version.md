# Install an Orchestration Cluster release — Requirements by chart version

An orchestration release can deploy from the 8.7, 8.8, 8.9, or 8.10 chart against an 8.10 Hub. The role is the same; the values it requires differ, because the older charts predate the unified Orchestration Cluster and still bundle Hub plane dependencies.

Earlier chart versions ignore `global.topology.mode` and deploy a combined release. Every version requires `global.identity.auth.enabled: true`, `identity.enabled: false`, and a reachable `global.identity.service.url`. Beyond that:

| Chart (minimum version) | Workload to enable                             | Also required                                                                                                                           |
| :---------------------- | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| 8.10 (15.0.0)           | `orchestration.enabled: true`                  | Nothing further                                                                                                                         |
| 8.9 (14.11.0)           | `orchestration.enabled: true`                  | `identityPostgresql.enabled: false`, `webModelerPostgresql.enabled: false`                                                              |
| 8.8 (13.14.0)           | `orchestration.enabled: true`                  | `identityPostgresql.enabled: false`, `webModelerPostgresql.enabled: false`                                                              |
| 8.7 (12.14.0)           | `zeebe.enabled: true`, `operate.enabled: true` | `identityKeycloak.enabled: false`, `identityPostgresql.enabled: false`, `postgresql.enabled: false`, `executionIdentity.enabled: false` |

The Hub plane databases belong to the Hub release, which is why the 8.7, 8.8, and 8.9 charts reject them here: leaving them enabled would deploy a second Management Identity or Hub database beside the one the Hub release already owns.

These keys default to `false`, so a fresh install is unaffected. The check matters when you convert an existing combined release, whose values file may already enable them.

A chart 8.7 release also needs `architecture: legacy` in its Hub cluster record, so the inventory addresses its split Zeebe, Zeebe Gateway, Operate, and Tasklist services. See [describe a chart 8.7 cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#describe-a-chart-87-cluster).

The examples on this page use the 8.10 chart.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
