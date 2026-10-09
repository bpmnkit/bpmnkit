# RDBMS benchmarking results

Benchmark results and methodology summary for using PostgreSQL as Orchestration Cluster secondary storage compared with Elasticsearch/OpenSearch.

This page summarizes current benchmark results for using PostgreSQL as Orchestration Cluster secondary storage.

Use these results as directional guidance, not strict guarantees. Actual performance depends on process complexity, hardware, database configuration, retention settings, and query patterns.


## Test scope and environment

Current published results are based on PostgreSQL benchmarking only.

### Scenarios tested

- **Single-task workload**: A process with one task.
- **Multi-step timer workload**: A 10-task process with multiple timers.
- **Complex business workload**: A process with call activities, subprocesses, and DMN.

### Baseline setup used in benchmark discussions

- Orchestration cluster: three nodes, three partitions.
- Orchestration resources: 3.5 CPU and 2 GB RAM per node.
- PostgreSQL: single-node containerized setup, typically 3-6 CPU and 6-8 GB RAM.
- Retention baseline used in several tests: TTL 60 minutes.

Published results currently reflect short-retention benchmark windows.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/rdbms-benchmark-results
