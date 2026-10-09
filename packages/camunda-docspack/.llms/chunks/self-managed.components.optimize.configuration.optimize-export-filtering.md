# Optimize export filtering

Configure which processes and variables the Elasticsearch and OpenSearch exporters send to Optimize to reduce storage costs and scope analytics data.

Filter which processes and variables the [Elasticsearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter) and [OpenSearch](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter) exporters write for Optimize to reduce storage costs and scope analytics data.

**Note**
Exporter-side filters require Camunda 8.9 or later. On earlier versions, exporters always write a complete, unfiltered event stream.


## How export filtering works

The Elasticsearch and OpenSearch exporters run inside Zeebe brokers and write raw engine events to export indices. Optimize reads those indices and builds its own analytics indices.

Export filters run **inside the exporter** and permanently drop matching records from the exported stream. Optimize cannot import data that was never exported, and dropped records cannot be recovered later, even if you relax the filters afterward.

**These filters affect Optimize only.** Operate and Tasklist read through the Camunda Exporter, so their data stays intact regardless of what you configure here.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering
