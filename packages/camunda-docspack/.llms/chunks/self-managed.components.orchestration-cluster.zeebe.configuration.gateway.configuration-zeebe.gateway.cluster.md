# Gateway configuration — Configuration — zeebe.gateway.cluster

As mentioned, the gateway needs to connect to the Zeebe brokers.

It is important to configure the cluster's initial contact point to the Zeebe brokers. You may set only one of the Zeebe brokers, but keep in mind that resiliency will be lower than using all the Zeebe brokers available. The corresponding environment variable is called `ZEEBE_GATEWAY_CLUSTER_INITIALCONTACTPOINTS`.

It is necessary to use the same cluster name for the broker and gateway. Otherwise, a connection will not be possible. The related configuration property is `zeebe.gateway.cluster.clusterName` and as an environment variable, it is called `ZEEBE_GATEWAY_CLUSTER_CLUSTERNAME`.

If you use the Helm charts, both properties are configured for you already.

| Field                | Description                                                                                                                                                                                                                                                                                                                                          | Example value                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| initialContactPoints | Sets initial contact points (brokers), which the gateway should contact. The contact points of the internal network configuration must be specified. The format is [HOST:PORT]. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_INITIALCONTACTPOINTS` specifying a comma-separated list of contact points. | [ 192.168.1.22:26502, 192.168.1.32:26502 ] |
| requestTimeout       | Sets the timeout of requests sent to the broker cluster. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_REQUESTTIMEOUT`.                                                                                                                                                                                  | 15s                                        |
| clusterName          | Sets name of the Zeebe cluster to connect to. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_CLUSTERNAME`.                                                                                                                                                                                                | zeebe-cluster                              |
| memberId             | Sets the member ID of the gateway in the cluster. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MEMBERID`. This is a deprecated property; use `camunda.cluster.gateway-id` instead.                                                                                                                      | gateway                                    |
| host                 | Sets the host the gateway node binds to for internal cluster communication. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_HOST`.                                                                                                                                                                         | 0.0.0.0                                    |
| port                 | Sets the port the gateway node binds to for internal cluster communication. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_PORT`.                                                                                                                                                                         | 26502                                      |
| advertisedHost       | Controls the advertised host; if omitted defaults to the host. This is particularly useful if your gateway stands behind a proxy. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_ADVERTISEDHOST`.                                                                                                         | 0.0.0.0                                    |
| advertisedPort       | Controls the advertised port; if omitted defaults to the port. This is particularly useful if your gateway stands behind a proxy. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_ADVERTISEDPORT`.                                                                                                         | 25602                                      |

#### YAML snippet

```yaml
cluster:
  initialContactPoints: 127.0.0.1:26502
  requestTimeout: 15s
  clusterName: zeebe-cluster
  memberId: gateway
  host: 0.0.0.0
  port: 26502
  advertisedHost: 0.0.0.0
  advertisedPort: 25602
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
