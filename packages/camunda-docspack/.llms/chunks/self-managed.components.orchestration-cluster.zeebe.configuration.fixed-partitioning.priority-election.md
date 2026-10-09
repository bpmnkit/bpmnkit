# Fixed partitioning — Priority election

If you're using the priority election feature, you must also specify the priorities of each broker. In fact, the broker will fail to start if the nodes do not have different priorities, as otherwise you may encounter lengthy election loops.

Here is the same example configuration as above, but this time with priorities configured:

```yaml
partitioning:
  scheme: FIXED
  fixed:
    - partitionId: 1
      nodes:
        - nodeId: 0
          priority: 1
        - nodeId: 2
          priority: 2
        - nodeId: 4
          priority: 3
    - partitionId: 2
      nodes:
        - nodeId: 1
          priority: 1
        - nodeId: 3
          priority: 3
        - nodeId: 4
          priority: 2
    - partitionId: 3
      nodes:
        - nodeId: 0
          priority: 3
        - nodeId: 2
          priority: 2
        - nodeId: 3
          priority: 1
```

**Note**
The only condition is that the priorities for the nodes of a given partition must be different from one another. We recommend, however, that you use a simple monotonic increase from 1 to the replica count, as shown above.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/fixed-partitioning
