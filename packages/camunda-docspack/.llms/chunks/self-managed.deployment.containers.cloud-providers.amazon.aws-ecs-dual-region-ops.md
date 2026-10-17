# Dual-region operational procedure (ECS Fargate)

Fail over from a lost region and fail back to both regions in the Camunda 8 dual-region reference architecture on AWS ECS Fargate.

This procedure removes a lost region from a [dual-region ECS Fargate deployment](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region) and adds it back once it recovers. It uses the [`failover.sh`](https://github.com/camunda/camunda-deployment-references/blob/main/aws/containers/ecs-dual-region-fargate/procedure/failover.sh) and [`failback.sh`](https://github.com/camunda/camunda-deployment-references/blob/main/aws/containers/ecs-dual-region-fargate/procedure/failback.sh) scripts from the reference repository. Failover is manual. No automated, health-check-driven failover is included.


## Zones API operations the scripts run

The Zeebe cluster is [zone-aware](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters), with one zone per AWS region, so the scripts restore [quorum after a region loss](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region#region-failure-and-recovery) by removing and re-adding a whole zone through the [Zones API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#zones-api):

| Script        | Request                                              |
| ------------- | ---------------------------------------------------- |
| `failover.sh` | `DELETE /actuator/cluster/zones/{zoneId}?force=true` |
| `failback.sh` | `POST /actuator/cluster/zones/{zoneId}`              |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops
