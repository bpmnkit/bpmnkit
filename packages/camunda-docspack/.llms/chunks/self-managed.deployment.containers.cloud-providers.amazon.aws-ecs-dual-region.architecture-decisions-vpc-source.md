# Dual-region setup (ECS Fargate) — Architecture decisions — VPC source

| Option     | `byo_vpc` value   | When to use                                                                                                                              |
| ---------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Greenfield | `false` (default) | Terraform creates two VPCs, subnets across three availability zones, NAT gateways, internet gateways, and the cross-region link.         |
| BYO-VPC    | `true`            | You supply existing VPCs and subnets. Terraform skips VPC creation but still provisions the cross-region link and optional DNS resolver. |

BYO-VPC is the preferred path for customers integrating with an existing AWS landing zone. Supply the following per region (replace `N` with `0` or `1`):

| Variable                           | Constraint                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `region_N_vpc_id`                  | Existing VPC ID (`vpc-xxxxxxxx`).                                                              |
| `region_N_vpc_cidr`                | CIDR of the existing VPC.                                                                      |
| `region_N_private_subnet_ids`      | At least three private subnet IDs in distinct AZs (used by ECS tasks and Aurora).              |
| `region_N_public_subnet_ids`       | At least three public subnet IDs in distinct AZs with an internet gateway route (used by ALB). |
| `region_N_private_route_table_ids` | At least one private route table ID per region (for cross-region routes).                      |

The full validation contract — including the plan-time checks that fail with a descriptive error when a constraint is missing — lives in [`terraform/vpc/README.md`](https://github.com/camunda/camunda-deployment-references/blob/main/aws/containers/ecs-dual-region-fargate/terraform/vpc/README.md) in the reference repository.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
