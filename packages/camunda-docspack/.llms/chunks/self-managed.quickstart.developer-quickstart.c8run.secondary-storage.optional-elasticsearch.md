# Configure secondary storage in Camunda 8 Run — Optional: Elasticsearch

If you need indexing, search, or full Operate or Tasklist functionality, use an external Elasticsearch instance.

To use Elasticsearch:

```yaml
camunda:
  data:
    secondary-storage:
      type: elasticsearch
      elasticsearch:
        url: http://localhost:9200/
```

Start Camunda 8 Run with `--config <file>` and point the configuration to your external cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
