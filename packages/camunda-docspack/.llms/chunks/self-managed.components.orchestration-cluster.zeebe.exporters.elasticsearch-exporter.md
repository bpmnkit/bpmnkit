# Elasticsearch exporter

The Zeebe Elasticsearch exporter acts as a bridge between Zeebe and Elasticsearch.

**Note**
For supported Elasticsearch versions in Camunda 8 Self-Managed, see [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments#camunda-8-self-managed).

Starting with Camunda 8.8, Camunda uses the [Camunda exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter) to consume new records. Records from 8.7 and earlier are consumed only during migration.

The Elasticsearch and OpenSearch exporters remain fully usable after migration (for example, for existing setups, Optimize, or other custom use cases). Their functionality is not limited to the migration period.

From 8.9 onward, the Elasticsearch exporter also supports Optimize-focused export filters (for example, variable-name filters, variable-type filters, BPMN process include/exclude, and an Optimize mode flag).

For Optimize-specific guidance and recommended settings, see [Camunda 8 system configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8).

The Zeebe Elasticsearch exporter acts as a bridge between [Zeebe](https://camunda.com/platform/zeebe/) and [Elasticsearch](https://www.elastic.co/products/elasticsearch) by exporting records written to Zeebe streams as documents into several indices.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter
