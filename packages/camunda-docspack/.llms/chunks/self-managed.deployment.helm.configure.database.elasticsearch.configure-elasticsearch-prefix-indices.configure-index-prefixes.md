# Configure Elasticsearch and OpenSearch index prefixes — Configure index prefixes

### valuesYaml

### Basic configuration (without Optimize)

If Optimize is not enabled, configure only the Camunda Exporter prefix.

### elasticsearch

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
  index:
    prefix: custom-camunda # Orchestration Cluster indices prefix
```

### opensearch

```yaml
orchestration:
  data:
    secondaryStorage:
      type: opensearch
  index:
    prefix: custom-camunda # Orchestration Cluster indices prefix
```

### Full configuration (with Optimize)

When Optimize is enabled, configure:

- The Legacy Zeebe Exporter prefix (`optimize.database.elasticsearch.prefix` or `optimize.database.opensearch.prefix`)
- The Camunda Exporter prefix (`orchestration.index.prefix`)
- Optimize environment variables so Optimize can find the correct indices

### elasticsearch

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
  index:
    prefix: custom-camunda # Camunda Exporter prefix

optimize:
  enabled: true
  database:
    elasticsearch:
      enabled: true
      prefix: custom-zeebe # Legacy Zeebe Exporter prefix (read by Optimize)
  env:
    - name: CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX
      value: custom-optimize # Optimize's own indices
    - name: CAMUNDA_OPTIMIZE_ZEEBE_NAME
      value: custom-zeebe # Must match optimize.database.elasticsearch.prefix
```

### opensearch

```yaml
orchestration:
  data:
    secondaryStorage:
      type: opensearch
  index:
    prefix: custom-camunda # Camunda Exporter prefix

optimize:
  enabled: true
  database:
    opensearch:
      enabled: true
      prefix: custom-zeebe # Legacy Zeebe Exporter prefix (read by Optimize)
  env:
    - name: CAMUNDA_OPTIMIZE_OPENSEARCH_SETTINGS_INDEX_PREFIX
      value: custom-optimize # Optimize's own indices
    - name: CAMUNDA_OPTIMIZE_ZEEBE_NAME
      value: custom-zeebe # Must match optimize.database.opensearch.prefix
  migration:
    env:
      - name: CAMUNDA_OPTIMIZE_OPENSEARCH_SETTINGS_INDEX_PREFIX
        value: custom-optimize
      - name: CAMUNDA_OPTIMIZE_ZEEBE_NAME
        value: custom-zeebe
```

### envVars

### Elasticsearch

```sh
# Camunda Exporter - Orchestration Cluster indices prefix
CAMUNDA_DATA_SECONDARYSTORAGE_ELASTICSEARCH_INDEXPREFIX=custom-camunda

# Legacy Zeebe Exporter - zeebe-record indices prefix (for Optimize)
ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_INDEX_PREFIX=custom-zeebe

# Optimize indices prefix (when Optimize is enabled)
CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX=custom-optimize
CAMUNDA_OPTIMIZE_ZEEBE_NAME=custom-zeebe
```

For example, recommended:

```bash
ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_INDEX_PREFIX=custom-zeebe
CAMUNDA_DATA_SECONDARYSTORAGE_ELASTICSEARCH_INDEXPREFIX=custom-camunda
```

Not allowed (will cause conflicts):

```bash
ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_INDEX_PREFIX=shared-prefix
CAMUNDA_DATA_SECONDARYSTORAGE_ELASTICSEARCH_INDEXPREFIX=shared-prefix
```

### OpenSearch

```sh
# Camunda Exporter - Orchestration Cluster indices prefix
CAMUNDA_DATA_SECONDARYSTORAGE_OPENSEARCH_INDEXPREFIX=custom-camunda

# Legacy Zeebe Exporter - zeebe-record indices prefix (for Optimize)
ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_INDEX_PREFIX=custom-zeebe

# Optimize indices prefix (when Optimize is enabled)
CAMUNDA_OPTIMIZE_OPENSEARCH_SETTINGS_INDEX_PREFIX=custom-optimize
CAMUNDA_OPTIMIZE_ZEEBE_NAME=custom-zeebe
```

For example, recommended:

```bash
ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_INDEX_PREFIX=custom-zeebe
CAMUNDA_DATA_SECONDARYSTORAGE_OPENSEARCH_INDEXPREFIX=custom-camunda
```

Not allowed (will cause conflicts):

```bash
ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_INDEX_PREFIX=shared-prefix
CAMUNDA_DATA_SECONDARYSTORAGE_OPENSEARCH_INDEXPREFIX=shared-prefix
```

### applicationYaml

### Elasticsearch

```yaml
camunda:
  data:
    secondary-storage:
      elasticsearch:
        index-prefix: custom-camunda # Camunda Exporter prefix

zeebe:
  broker:
    exporters:
      elasticsearch:
        args:
          index:
            prefix: custom-zeebe # Legacy Zeebe Exporter prefix
```

### OpenSearch

```yaml
camunda:
  data:
    secondary-storage:
      opensearch:
        index-prefix: custom-camunda # Camunda Exporter prefix

zeebe:
  broker:
    exporters:
      opensearch:
        args:
          index:
            prefix: custom-zeebe # Legacy Zeebe Exporter prefix
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices
