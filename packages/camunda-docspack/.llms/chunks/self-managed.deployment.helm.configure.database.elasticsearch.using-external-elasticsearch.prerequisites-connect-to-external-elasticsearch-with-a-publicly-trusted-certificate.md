# Use external Elasticsearch for Orchestration Cluster with Helm — Prerequisites — Connect to external Elasticsearch with a publicly trusted certificate

This configuration works with managed Elasticsearch services. It has been tested with Elastic Cloud on Google Cloud.

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

elasticsearch:
  enabled: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch
