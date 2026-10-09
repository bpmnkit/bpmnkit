# Camunda 8 system configuration — General settings

Optimize imports process, variable, incident, and user task data from the Zeebe Elasticsearch or OpenSearch exporters in the Orchestration Cluster. For exporter configuration options (including filters), see:

- [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter).
- [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter).

The settings below control how Optimize connects to and paginates this exporter data.

| YAML path               | Default value | Description                                                                                                                                                                                                                                                       |
| ----------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zeebe.enabled           | false         | Toggles whether Optimize should attempt to import data from the connected Zeebe instance.                                                                                                                                                                         |
| zeebe.name              | zeebe-record  | The index prefix used for exported Zeebe records. This must match the `index.prefix` configured in the Elasticsearch or OpenSearch exporter that Optimize reads from.                                                                                             |
| zeebe.partitionCount    | 1             | The number of partitions configured for the Zeebe record source.                                                                                                                                                                                                  |
| zeebe.maxImportPageSize | 200           | The max page size for importing Zeebe data. Increasing it can help Optimize catch up faster when imports lag, but it uses more memory per fetch; decreasing it reduces memory use and per-query load on Elasticsearch/OpenSearch, but it can increase import lag. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8
