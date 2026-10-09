# Install an Optimize release — Match the prefixes exactly

`optimize.database.elasticsearch.prefix` logs a deprecation warning in chart 15.x. Its replacement is Optimize's own `zeebe.name` property in `optimize.extraConfiguration`. The example uses the chart key because it's the documented way to set the reader prefix across releases.

`optimize.database.elasticsearch.prefix` is a reader prefix. It must exactly equal the writer prefix of the exporter for this tenant in the Orchestration Cluster.

A mismatch doesn't fail. Optimize starts successfully against the wrong or an empty record set, and displays no process data. Similar-looking prefixes are not sufficient.

`CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX` is different: it names where Optimize writes its own indices, and must be unique per Optimize release and distinct from every writer prefix.

For the full prefix model across all releases, see [isolate every index prefix family](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants#isolate-every-index-prefix-family).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release
