# Camunda exporters — Custom exporter to filter specific records — Optimize-oriented built-in filters

Camunda‑maintained exporters for Elasticsearch and OpenSearch include built‑in filters that reduce the volume of data exported when their indices are used primarily by Optimize. These filters can:

- Restrict exported variables (by name pattern or inferred value type).
- Include or exclude whole processes (based on `bpmnProcessId`).
- Enable an Optimize mode that exports only the record types and intents Optimize actually consumes.
- Control variable scope for root and local variables, including options to drop all local variables or apply different filters to each scope.

For concrete arguments, examples, and version details, see:

- [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter#configuration)
- [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter#configuration)
- [Camunda 8 system configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
