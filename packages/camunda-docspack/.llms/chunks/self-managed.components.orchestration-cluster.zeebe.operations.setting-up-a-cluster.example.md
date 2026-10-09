# Setting up a Zeebe cluster — Example

In this example, we will set up a Zeebe cluster with five brokers. Each broker needs to get a unique node id.

To scale well, we will bootstrap five partitions with a replication factor of three. For more information about this, take a look into the [clustering](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering) section.

The clustering setup will look like this:

![cluster](assets/example-setup-cluster.png)


## Configuration

The configuration of the first broker could look like this:

```yaml
---
cluster:
  nodeId: 0
  partitionsCount: 5
  replicationFactor: 3
  clusterSize: 5
  initialContactPoints:
    [
      ADDRESS_AND_PORT_OF_NODE_0,
      ADDRESS_AND_PORT_OF_NODE_1,
      ADDRESS_AND_PORT_OF_NODE_2,
      ADDRESS_AND_PORT_OF_NODE_3,
      ADDRESS_AND_PORT_OF_NODE_4,
    ]
```

For the other brokers, the configuration will slightly change:

```yaml
---
cluster:
  nodeId: NODE_ID
  partitionsCount: 5
  replicationFactor: 3
  clusterSize: 5
  initialContactPoints:
    [
      ADDRESS_AND_PORT_OF_NODE_0,
      ADDRESS_AND_PORT_OF_NODE_1,
      ADDRESS_AND_PORT_OF_NODE_2,
      ADDRESS_AND_PORT_OF_NODE_3,
      ADDRESS_AND_PORT_OF_NODE_4,
    ]
```

Each broker needs a unique node id. The ids should be in the range of zero and `clusterSize - 1`. You need to replace the `NODE_ID` placeholder with an appropriate value.

Additionally, the brokers need an initial contact point to start their gossip conversation. Make sure you use the address and **management port** of another broker. You need to replace the `ADDRESS_AND_PORT_OF_NODE_0` placeholder.

To guarantee a cluster can properly recover from network partitions, it is currently required that all nodes be specified as initial contact points. It is not necessary for a broker to list itself as an initial contact point, but it is safe to do so, and likely simpler
to maintain.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster
