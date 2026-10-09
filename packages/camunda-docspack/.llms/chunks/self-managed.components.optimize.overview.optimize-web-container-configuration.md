# Optimize on Self-Managed — Optimize web container configuration

Refer to the [configuration section on container settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration) for more information on how to adjust the Optimize web container configuration.


## Elasticsearch/OpenSearch configuration

You can customize the [Elasticsearch/OpenSearch connection settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#connection-settings) as well as the [index settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#index-settings).


## Camunda 8 specific configuration

For Camunda 8, Optimize imports process data from Zeebe records exported by the [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter) or [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter) from the same cluster that Optimize uses to store its own data.
For the relevant Optimize import options and version support, refer to the [Camunda 8 system configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8).

Starting with Camunda 8.9, you can optionally reduce the amount of data exported for Optimize by configuring exporter-side filters (for example, by variable name, variable type, or BPMN process ID) in the Elasticsearch/OpenSearch exporters. See [Optimize export filtering](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering) for configuration options and examples.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/overview
