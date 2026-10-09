# Partitions — Scalability

Use partitions to scale your process processing. Partitions are dynamically distributed in a Zeebe cluster and for each partition there is one leading broker at a time. This **leader** accepts requests and performs event processing for the partition. Let's assume you want to distribute process processing load over five machines; you can achieve that by bootstraping five or more partitions.

**Note**
While each partition has one leading broker, _not all brokers are guaranteed to lead a partition_. A broker can lead more than one partition, and, at times, a broker in a cluster may act only as a replication back-up for partitions. This broker will not be doing any active work on processes until a partition fail-over happens and the broker gets elected as the new leader for that partition.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions
