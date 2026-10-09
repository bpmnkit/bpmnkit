# Gateway configuration — Configuration — zeebe.gateway.cluster.membership

To configure how the gateway connects and distributes information with other nodes (brokers or gateways) via SWIM, the following properties can be used. It might be useful to increase timeouts for setups that encounter a high latency between nodes.

| Field             | Description                                                                                                                                                                                                                                                                                                                                               | Example value |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| broadcastUpdates  | Configure whether to broadcast member updates to all members. If set to `false`, updates will be gossiped among the members. If set to `true`, the network traffic may increase but reduce the time to detect membership changes. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_BROADCASTUPDATES`. | false         |
| broadcastDisputes | Configure whether to broadcast disputes to all members. If set to `true`, the network traffic may increase but reduce the time to detect membership changes. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_BROADCASTDISPUTES`.                                                                     | true          |
| notifySuspect     | Configure whether to notify a suspect node on state changes. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_NOTIFYSUSPECT`.                                                                                                                                                                         | false         |
| gossipInterval    | Sets the interval at which the membership updates are sent to a random member. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_GOSSIPINTERVAL`.                                                                                                                                                      | 250ms         |
| gossipFanout      | Sets the number of members to which membership updates are sent at each gossip interval. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_GOSSIPFANOUT`.                                                                                                                                              | 2             |
| probeInterval     | Sets the interval at which to probe a random member. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_PROBEINTERVAL`.                                                                                                                                                                                 | 1s            |
| probeTimeout      | Sets the timeout for a probe response. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_PROBETIMEOUT`.                                                                                                                                                                                                | 100ms         |
| suspectProbes     | Sets the number of probes failed before declaring a member is suspect. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_SUSPECTPROBES`.                                                                                                                                                               | 3             |
| failureTimeout    | Sets the timeout for a suspect member is declared dead. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_FAILURETIMEOUT`.                                                                                                                                                                             | 10s           |
| syncInterval      | Sets the interval at which this member synchronizes its membership information with a random member. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERSHIP_SYNCINTERVAL`.                                                                                                                                  | 10s           |

#### YAML snippet

```yaml
membership:
  broadcastUpdates: false
  broadcastDisputes: true
  notifySuspect: false
  gossipInterval: 250ms
  gossipFanout: 2
  probeInterval: 1s
  probeTimeout: 100ms
  suspectProbes: 3
  failureTimeout: 10s
  syncInterval: 10s
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
