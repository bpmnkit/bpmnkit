# Broker configuration — Configuration — camunda.cluster.membership

Configure parameters for the SWIM protocol used to propagate cluster membership information among brokers and gateways.

| Field              | Example Value | Description                                                                                                                                                                                                                                                                                                                        |
| ------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| broadcast-updates  | false         | Configure whether to broadcast member updates to all members. If set to `false`, updates are gossiped among members. If set to `true`, network traffic may increase, but membership changes are detected faster. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_BROADCASTUPDATES`. |
| broadcast-disputes | true          | Configure whether to broadcast disputes to all members. If set to `true`, network traffic may increase, but membership changes are detected faster. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_BROADCASTDISPUTES`.                                                             |
| notify-suspect     | false         | Configure whether to notify a suspect node on state changes. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_NOTIFYSUSPECT`.                                                                                                                                                        |
| gossip-interval    | 250ms         | Sets the interval at which membership updates are sent to a random member. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_GOSSIPINTERVAL`.                                                                                                                                         |
| gossip-fanout      | 2             | Sets the number of members to which membership updates are sent at each gossip interval. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_GOSSIPFANOUT`.                                                                                                                             |
| probe-interval     | 1s            | Sets the interval at which to probe a random member. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_PROBEINTERVAL`.                                                                                                                                                                |
| probe-timeout      | 100ms         | Sets the timeout for a probe response. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_PROBETIMEOUT`.                                                                                                                                                                               |
| suspect-probes     | 3             | Sets the number of failed probes before declaring a member suspect. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_SUSPECTPROBES`.                                                                                                                                                 |
| failure-timeout    | 10s           | Sets the timeout before a suspect member is declared dead. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_FAILURETIMEOUT`.                                                                                                                                                         |
| sync-interval      | 10s           | Sets the interval at which this member synchronizes its membership information with a random member. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_MEMBERSHIP_SYNCINTERVAL`.                                                                                                                 |

#### YAML snippet

```yaml
camunda:
  cluster:
    membership:
      broadcast-updates: false
      broadcast-disputes: true
      notify-suspect: false
      gossip-interval: 250ms
      gossip-fanout: 2
      probe-interval: 1s
      probe-timeout: 100ms
      suspect-probes: 3
      failure-timeout: 10s
      sync-interval: 10s
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
