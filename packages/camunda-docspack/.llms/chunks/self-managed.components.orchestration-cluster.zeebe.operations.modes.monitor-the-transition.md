# Cluster mode — Monitor the transition

The mode change request returns before the transition completes. Track the transition after you send the request.

Query the [cluster topology](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api) to see the state of each broker's partitions:

```bash
curl 'http://localhost:8080/v2/topology'
```

While a broker is in recovery mode, its partitions report `role: inactive` and `state: recovering`. After the cluster returns to processing mode, each partition reports `role: leader` or `role: follower` and `state: active`.

You can also query the cluster management API on the management port (`9600` by default) to follow the change by its ID:

```bash
curl 'http://localhost:9600/orchestration/actuator/cluster'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/modes
