# Camunda 8 system configuration — Exporter-side filters and Optimize data completeness

This section describes how exporter-side filters affect Optimize data imports and data completeness. For YAML configuration details and property syntax, refer to the [Elasticsearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter#configuration) and [OpenSearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter#configuration) exporter documentation.

Starting from Camunda 8.9, the Elasticsearch and OpenSearch exporters provide optional filters that can reduce the amount of data written for Optimize:

- Variable names: Inclusion and exclusion lists with match modes such as exact, starts with, and ends with.
- Variable value types: Inclusion and exclusion lists for inferred types such as `String`, `Number`, `Boolean`, `Object` and `Null`.
- Variable scope: Disable export of all local-scope variables (`export-local-variables-enabled: false`) and apply separate name/type inclusion and exclusion lists for root vs. local variables.
- BPMN process IDs: Inclusion and exclusion lists by `bpmnProcessId` that drop all records tied to selected processes.
- Optimize mode: Keeps only the record value types and intents required by Optimize and drops other record types not used by Optimize.

**Warning**
These filters run **inside the exporter** and permanently drop matching records from the exported stream. Optimize cannot import data that was never exported, and dropped records cannot be recovered later, even if you relax the filters.

#### Non‑retroactive filters and permanent gaps

Exporter-side filters are not retroactive:

- Filters only affect records produced after the configuration change.
- If a process is excluded (or not included) for some period and later re‑enabled, records from the excluded period were never exported.
- As a result, Optimize will always show a permanent gap in that time window for the affected process, even if you later remove the filter or inclusion list.

The same principle applies to variable‑name and variable‑type filters and other exporter-side filters: records that were dropped during a given time window cannot be recovered in Optimize, even if you subsequently relax the filters.

#### Changing filters on existing clusters (sequence vs position)

On clusters that have already exported data to Optimize, enabling or changing exporter-side filters mid‑stream can cause Optimize to miss some re‑exported events.

As long as the exporter configuration (including any existing filters) remains unchanged, the exporter assigns a monotonically increasing `sequence` to each exported record, and Optimize can reliably resume imports from the “last seen” sequence.

The Elasticsearch/OpenSearch exporter uses at-least-once delivery: after a failover, restart, or snapshot replay, it may export the same event again. If you change exporter-side filters between the original export and the re‑export, some records that were previously exported may now be filtered out. The remaining records are renumbered in this shorter stream. As a result, an event that Optimize already imported can reappear with a different sequence and be skipped when Optimize resumes from the previous “last seen” sequence.

To keep Optimize imports consistent and avoid gaps, we recommend changing exporter-side filters only when the exporter has no pending records and Optimize has already imported all available data from that exporter.

#### Supported versions

- Exporter-side filters and Optimize mode are introduced in Camunda 8.9 and are not backported to earlier 8.x versions.
- On clusters running earlier versions, the exporters always write an unfiltered event stream and this section does not apply.

#### Required record types for Optimize

Optimize requires at least the following record value types to populate standard reports:

- `PROCESS`
- `PROCESS_INSTANCE`
- `INCIDENT`
- `USER_TASK`
- `VARIABLE`

Starting with Camunda 8.10, `index.optimizeModeEnabled` defaults to `true`, which automatically restricts exported record types to those required by Optimize. If you disable `index.optimizeModeEnabled`, ensure these record value types remain enabled in the exporter configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8
