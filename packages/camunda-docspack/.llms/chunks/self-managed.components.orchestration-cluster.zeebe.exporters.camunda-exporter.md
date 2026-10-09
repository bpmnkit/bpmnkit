# Camunda Exporter

Use the Camunda Exporter to export Zeebe records to Elasticsearch/OpenSearch without additional importers or data transformations.

The Camunda Exporter exports Zeebe records directly to Elasticsearch or OpenSearch. Unlike the Elasticsearch and OpenSearch exporters, it exports records in the format required by Operate and Tasklist, so you don’t need to configure additional importers or data transformations.

Using the Camunda Exporter can increase process instance throughput and reduce the latency of changes appearing in Operate and Tasklist.

**Note**
When exporting, indexes are created as required and not recreated if they already exist. However, disabling the exporter does not delete indexes. Administrators must handle deletions. You can configure a [retention policy](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter/camunda-exporter.md?configuration=retention#options) to automatically delete data after a set number of days.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
