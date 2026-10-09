# Dual-region operational procedure (ECS Fargate) — Fail over to the surviving region

Run `failover.sh` against the region you lost:

```bash
./procedure/failover.sh --failed-region 0
```

The script:

1. Checks that the surviving region's gateway answers on `/v2/topology`, and prints the topology before the change.
1. Scales every ECS service in the failed region to zero tasks, then waits 30 seconds for its brokers to drop out of cluster membership.
1. Sends `DELETE /actuator/cluster/zones/<failed-region>?force=true` through the tunnel and waits for the change to complete.
1. If the Aurora writer is in the failed region, runs a planned switchover to the surviving region and returns only after the global cluster reports the switchover complete. See [Recover when the Aurora writer's region is lost](#recover-when-the-aurora-writers-region-is-lost) if that region's Aurora cluster is gone too.
1. Confirms the zone is gone from the partition distribution and that every partition has a leader.

After a successful failover, the cluster runs on the four brokers of the surviving region, with `clusterSize` 4 and `replicationFactor` 2.

| Option          | Effect                                                                                                                                                                                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dry-run`     | Sends the zone request with `dryRun=true` and prints the planned operations. ECS, the cluster, and Aurora aren't changed.                                                                                                                                                                                |
| `--keep-tasks`  | Skips the ECS scale-down and makes no AWS calls to the failed region, so the zone is removed directly through the Camunda management API. Use it when the failed region's tasks are already down or its AWS API doesn't respond. The surviving region's ECS and Systems Manager APIs must still respond. |
| `--keep-writer` | Skips the Aurora writer switchover. Use it when the failed region's Aurora cluster is gone.                                                                                                                                                                                                              |

`failover.sh` [forces the zone removal](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#remove-a-zone), so run it only when the failed region's brokers are stopped or can't reach the rest of the cluster, which `--keep-tasks` doesn't ensure.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops
