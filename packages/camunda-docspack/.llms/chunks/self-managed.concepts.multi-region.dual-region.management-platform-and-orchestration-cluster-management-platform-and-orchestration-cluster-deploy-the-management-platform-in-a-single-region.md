# Dual-Region — Management platform and Orchestration Cluster {#management-platform-and-orchestration-cluster} — Deploy the management platform in a single region

Deploy the management platform as a separate release in one region, next to the two Orchestration Clusters rather than inside them. That region can be one of the two dual-region regions or a third region. Camunda doesn't stretch these components across regions, and they take no part in the dual-region failover procedure.

The dual-region reference architecture doesn't deploy the management platform. It uses Basic authentication, disables Management Identity, and sets `optimize.enabled: false`. That's the scope of the reference configuration, not a product restriction: you can run Optimize and Camunda Hub alongside a dual-region Orchestration Cluster.

Both components authenticate through Management Identity, so a management platform requires OpenID Connect (OIDC) authentication rather than the Basic authentication the reference configuration uses. Point each component at your Management Identity instance with `global.identity.service.url`, and give Camunda Hub its own PostgreSQL database.

Optimize imports the `zeebe-record` indices that the legacy Elasticsearch exporter writes. The dual-region reference configuration doesn't write them: it sets `orchestration.exporters.zeebe.enabled: false`, and the Helm chart doesn't enable this exporter automatically when the Orchestration Cluster spans two regions. Each broker exports only the partitions it leads, so configure the [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter) on every broker in both regions, with the URL of the Elasticsearch cluster that Optimize reads. Add it as an additional exporter through environment variables, the same way the reference configuration adds its regional Camunda Exporters.

With the 8.10 Helm chart, deploy the management platform as two single-region releases: a release with `global.topology.mode: hub` for Camunda Hub and Management Identity, and a release with `global.topology.mode: optimize` for Optimize. A `hub` release doesn't deploy Optimize, even with `optimize.enabled: true`. Point the Optimize release at the Management Identity in the Hub release with `global.identity.service.url`. Set `global.topology.mode: orchestration` in each regional Orchestration Cluster release. The Hub release requires `identity.enabled: true`. Each regional release requires `identity.enabled: false` and `global.identity.auth.enabled: true`, so it can't keep the `global.identity.auth.enabled: false` setting of the reference configuration. Point `global.identity.service.url` at the Management Identity in the Hub release. See [Clusters](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters).

**Note**
The Helm chart doesn't reject `optimize.enabled: true` in a release that has no Management Identity. That combination installs successfully and then fails to authenticate at runtime. Confirm Management Identity is reachable before you enable Optimize.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
