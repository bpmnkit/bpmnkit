# Introduction to Zeebe

Zeebe is the workflow engine powering Camunda 8. While written in Java, you do not need to be a Java developer to use Zeebe.

Zeebe is the process automation engine powering Camunda 8. While written in Java, you do not need to be a Java developer to use Zeebe.

A workflow engine is an essential part of any process automation tool. We call it an “engine” because it drives business processes from start to finish, no matter how complex the process and decision logic need to be.


## Why Zeebe?

Zeebe doesn’t rely on a central database, so there’s no performance bottleneck as process volumes increase. Deliver high throughput by distributing processing across nodes, or add cluster nodes to execute an unlimited number of processes at consistently low latency.

Zeebe distributes data across all brokers in a cluster with storage directly on the server filesystem. If one broker goes down, another can replace it with no data loss. This built-in replication mechanism ensures that Camunda can recover from machine or software failure with no human interaction, no data loss, and minimal downtime.

For documentation on deploying Zeebe as part of Camunda 8 Self-Managed, refer to the [deployment guide](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/overview).

---
Source: https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview
