# Broker configuration — Configuration — camunda.cluster.network

This section contains the network configuration. Particularly, it allows to configure the hosts and ports the broker should bind to. The broker exposes two sockets:

1. command: the socket which is used for gateway-to-broker communication
2. internal: the socket which is used for broker-to-broker communication

| Field                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Example Value |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| host                  | Controls the default host the broker should bind to. Can be overridden on a per-binding basis for the command API and internal API. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_HOST`.                                                                                                                                                                                                                             | 0.0.0.0       |
| advertised-host       | Controls the advertised host, which is the contact point advertised to other brokers. If omitted, it defaults to the host. This is particularly useful if your broker stands behind a proxy. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_ADVERTISEDHOST`.                                                                                                                                                          | 0.0.0.0       |
| port-offset           | If a port offset is set, it is added to all ports specified in the config or the default values. This is a shortcut to avoid specifying every port manually. The offset is added to the second-last position of the port, as Zeebe requires multiple ports. For example, a `port-offset` of `5` increments all ports by `50`, so `26500` becomes `26550`. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_PORTOFFSET`. | 0             |
| max-message-size      | Sets the maximum size of incoming and outgoing messages, such as commands and events. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_MAXMESSAGESIZE`.                                                                                                                                                                                                                                                                 | 4MB           |
| socket-receive-buffer | Sets the size of the socket receive buffer for the broker. If omitted, it defaults to `1MB`. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_SOCKETRECEIVEBUFFER`.                                                                                                                                                                                                                                                     | 4MB           |
| socket-send-buffer    | Sets the size of the socket send buffer for the broker. If omitted, it defaults to `1MB`. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_SOCKETSENDBUFFER`.                                                                                                                                                                                                                                                           | 4MB           |
| heartbeat-timeout     | Sets the timeout used for cluster network heartbeats. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_HEARTBEATTIMEOUT`.                                                                                                                                                                                                                                                                                               | 10s           |
| heartbeat-interval    | Sets the interval used for cluster network heartbeats. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_HEARTBEATINTERVAL`.                                                                                                                                                                                                                                                                                             | 250ms         |

#### YAML snippet

```yaml
camunda:
  cluster:
    network:
      host: 0.0.0.0
      advertised-host: 0.0.0.0
      port-offset: 0
      max-message-size: 4MB
      socket-receive-buffer: 4MB
      socket-send-buffer: 4MB
      heartbeat-timeout: 10s
      heartbeat-interval: 250ms
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
