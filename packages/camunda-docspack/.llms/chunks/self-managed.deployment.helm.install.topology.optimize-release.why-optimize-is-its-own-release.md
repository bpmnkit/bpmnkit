# Install an Optimize release — Why Optimize is its own release

Optimize reads exported records from a single Elasticsearch or OpenSearch index prefix, so one instance serves exactly one Physical Tenant.

Running those instances inside the orchestration release would tie every tenant's Optimize lifecycle to the Orchestration Cluster's StatefulSet, and the workload release would have to describe tenants it doesn't own. A release whose job is to run one Optimize against one tenant's storage is a separate release.

This applies to a cluster with no additional tenants too. Its default Physical Tenant needs one Optimize release if you want analytics.


## Requirements

`global.topology.mode: optimize` gates off every component except Optimize, so you don't disable each one by hand. The chart fails the render with a `[camunda][error]` message naming any of the following that's missing.

| Requirement                                                                             | Reason                                                                                                                                                                          |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `optimize.enabled: true`                                                                | This is the workload the release exists to run                                                                                                                                  |
| `global.noSecondaryStorage: false`                                                      | Optimize reads exported records from secondary storage                                                                                                                          |
| `optimize.database.elasticsearch.enabled` or `optimize.database.opensearch.enabled`     | The chart bundles no Elasticsearch. With neither backend enabled, Optimize reaches no storage at all                                                                            |
| A non-empty `url.host` for the enabled backend                                          | Without a host, Optimize renders an unusable connection node                                                                                                                    |
| `optimize.security.authentication.method: oidc` or `global.identity.auth.enabled: true` | Optimize requires authentication                                                                                                                                                |
| `optimize.identity.service.url` or `global.identity.service.url`                        | This release runs no Identity of its own, so the in-release default can't apply                                                                                                 |
| `optimize.contextPath`, when the chart renders this release's routing                   | The shared Ingress emits an Optimize rule only when the context path is set, and an HTTPRoute would match an empty path prefix                                                  |
| An OIDC issuer, when Optimize uses OIDC                                                 | Optimize validates the `iss` claim on every token. Set `optimize.security.authentication.oidc.issuer`, `global.identity.auth.issuer`, or `global.identity.auth.publicIssuerUrl` |

Unlike the orchestration release, Optimize accepts `publicIssuerUrl` as its issuer fallback. That works only when your provider mints that exact URL as the `iss` claim, which a pinned issuer guarantees. Setting `issuer` explicitly avoids the ambiguity. See [pin the issuer](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#pin-the-issuer).

Elasticsearch takes precedence when both backends are enabled.

Optimize requires Elasticsearch or OpenSearch and can't use a relational database. An Orchestration Cluster on RDBMS secondary storage can still feed Optimize if it also exports its records to Elasticsearch or OpenSearch.

The Orchestration Cluster release must export those records. Because Optimize isn't in that release, the chart doesn't enable the exporter for you. See [export records for Optimize](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#export-records-for-optimize).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release
