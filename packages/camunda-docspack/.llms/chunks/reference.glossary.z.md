# Glossary — Z

### Zeebe

Zeebe is a highly scalable, cloud-native workflow engine used to automate business processes. It acts as the core component of Camunda 8.

Zeebe is part of the [Orchestration Cluster](#orchestration-cluster) in Camunda 8.

The main components of Zeebe are:

- [Clients](#zeebe-client)
- [Gateways](#zeebe-gateway)
- [Brokers](#zeebe-broker)
- [Exporters](#zeebe-exporter)

A Zeebe deployment typically consists of multiple brokers and gateways, forming a [Zeebe cluster](#zeebe-cluster).

### Zeebe Broker

The Zeebe Broker is the distributed [workflow engine](#workflow-engine) that tracks the state of active [process instances](#process-instance). The Zeebe Broker is the main part of the [Zeebe cluster](#zeebe-cluster), which does all the heavy work like processing, replicating, exporting, and everything based on [partitions](#partition). A Zeebe deployment often consists of more than one broker. Brokers can be partitioned for horizontal scalability and replicated for fault tolerance.

- [Zeebe Broker](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#brokers)

### Zeebe Client

A Zeebe Client interacts with the [Zeebe Broker](#zeebe-broker) on behalf of the business application. Clients retrieve work from the [Zeebe cluster](#zeebe-cluster) via polling or job push.

- [Zeebe Client](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#clients)

### Zeebe cluster

A Zeebe cluster represents a configuration of one or more [brokers](#zeebe-broker) collaborating to execute [processes](#process). Each [broker](#zeebe-broker) in a cluster acts as a [leader](#leader) or a [follower](#follower).

- [Clustering](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering)

### Zeebe Exporter

The Zeebe Exporter system provides an event stream of state changes within Zeebe. It represents a sink to which Zeebe will submit all [records](#record) within the [log](#log). This gives users of Zeebe an opportunity to persist [records](#record) with the log for future use as this data will not be available after log compaction.

- [Zeebe Exporter](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#exporters)

### Zeebe Gateway

The Zeebe Gateway is a component of the [Zeebe cluster](#zeebe-cluster); it can be considered the contact point for the Zeebe cluster that allows [Zeebe clients](#zeebe-client) to communicate with [Zeebe brokers](#zeebe-broker) inside a Zeebe cluster.

- [Zeebe Gateway](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/zeebe-gateway-overview)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
