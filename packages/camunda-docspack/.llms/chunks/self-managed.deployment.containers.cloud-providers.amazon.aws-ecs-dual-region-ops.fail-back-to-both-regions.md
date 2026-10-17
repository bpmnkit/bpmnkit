# Dual-region operational procedure (ECS Fargate) — Fail back to both regions

When the lost region is available again, restore it:

1. If you failed over with `--keep-tasks`, scale the failed region's ECS services to zero once its AWS API responds again. `failback.sh` scales them back up in a later step.

   ```bash
   # Use REGION_1 and CLUSTER_1 if region 1 failed
   FAILED_REGION="${REGION_0}"
   FAILED_CLUSTER="${CLUSTER_0}"

   for service in $(aws ecs list-services --region "${FAILED_REGION}" --cluster "${FAILED_CLUSTER}" --query 'serviceArns[]' --output text); do
     aws ecs update-service --region "${FAILED_REGION}" --cluster "${FAILED_CLUSTER}" \
       --service "${service}" --desired-count 0 --no-cli-pager > /dev/null
   done
   ```

1. Run `failback.sh` against the recovered region:

   ```bash
   # Restore region 0 and re-add its zone
   ./procedure/failback.sh --failed-region 0

   # Also switch the Aurora writer back to region 0
   ./procedure/failback.sh --failed-region 0 --switch-writer
   ```

The script:

1. Prints the topology before the change.
1. Makes sure the recovered region's Aurora cluster is a member of the Aurora Global Database. If an unplanned recovery left it detached but intact, the script reattaches it. If the cluster was destroyed, recreate it with `terraform apply` in `terraform/infra` and run the script again.
1. Scales the recovered region's ECS services back up, to four orchestration cluster tasks and one Connectors task.
1. Waits for the recovered brokers to rejoin cluster membership.
1. Sends `POST /actuator/cluster/zones/<recovered-region>` with `numberOfReplicas`, `priority`, and `numberOfBrokers`, then waits for the partition redistribution to complete.
1. Verifies the expected broker count, that every partition has a leader, and that none of the recovered brokers is idle.
1. With `--switch-writer`, moves the Aurora writer back to the recovered region with a planned switchover.

| Option            | Default                                 | Effect                                                                                                                    |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `--switch-writer` | Off                                     | Moves the Aurora writer back to the recovered region after the zone is restored.                                          |
| `--dry-run`       | Off                                     | Sends the zone request with `dryRun=true` and prints the planned operations. ECS, the cluster, and Aurora aren't changed. |
| `--replicas N`    | `2`                                     | `numberOfReplicas` for the zone. Matches `replication_factor / 2` in `terraform/app/locals.tf`.                           |
| `--brokers N`     | `4`                                     | `numberOfBrokers` for the zone. Also sets the task count of the orchestration cluster service.                            |
| `--priority N`    | `1000` for region 0, `500` for region 1 | Zone `priority`. Matches `CAMUNDA_CLUSTER_PARTITIONING_ZONEAWARE_ZONES_*_PRIORITY` in `terraform/app/locals.tf`.          |

Keep the defaults unless you changed the cluster sizing in `terraform/app/locals.tf`.

After a successful failback, the topology summary that `failback.sh` prints shows eight brokers, eight partitions, 32 partition replicas, and a leader for every partition. Confirm the deployment is healthy in both regions:

```bash
./procedure/verify_dual_region.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops
