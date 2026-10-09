# Broker configuration — Configuration — camunda.cluster.metadata

Configure the parameters used to propagate the dynamic cluster configuration across brokers and gateways.

| Field                | Description                                                                                                                                                                                      | Example Value |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| sync-delay           | Sets the interval between two synchronization requests to other members of the cluster. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_METADATA_SYNCDELAY`. | 10s           |
| sync-request-timeout | Sets the timeout for the synchronization requests. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_METADATA_SYNCREQUESTTIMEOUT`.                             | 2s            |
| gossip-fanout        | Sets the number of cluster members the configuration is gossiped to. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_METADATA_GOSSIPFANOUT`.                 | 2             |

#### YAML snippet

```yaml
camunda:
  cluster:
    metadata:
      sync-delay: 10s
      sync-request-timeout: 2s
      gossip-fanout: 2
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
