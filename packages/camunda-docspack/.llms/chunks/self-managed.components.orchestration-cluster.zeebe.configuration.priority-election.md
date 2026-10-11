# Priority election

An alternative to the default raft leader election.

Priority election is an alternative to the default raft leader election, where leader election is implemented by a random timer-based algorithm.

It aims to achieve a more uniform leader distribution by assigning each node a priority per partition and modifying the election algorithm to ensure nodes with higher priority have a higher chance of becoming leader.


## Configuration

Priority election is enabled by default. To enable or disable it explicitly, set `camunda.cluster.raft.priority-election-enabled` to `true` or `false` in your config, or set the equivalent environment variable `CAMUNDA_CLUSTER_RAFT_PRIORITYELECTIONENABLED`. For details, see [`camunda.cluster.raft`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#camundaclusterraft).

If you are using the fixed partitioning scheme (experimental), you may need [additional configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/fixed-partitioning#priority-election).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/priority-election
