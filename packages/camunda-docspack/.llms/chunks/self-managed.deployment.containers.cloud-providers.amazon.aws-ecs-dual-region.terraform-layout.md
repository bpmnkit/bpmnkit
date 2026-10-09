# Dual-region setup (ECS Fargate) — Terraform layout

The reference architecture splits infrastructure into three independent state layers. Deploy them in order; each layer reads the previous layer's outputs via `terraform_remote_state`.

```
terraform/
├── vpc/    ← VPCs + cross-region networking. Supports BYO-VPC.
├── infra/  ← Aurora Global, ECS clusters, ALB/NLBs, KMS, S3, secrets, IAM.
└── app/    ← Camunda task definitions + ECS services.
```

| Layer | Directory          | Contents                                                                                      | Change frequency |
| ----- | ------------------ | --------------------------------------------------------------------------------------------- | ---------------- |
| VPC   | `terraform/vpc/`   | VPCs, subnets, NAT gateways, Transit Gateway or VPC peering, optional Route 53 Resolver       | Low              |
| Infra | `terraform/infra/` | Aurora Global Database, ECS clusters, ALB, NLB, KMS, S3, EFS, Secrets Manager, IAM            | Low              |
| App   | `terraform/app/`   | Camunda orchestration cluster and Connectors task definitions, plus the matching ECS services | High             |

By default, the paths between layers are relative:

- `terraform/infra/` reads `../vpc/terraform.tfstate`.
- `terraform/app/` reads `../infra/terraform.tfstate`.

If you use S3 remote backends, override `vpc_state_path` in `terraform/infra/terraform.tfvars` and `infra_state_path` in `terraform/app/terraform.tfvars` to point to the correct S3 URIs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
