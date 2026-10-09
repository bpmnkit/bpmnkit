# Analytics Exporter

Understand how the Analytics Exporter sends product telemetry data from your Self-Managed Orchestration Cluster to Camunda, how to enable and configure it, and exactly what data it sends.

Understand how the Analytics Exporter sends product telemetry data from your Self-Managed Orchestration Cluster to Camunda, how to enable and configure it, and exactly what data it sends.


## About

The Analytics Exporter sends product telemetry from your Orchestration Cluster to a Camunda-operated analytics endpoint over OTLP/HTTP.

Camunda uses this data to verify contractual usage, understand how the product is used, and support your deployment. For what Camunda collects and why across all products, see [data collection](https://docs.camunda.io/docs/next/reference/data-collection/data-collection).

The exporter is **disabled by default**. No data leaves your cluster until you add the exporter to your broker configuration.

**Info**
The exporter sends process metadata only. It never sends process variables, payloads, message contents, job variables, incident error messages, or BPMN, DMN, and form resources.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
