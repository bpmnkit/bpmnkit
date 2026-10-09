# Dual-region setup (ECS Fargate) — Deployment walkthrough — Step 2 — Deploy VPC

```bash
cd terraform/vpc
terraform init -backend-config=../../backend.hcl \
  -backend-config="key=${TF_VAR_terraform_backend_key_prefix}vpc/terraform.tfstate"
terraform plan
terraform apply
```

- **Greenfield:** creates two VPCs, six subnets (three private and three public per region), NAT gateways, internet gateways, and the cross-region link. Expect 3–5 minutes.
- **BYO-VPC:** creates only the cross-region link and optional DNS resolver. Expect under 1 minute.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
