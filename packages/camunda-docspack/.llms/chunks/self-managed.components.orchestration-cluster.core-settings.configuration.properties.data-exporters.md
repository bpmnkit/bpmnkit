# Property reference — Data - exporters

**Warning**
When Elasticsearch/OpenSearch Exporter indices and Orchestration Cluster indices share the same Elasticsearch or OpenSearch cluster, they must use different index prefixes. One prefix must not be the beginning of the other (for example, avoid `custom` and `custom-zeebe` together because `custom*` matches both). Do not use `operate`, `tasklist`, or `camunda` as the full exporter prefix, and do not use `zeebe-record` as the Orchestration Cluster index prefix, as `zeebe-record` is the default prefix for Elasticsearch/OpenSearch Exporter indices.

The exporter prefix is configured via `camunda.data.exporters.elasticsearch.args.index-prefix` (or `CAMUNDA_DATA_EXPORTERS_{ELASTICSEARCH|OPENSEARCH}_ARGS_INDEX_PREFIX`).

For detailed requirements, configuration examples, and common mistakes, see
[index prefix configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices#index-prefix-configuration).

To assign a custom exporter defined here to specific Physical Tenants, or to declare an exporter private to one tenant, see [custom exporters for Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/custom-exporters).

  
### application.yaml

### `camunda.data.exporters`

| Property                                          | Description                                                                                                                               | Default value                                       | Overridable per Physical Tenant |
| :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- | :------------------------------ |
| `camunda.data.exporters.elasticsearch.class-name` | Fully qualified class name pointing to the class implementing the exporter interface.                                              | `'io.camunda.zeebe.exporter.ElasticsearchExporter'` | Yes                             |
| `camunda.data.exporters.elasticsearch.jar-path`   | Path to the JAR file containing the exporter classOptional field: if missing, will lookup the class in the zeebe classpath. | `-`                                                 | Yes                             |
| `camunda.data.exporters.elasticsearch.args`       | Map of arguments to use when instantiating the exporter.                                                                                  | `-`                                                 | Yes                             |

### env

### `CAMUNDA_DATA_EXPORTERS`

| Property                                         | Description                                                                                                                               | Default value                                       | Overridable per Physical Tenant |
| :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- | :------------------------------ |
| `CAMUNDA_DATA_EXPORTERS_ELASTICSEARCH_CLASSNAME` | Fully qualified class name pointing to the class implementing the exporter interface.                                              | `'io.camunda.zeebe.exporter.ElasticsearchExporter'` | Yes                             |
| `CAMUNDA_DATA_EXPORTERS_ELASTICSEARCH_JARPATH`   | Path to the JAR file containing the exporter classOptional field: if missing, will lookup the class in the zeebe classpath. | `-`                                                 | Yes                             |
| `CAMUNDA_DATA_EXPORTERS_ELASTICSEARCH_ARGS`      | Map of arguments to use when instantiating the exporter.                                                                                  | `-`                                                 | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
