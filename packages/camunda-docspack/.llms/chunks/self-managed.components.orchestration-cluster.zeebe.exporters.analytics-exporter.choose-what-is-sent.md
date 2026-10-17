# Analytics Exporter — Choose what is sent

The [`categories`](#configuration-reference) option controls which signals are exported:

| Category    | What it contains                                                                                                                                                | Why Camunda collects it                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| contractual | Root process instance starts, decision evaluations, user task assignments, and tenant creation and deletion.                                                    | To verify usage against the metrics in your agreement.                                       |
| optional    | Process, decision, and form definition deployments and deletions; incidents raised and resolved; user task creation; and agent instance starts and completions. | To understand how the product is used, prioritize improvements, and support your deployment. |

Every signal in each category, with its attributes, is listed in [what data is sent](#what-data-is-sent).

Both categories are active by default. Narrow the set by removing entries. For example, to send contractual signals only:

```yaml
camunda:
  data:
    exporters:
      analytics:
        class-name: io.camunda.exporter.analytics.AnalyticsExporter
        args:
          categories:
            - contractual
```

Explicitly setting `categories: []` disables data-category telemetry entirely. Only the heartbeat and export-window signals below continue to be sent.

The `camunda.telemetry.heartbeat` event and the `camunda.metric.export_window` metric are sent whenever the exporter runs, regardless of the categories you select. Camunda uses them to detect data gaps and offline clusters.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
