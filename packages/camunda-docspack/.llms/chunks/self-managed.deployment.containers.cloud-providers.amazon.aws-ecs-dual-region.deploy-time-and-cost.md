# Dual-region setup (ECS Fargate) — Deploy time and cost

Wall-clock time for a greenfield deploy to a first healthy `/v2/topology` response with eight brokers:

| Phase          | Wall clock             | What's slow                                                                                |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `vpc/ apply`   | 3–5 min                | VPC creation plus cross-region peering or Transit Gateway attachment.                      |
| `infra/ apply` | 15–20 min              | Aurora Global Database creation (primary first, then secondary attaches).                  |
| `app/ apply`   | ~30 s plan + 15–20 min | ECS service rollout waits for steady state; first cross-region Raft quorum takes the most. |
| **Total**      | **35–45 min**          |                                                                                            |

`terraform destroy` is faster: about 15–20 minutes end-to-end, with Aurora teardown again the bottleneck.

Actual costs depend on region, instance sizing, commit discounts, and cross-region data egress. Use the [AWS Pricing Calculator](https://calculator.aws/#/) to estimate for your configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
