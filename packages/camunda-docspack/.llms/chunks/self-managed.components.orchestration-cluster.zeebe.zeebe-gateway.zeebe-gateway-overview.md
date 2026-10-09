# Zeebe Gateway

Learn about this component and contact point of the Zeebe cluster which allows Zeebe clients to communicate with Zeebe brokers inside a Zeebe cluster.

The Zeebe Gateway is a component of the Zeebe cluster; it can be considered the contact point for the Zeebe cluster which allows Zeebe clients to communicate with Zeebe brokers inside a Zeebe cluster. For more information about the Zeebe Broker, visit our [additional documentation](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#brokers).

To summarize, the Zeebe Broker is the main part of the Zeebe cluster, which does all the heavy work like processing, replicating, exporting, and everything based on partitions. The Zeebe Gateway acts as a load balancer and router between Zeebe’s processing partitions.

![Zeebe Gateway overview](assets/zeebe-gateway-overview.png)

To interact with the Zeebe cluster, the Zeebe client sends a command to the gateway either as a gRPC message (to port `26500` by default), or a plain HTTP request to its REST API (to port `8080` by default). Given the gateway supports gRPC as well as an OpenAPI spec, the user can use several clients in different languages to interact with the Zeebe cluster. For more information, read our [overview](https://docs.camunda.io/docs/next/apis-tools/working-with-apis-tools).

**Note**
Be aware Zeebe brokers divide data into partitions (shards), and use RAFT for replication. Read more on RAFT [here](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering#raft-consensus-and-replication-protocol).

When the Zeebe Gateway receives a valid message, it is translated to an internal binary format and forwarded to one of the partition leaders inside the Zeebe cluster. The command type and values can determine to which partition the command is forwarded.

For example, creating a new process instance is sent in a round-robin fashion to the different partitions. If the command relates to an existing process instance, the command must be sent to the same partition where it was first created (determined by the key).

To determine the current leader for the corresponding partition, the gateway must maintain the topology of the Zeebe cluster. The gateway(s) and broker(s) form a cluster using gossip protocol to distribute information.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/zeebe-gateway-overview
