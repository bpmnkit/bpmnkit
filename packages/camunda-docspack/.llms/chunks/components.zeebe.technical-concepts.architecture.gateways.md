# Architecture — Gateways

A gateway serves as a single entry point to a Zeebe cluster and forwards requests to brokers.

The gateway is stateless and sessionless, and gateways can be added as necessary for load balancing and high availability.


## Brokers

The Zeebe Broker is the distributed workflow engine that tracks the state of active process instances.

Brokers can be partitioned for horizontal scalability and replicated for fault tolerance. A Zeebe deployment often consists of more than one broker.

It's important to note that no application business logic lives in the broker. Its only responsibilities are:

- Processing commands sent by clients
- Storing and managing the state of active process instances
- Assigning jobs to job workers

Brokers form a peer-to-peer network in which there is no single point of failure. This is possible because all brokers perform the same kind of tasks and the responsibilities of an unavailable broker are transparently reassigned in the network.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture
