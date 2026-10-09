# Zeebe API RPCs — `Topology` RPC

Obtains the current topology of the cluster the gateway is part of.

**Note**
The partition role can be one of `LEADER`, `FOLLOWER`, or `INACTIVE`, which [is defined here](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions#roles).

**Note**
The partition health can be one of `HEALTHY`, `UNHEALTHY`, or `DEAD`, which [is defined here](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/health).

### Input: `TopologyRequest`

```protobuf
message TopologyRequest {
}
```

### Output: `TopologyResponse`

```protobuf
message TopologyResponse {
  // list of brokers part of this cluster
  repeated BrokerInfo brokers = 1;
  // how many nodes are in the cluster
  int32 clusterSize = 2;
  // how many partitions are spread across the cluster
  int32 partitionsCount = 3;
  // configured replication factor for this cluster
  int32 replicationFactor = 4;
  // gateway version
  string gatewayVersion = 5;
  // the cluster's unique ID
  string clusterId = 6;
}

message BrokerInfo {
  // unique (within a cluster) node ID for the broker
  int32 nodeId = 1;
  // hostname of the broker
  string host = 2;
  // port for the broker
  int32 port = 3;
  // list of partitions managed or replicated on this broker
  repeated Partition partitions = 4;
  // broker version
  string version = 5;
}

message Partition {
  // Describes the Raft role of the broker for a given partition
  enum PartitionBrokerRole {
    LEADER = 0;
    FOLLOWER = 1;
    INACTIVE = 2;
  }

  // Describes the current health of the partition
  enum PartitionBrokerHealth {
    HEALTHY = 0;
    UNHEALTHY = 1;
    DEAD = 2;
  }

  // the unique ID of this partition
  int32 partitionId = 1;
  // the role of the broker for this partition
  PartitionBrokerRole role = 2;
  // the health of this partition
  PartitionBrokerHealth health = 3;
}
```

### Errors

No specific errors.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
