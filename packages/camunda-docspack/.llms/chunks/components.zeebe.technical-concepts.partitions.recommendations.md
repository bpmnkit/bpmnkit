# Partitions — Recommendations

Choosing the number of partitions depends on the use case, workload, and cluster setup. Here are some rules of thumb:

- For testing and early development, start with a single partition. Note that Zeebe's process processing is highly optimized for efficiency, so a single partition can already handle high event loads.
- With a single Zeebe Broker, a single partition is usually enough. However, if the node has many cores and the broker is configured to use them, more partitions can increase the total throughput (around two threads per partition).
- Base your decisions on data. Simulate the expected workload, measure, and compare the performance of different partition setups.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions
