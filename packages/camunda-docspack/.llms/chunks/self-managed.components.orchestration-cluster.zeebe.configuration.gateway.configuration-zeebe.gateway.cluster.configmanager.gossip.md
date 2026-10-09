# Gateway configuration — Configuration — zeebe.gateway.cluster.configManager.gossip

Configure the parameters used to propagate the dynamic cluster configuration across brokers and gateways.

| Field              | Description                                                                                                                                                                                                     | ExampleValue |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| syncDelay          | Sets the interval between two synchronization requests to other members of the cluster. This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_CONFIGMANAGER_GOSSIP_SYNCDELAY | 10s          |
| syncRequestTimeout | Sets the timeout for the synchronization requests. This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_CONFIGMANAGER_GOSSIP_SYNCREQUESTTIMEOUT                             | 2s           |
| gossipFanout       | Sets the number of cluster members the configuration is gossiped to. This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_CONFIGMANAGER_GOSSIP_GOSSIPFANOUT                 | 2            |

#### YAML snippet

```yaml
configManager:
  gossip:
    syncDelay: 10s
    syncRequestTimeout: 2s
    gossipFanout: 2
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
