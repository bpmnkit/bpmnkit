# Broker configuration — Configuration — camunda.cluster

This section contains cluster-related configuration used to set up a Zeebe cluster.

| Field                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Example Value                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| node-id                | Specifies the unique ID of this broker node in a cluster. The ID should be between 0 and the number of nodes in the cluster (exclusive). This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NODEID`.                                                                                                                                                                                                                              | 0                                          |
| partition-count        | Controls the number of partitions that should exist in the cluster. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_PARTITIONCOUNT`.                                                                                                                                                                                                                                                                                           | 1                                          |
| replication-factor     | Controls the replication factor, which defines the number of replicas per partition. The replication factor cannot be greater than the number of nodes in the cluster. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_REPLICATIONFACTOR`.                                                                                                                                                                                     | 1                                          |
| size                   | Specifies the Zeebe cluster size. This value is used to determine which broker is responsible for which partition. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_SIZE`.                                                                                                                                                                                                                                                      | 1                                          |
| initial-contact-points | Specifies a list of known other nodes to connect to on startup. The contact points of the internal network configuration must be specified. The format is `[HOST:PORT]`. To help the cluster survive network partitions, all nodes must be specified as initial contact points. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_INITIALCONTACTPOINTS` with a comma-separated list of contact points. Default is an empty list. | [ 192.168.1.22:26502, 192.168.1.32:26502 ] |
| id                     | Unique identifier for the cluster. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_ID`.                                                                                                                                                                                                                                                                                                                                        | zeebe-cluster-123                          |
| name                   | Specifies a name for the cluster. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NAME`.                                                                                                                                                                                                                                                                                                                                       | zeebe-cluster                              |
| compression-algorithm  | Configure the compression algorithm for all messages sent between the gateway and brokers. Available options are `NONE`, `GZIP`, and `SNAPPY`. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_COMPRESSIONALGORITHM`.                                                                                                                                                                                                          | NONE                                       |

#### YAML snippet

```yaml
camunda:
  cluster:
    node-id: 0
    partition-count: 1
    replication-factor: 1
    size: 1
    initial-contact-points: []
    id: zeebe-cluster-123
    name: zeebe-cluster
    compression-algorithm: NONE
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
