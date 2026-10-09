# Clustering

Zeebe can operate as a cluster of brokers, forming a peer-to-peer network.

Zeebe can operate as a cluster of brokers, forming a peer-to-peer network.

In this network, all brokers have the same responsibilities and there is no single point of failure.

![cluster](assets/cluster.png)


## Gossip membership protocol

Zeebe implements the [gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to know which brokers are currently part of the cluster.

The cluster is bootstrapped using a set of well-known bootstrap brokers, to which the others can connect. To achieve this, each broker must have at least one bootstrap broker as its initial contact point in their configuration:

```yaml
---
cluster:
  initialContactPoints: [node1.mycluster.loc:26502]
```

When a broker is connected to the cluster for the first time, it fetches the topology from the initial contact points and starts gossiping with the other brokers. Brokers keep cluster topology locally across restarts.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering
