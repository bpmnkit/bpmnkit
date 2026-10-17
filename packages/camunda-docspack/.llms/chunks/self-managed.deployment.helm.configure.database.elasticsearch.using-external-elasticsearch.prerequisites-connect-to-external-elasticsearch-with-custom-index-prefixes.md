# Use external Elasticsearch for Orchestration Cluster with Helm — Prerequisites — Connect to external Elasticsearch with custom index prefixes

When running multiple Camunda instances on a shared Elasticsearch cluster, use custom index prefixes to isolate data:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        url: https://elastic.example.com:443
        auth:
          username: elastic
          secret:
            inlineSecret: pass
  index:
    prefix: my-env-camunda # Prefix for Orchestration Cluster indices
```

For more details on index prefix configuration, including Optimize-specific settings when Optimize is enabled, see [prefix Elasticsearch/OpenSearch indices](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch
