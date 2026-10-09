# Elasticsearch exporter — Legacy Zeebe records and Optimize filters

With the introduction of the Camunda exporter, the Elasticsearch and OpenSearch exporters no longer export all record types by default.
Instead, they emit only the record value types and intents required by Optimize.

To export additional record types, enable the [`include-enabled-records`](#configuration) configuration property.

When you enable exporter-side filters (`optimize-mode-enabled`, `variable-name`,
`variable-type`, or `bpmn-process-id`), filtering applies only to newly produced records. Existing documents in Elasticsearch or OpenSearch are not rewritten.

**Info: Upgrade notes**

**Upgrading 8.8 to 8.9:** Exporter filtering behavior may affect data completeness.

**Upgrading 8.9 to 8.10:** `index.optimizeModeEnabled` defaults to `true` (previously `false`) and `index.job` defaults to `false` (previously `true`). When `index.optimizeModeEnabled` is `true`, Optimize mode controls which record value types are exported and the individual `job` flag has no effect. If you use these exporters for purposes beyond Optimize and need record value types that Optimize mode does not cover, set `index.optimizeModeEnabled: false` and enable the [`include-enabled-records`](#configuration) configuration property to export the record value types you need.

For more information, see the [Camunda 8 system configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter
