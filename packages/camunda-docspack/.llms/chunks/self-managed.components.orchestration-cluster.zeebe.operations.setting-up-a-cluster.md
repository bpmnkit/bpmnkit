# Setting up a Zeebe cluster

To set up a cluster, you need to adjust the `cluster` section in the Zeebe configuration file.

Below is a snippet of the default Zeebe configuration file:

```yaml
---
cluster:
  # This section contains all cluster related configurations, to setup a zeebe cluster

  # Specifies the unique id of this broker node in a cluster.
  # The id should be between 0 and number of nodes in the cluster (exclusive).
  #
  # This setting can also be overridden using the environment variable ZEEBE_BROKER_CLUSTER_NODEID.
  nodeId: 0

  # Controls the number of partitions, which should exist in the cluster.
  #
  # This can also be overridden using the environment variable ZEEBE_BROKER_CLUSTER_PARTITIONSCOUNT.
  partitionsCount: 1

  # Controls the replication factor, which defines the count of replicas per partition.
  # The replication factor cannot be greater than the number of nodes in the cluster.
  #
  # This can also be overridden using the environment variable ZEEBE_BROKER_CLUSTER_REPLICATIONFACTOR.
  replicationFactor: 1

  # Specifies the zeebe cluster size. This value is used to determine which broker
  # is responsible for which partition.
  #
  # This can also be overridden using the environment variable ZEEBE_BROKER_CLUSTER_CLUSTERSIZE.
  clusterSize: 1

  # Allows to specify a list of known other nodes to connect to on startup
  # The contact points of the internal network configuration must be specified.
  # The format is [HOST:PORT]
  # Example:
  # initialContactPoints : [ 192.168.1.22:26502, 192.168.1.32:26502 ]
  #
  # To guarantee the cluster can survive network partitions, all nodes must be specified
  # as initial contact points.
  #
  # This setting can also be overridden using the environment variable ZEEBE_BROKER_CLUSTER_INITIALCONTACTPOINTS
  # specifying a comma-separated list of contact points.
  # Default is empty list:
  initialContactPoints: []

  # Allows to specify a name for the cluster
  # This setting can also be overridden using the environment variable ZEEBE_BROKER_CLUSTER_CLUSTERNAME.
  # Example:
  clusterName: zeebe-cluster
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster
