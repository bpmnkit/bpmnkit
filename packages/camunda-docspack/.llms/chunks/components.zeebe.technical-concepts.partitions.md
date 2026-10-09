# Partitions

Learn about partitions, which are persistent streams of process-related events.

In Zeebe, all data is organized into **partitions**. A **partition** is a persistent stream of process-related events.

In a cluster of brokers, partitions are distributed among the nodes so it can be thought of as a **shard**. When you bootstrap a Zeebe cluster, you can configure how many partitions you need.

**Note**
If you've worked with the [Apache Kafka System](https://kafka.apache.org/) before, the concepts presented on this page will sound very familiar to you.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions
