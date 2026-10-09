# Camunda manual installation — Reference architecture — spring

```yaml
camunda:
  data:
    type: elasticsearch|opensearch # defaults to elasticsearch
    secondary-storage:
      # Elasticsearch
      elasticsearch:
        url: http://localhost:9200
        username:
        password:
      # OpenSearch
      opensearch:
        url: http://localhost:9200
        username:
        password:
```

  

#### Configure a multi-broker cluster

This example shows a 3-broker cluster.

- Set `size` to `3`.
- Assign a unique `node-id` to each broker, starting from `0` and incrementing up to the total number of brokers (`0`, `1`, `2`).
- Use the same `initial-contact-points` on all brokers.

For more details, see the [Zeebe Broker cluster configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokercluster).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
