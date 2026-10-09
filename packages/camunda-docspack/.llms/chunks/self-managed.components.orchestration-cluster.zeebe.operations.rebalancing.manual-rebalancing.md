# Rebalancing — Manual rebalancing

Request rebalancing through the coordinated rebalancing API under `/cluster/v2/rebalance` using [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) credentials. Unlike an open election, this API transfers leadership for each partition directly to its highest-priority replica, one partition at a time, so at most one partition is affected at any moment.

Start a rebalance with `POST /cluster/v2/rebalance`:

```bash
curl -X POST https://{cluster-host}/cluster/v2/rebalance
```

Check the cluster's balance state and the progress of each partition with `GET /cluster/v2/rebalance`:

```bash
curl -X GET https://{cluster-host}/cluster/v2/rebalance
```

Stop a running rebalance once the transfer in flight has finished with `DELETE /cluster/v2/rebalance`:

```bash
curl -X DELETE https://{cluster-host}/cluster/v2/rebalance
```

To preview the plan a rebalance would carry out, without pausing any partition or moving any leadership, pass `dryRun=true`:

```bash
curl -X POST "https://{cluster-host}/cluster/v2/rebalance?dryRun=true"
```

Each partition reports how its transfer ended or why it was skipped (already led by the desired leader, replication lag too high, replication timed out, and so on).

A `POST /cluster/v2/rebalance` request accepts an optional JSON body to override the rebalancing parameters for the request. Any omitted parameters use the configured defaults:

```bash
curl -X POST https://{cluster-host}/cluster/v2/rebalance \
  -H 'Content-Type: application/json' \
  -d '{ "replicationLagThreshold": 8388608, "replicationTimeout": "PT10S", "maxTransferAttempts": 3, "leaderWaitTimeout": "PT1M" }'
```

- `replicationLagThreshold`: maximum replication lag, in bytes, a desired leader may have for its transfer to be accepted. Defaults to `8388608` (8 MB).
- `replicationTimeout`: an ISO-8601 duration for how long a partition may stay frozen waiting for its desired leader to catch up before the transfer is abandoned. Defaults to `PT10S` (10 seconds).
- `maxTransferAttempts`: how many times the current leader prompts the desired leader to take over before giving up. Defaults to `3`.
- `leaderWaitTimeout`: an ISO-8601 duration for how long the coordinator waits for a leaderless partition to elect a leader before reporting `NO_LEADER` and moving on. Defaults to `PT1M` (1 minute).

The default values for these parameters are configurable as broker options (see the [`camunda.cluster.raft.rebalance` properties reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#camundaclusterraftrebalance)).

**Note**

The previous `/actuator/rebalance` endpoint is deprecated but still available. It implements a simpler and more disruptive rebalancing mechanism by triggering simultaneous elections on all unbalanced partitions. This document otherwise describes only the behavior of the new rebalancing endpoint.

Track the rebalancing progress with `GET /cluster/v2/rebalance`, or by observing the `zeebe_cluster_rebalance_elapsed`, `zeebe_cluster_rebalance_partition_duration`, `zeebe_cluster_rebalance_partition_state`, and `zeebe_cluster_partition_balanced` [metrics](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics). The Zeebe Grafana dashboard has a dedicated `Rebalancing` section covering cluster balance, per-partition rebalance state and outcomes, and how long partitions stay paused for transfer.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing
